const cron = require('node-cron');
const Scheme = require('../models/Scheme');
const GovernmentSchemesScraper = require('./governmentSchemesScraper');
const logger = require('../utlis/logger');
const crypto = require('crypto');

/**
 * Scheme Update Service
 * Handles:
 * - Scraping schemes from government portals
 * - Detecting new schemes
 * - Updating existing schemes
 * - Removing duplicates
 * - CRON job scheduling
 */

class SchemeUpdateService {
  constructor() {
    this.scraper = new GovernmentSchemesScraper();
    this.cronJob = null;
    this.isRunning = false;
  }

  /**
   * Generate hash for deduplication
   */
  generateSchemeHash(scheme) {
    const hashInput = `${scheme.title}-${scheme.link}-${scheme.source}`;
    return crypto.createHash('md5').update(hashInput).digest('hex');
  }

  /**
   * Check if scheme content has changed
   */
  contentHasChanged(oldScheme, newScheme) {
    return oldScheme.contentHash !== newScheme.contentHash;
  }

  /**
   * Fetch and update schemes from all sources
   */
  async updateSchemes() {
    if (this.isRunning) {
      logger.warn('Scheme update already in progress, skipping...');
      return { success: false, message: 'Update already in progress' };
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      logger.cronLog('schemeUpdate', 'Starting scheme update job');

      // Scrape from all sources
      const newSchemes = await this.scraper.scrapeAllSources();

      if (newSchemes.length === 0) {
        logger.warn('No schemes scraped from any source');
        return { success: false, message: 'No schemes scraped' };
      }

      // Process and save schemes
      const result = await this.processAndSaveSchemes(newSchemes);

      const duration = Date.now() - startTime;
      logger.cronLog('schemeUpdate', `Scheme update completed in ${duration}ms`, {
        result,
      });

      return { success: true, ...result, duration };
    } catch (error) {
      logger.error('Error in updateSchemes', {
        error: error.message,
        stack: error.stack,
      });
      return { success: false, message: 'Update job failed', error: error.message };
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Process and save schemes to database
   */
  async processAndSaveSchemes(newSchemes) {
    let added = 0;
    let updated = 0;
    let failed = 0;
    let duplicates = 0;

    const processedLinks = new Set();

    for (const scheme of newSchemes) {
      try {
        // Check for duplicates in this batch
        if (processedLinks.has(scheme.link)) {
          duplicates++;
          logger.debug('Duplicate scheme in batch', { link: scheme.link });
          continue;
        }

        processedLinks.add(scheme.link);

        // Check if scheme already exists in database
        const existingScheme = await Scheme.findOne({ link: scheme.link });

        if (existingScheme) {
          // Scheme exists - check if content changed
          if (this.contentHasChanged(existingScheme, scheme)) {
            // Update existing scheme
            existingScheme.title = scheme.title;
            existingScheme.description = scheme.description;
            existingScheme.category = scheme.category;
            existingScheme.eligibility = scheme.eligibility || existingScheme.eligibility;
            existingScheme.benefits = scheme.benefits || existingScheme.benefits;
            existingScheme.deadline = scheme.deadline || existingScheme.deadline;
            existingScheme.contactInfo = scheme.contactInfo || existingScheme.contactInfo;
            existingScheme.contentHash = scheme.contentHash;
            existingScheme.scrapeStatus = 'success';

            await existingScheme.save();
            updated++;

            logger.debug('Updated existing scheme', { title: scheme.title });
          } else {
            logger.debug('Scheme content unchanged', { title: scheme.title });
          }
        } else {
          // New scheme - add to database
          const newSchemeDoc = new Scheme({
            ...scheme,
            isNew: true,
            scrapeStatus: 'success',
          });

          await newSchemeDoc.save();
          added++;

          logger.debug('Added new scheme', {
            title: scheme.title,
            category: scheme.category,
          });

          // Trigger notification for new scheme (optional)
          await this.notifyNewScheme(newSchemeDoc);
        }
      } catch (error) {
        failed++;
        logger.error('Error processing individual scheme', {
          scheme: scheme.title,
          error: error.message,
        });
      }
    }

    return {
      total: newSchemes.length,
      added,
      updated,
      failed,
      duplicates,
    };
  }

  /**
   * Trigger notification for new scheme (integrate with your notification system)
   */
  async notifyNewScheme(scheme) {
    try {
      // This is a placeholder for integration with your push notification service
      // Uncomment and adjust based on your notification service implementation

      /*
      const Citizens = require('../models/Citizens');
      const { notifyNewScheme } = require('./pushNotificationService');

      // Send notification to all active citizens interested in this category
      const interestedCitizens = await Citizens.find({
        'preferences.interests': scheme.category,
        isActive: true,
      });

      if (interestedCitizens.length > 0) {
        await notifyNewScheme(scheme, interestedCitizens);
        logger.info('New scheme notification sent', {
          scheme: scheme.title,
          recipients: interestedCitizens.length,
        });
      }
      */

      logger.debug('New scheme added (notification would be sent here)', {
        scheme: scheme.title,
      });
    } catch (error) {
      logger.error('Error in notifyNewScheme', {
        error: error.message,
      });
    }
  }

  /**
   * Mark old schemes as not new (older than 7 days)
   */
  async markOldSchemesAsExisting() {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const result = await Scheme.updateMany(
        {
          isNew: true,
          createdAt: { $lt: sevenDaysAgo },
        },
        {
          isNew: false,
        }
      );

      logger.info('Marked old schemes as existing', {
        modifiedCount: result.modifiedCount,
      });

      return result;
    } catch (error) {
      logger.error('Error marking old schemes', {
        error: error.message,
      });
      return null;
    }
  }

  /**
   * Start CRON job to update schemes every 6 hours
   */
  startScheduledUpdates() {
    if (this.cronJob) {
      logger.warn('CRON job already running');
      return;
    }

    // Schedule job to run every 6 hours (0 0 0,6,12,18 * * *)
    // Alternative: Every 6 hours -> '0 */6 * * *' (at minute 0 of every 6th hour)
    this.cronJob = cron.schedule('0 0,6,12,18 * * *', async () => {
      logger.cronLog('schemeUpdate', 'CRON job triggered');
      await this.updateSchemes();
      // Mark schemes older than 7 days as not new
      await this.markOldSchemesAsExisting();
    });

    logger.info('Scheme update CRON job started (every 6 hours)');
  }

  /**
   * Alternative: Start CRON job with custom interval (for testing)
   */
  startScheduledUpdatesWithInterval(cronExpression) {
    if (this.cronJob) {
      logger.warn('CRON job already running');
      return;
    }

    this.cronJob = cron.schedule(cronExpression, async () => {
      logger.cronLog('schemeUpdate', 'Custom CRON job triggered');
      await this.updateSchemes();
      await this.markOldSchemesAsExisting();
    });

    logger.info(`Scheme update CRON job started with interval: ${cronExpression}`);
  }

  /**
   * Stop the CRON job
   */
  stopScheduledUpdates() {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
      logger.info('Scheme update CRON job stopped');
    } else {
      logger.warn('No active CRON job to stop');
    }
  }

  /**
   * Get CRON job status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      cronJobActive: this.cronJob !== null,
    };
  }

  /**
   * Manual trigger for testing
   */
  async triggerManualUpdate() {
    return await this.updateSchemes();
  }

  /**
   * Clean up old schemes (optional - delete schemes older than X days that haven't been updated)
   */
  async cleanupOldSchemes(daysOld = 90) {
    try {
      const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);

      const result = await Scheme.deleteMany({
        updatedAt: { $lt: cutoffDate },
      });

      logger.info(`Cleaned up old schemes older than ${daysOld} days`, {
        deletedCount: result.deletedCount,
      });

      return result;
    } catch (error) {
      logger.error('Error cleaning up old schemes', {
        error: error.message,
      });
      return null;
    }
  }
}

// Export singleton instance
module.exports = new SchemeUpdateService();
