const cron = require('node-cron');
const logger = require('../utlis/logger');
const schemeService = require('./schemeService');

/**
 * Cron Job Manager for Government Schemes Sync
 * Handles scheduling and execution of periodic scheme updates
 */

class SchemeCronJobs {
  constructor() {
    this.jobs = new Map();
  }

  /**
   * Initialize all cron jobs
   * Should be called once during application startup
   */
  initializeJobs() {
    try {
      logger.info('Initializing cron jobs for schemes sync');

      // Job 1: Sync Maharashtra schemes every 6 hours
      // Cron expression: 0 */6 * * * (at 00:00, 06:00, 12:00, 18:00)
      this.scheduleMaharashtraSchemesSync();

      logger.info('Cron jobs initialized successfully');
    } catch (error) {
      logger.error('Error initializing cron jobs', {
        error: error.message,
        stack: error.stack,
      });
    }
  }

  /**
   * Schedule Maharashtra schemes sync to run every 6 hours
   * Runs at: 12:00 AM, 6:00 AM, 12:00 PM, 6:00 PM (UTC+5:30 if server is in IST)
   */
  scheduleMaharashtraSchemesSync() {
    try {
      // Cron pattern: "0 */6 * * *"
      // Minute: 0
      // Hour: */6 (every 6 hours)
      // Day of month: * (every day)
      // Month: * (every month)
      // Day of week: * (every day of week)
      const task = cron.schedule('0 */6 * * *', async () => {
        try {
          logger.info('Cron job triggered: Maharashtra schemes sync');

          const result = await schemeService.syncMaharashtraSchemes();

          if (result.success) {
            logger.info('Maharashtra schemes sync cron job completed successfully', result);
          } else {
            logger.warn('Maharashtra schemes sync cron job completed with errors', result);
          }
        } catch (error) {
          logger.error('Error in Maharashtra schemes sync cron job', {
            error: error.message,
            stack: error.stack,
          });
        }
      });

      this.jobs.set('maharashtra-schemes-sync', task);

      logger.info(
        'Scheduled Maharashtra schemes sync cron job',
        'Running every 6 hours at 0, 6, 12, 18 UTC'
      );
    } catch (error) {
      logger.error('Error scheduling Maharashtra schemes sync', {
        error: error.message,
      });
    }
  }

  /**
   * Alternative: Schedule with custom cron expression
   * Useful for different sync frequencies in development vs production
   * @param {String} cronExpression - Cron expression (every 6 hours format: 0 asterisk asterisk 6 asterisk asterisk asterisk)
   * @param {String} jobName - Identifier for the job
   */
  scheduleCustom(cronExpression, jobName) {
    try {
      const task = cron.schedule(cronExpression, async () => {
        try {
          logger.info(`Cron job triggered: ${jobName}`);

          const result = await schemeService.syncMaharashtraSchemes();

          if (result.success) {
            logger.info(`${jobName} completed successfully`, result);
          } else {
            logger.warn(`${jobName} completed with errors`, result);
          }
        } catch (error) {
          logger.error(`Error in ${jobName}`, {
            error: error.message,
            stack: error.stack,
          });
        }
      });

      this.jobs.set(jobName, task);

      logger.info(`Scheduled custom cron job: ${jobName}`, {
        cronExpression,
      });
    } catch (error) {
      logger.error(`Error scheduling custom cron job: ${jobName}`, {
        error: error.message,
      });
    }
  }

  /**
   * Run the sync immediately (useful for manual triggers or testing)
   * @returns {Promise<Object>} Sync result
   */
  async runSyncNow() {
    try {
      logger.info('Running Maharashtra schemes sync immediately');

      const result = await schemeService.syncMaharashtraSchemes();

      return result;
    } catch (error) {
      logger.error('Error running immediate sync', {
        error: error.message,
      });

      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get status of all scheduled jobs
   * @returns {Object} Status information for each job
   */
  getJobsStatus() {
    try {
      const status = {};

      for (const [jobName, task] of this.jobs) {
        status[jobName] = {
          scheduled: task.status === 'scheduled',
          running: task.status === 'running',
        };
      }

      return status;
    } catch (error) {
      logger.error('Error getting jobs status', {
        error: error.message,
      });

      return {};
    }
  }

  /**
   * Stop a specific cron job
   * @param {String} jobName - Name of the job to stop
   */
  stopJob(jobName) {
    try {
      const task = this.jobs.get(jobName);

      if (task) {
        task.stop();
        logger.info(`Stopped cron job: ${jobName}`);
      } else {
        logger.warn(`Cron job not found: ${jobName}`);
      }
    } catch (error) {
      logger.error(`Error stopping cron job: ${jobName}`, {
        error: error.message,
      });
    }
  }

  /**
   * Stop all cron jobs
   * Useful for graceful shutdown
   */
  stopAllJobs() {
    try {
      for (const [jobName, task] of this.jobs) {
        task.stop();
        logger.info(`Stopped cron job: ${jobName}`);
      }

      logger.info('All cron jobs stopped');
    } catch (error) {
      logger.error('Error stopping all cron jobs', {
        error: error.message,
      });
    }
  }

  /**
   * Resume a specific cron job
   * @param {String} jobName - Name of the job to resume
   */
  resumeJob(jobName) {
    try {
      const task = this.jobs.get(jobName);

      if (task) {
        task.start();
        logger.info(`Resumed cron job: ${jobName}`);
      } else {
        logger.warn(`Cron job not found: ${jobName}`);
      }
    } catch (error) {
      logger.error(`Error resuming cron job: ${jobName}`, {
        error: error.message,
      });
    }
  }
}

// Export singleton instance
module.exports = new SchemeCronJobs();
