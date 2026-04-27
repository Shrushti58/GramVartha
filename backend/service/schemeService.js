const axios = require('axios');
const crypto = require('crypto');
const logger = require('../utlis/logger');
const Scheme = require('../models/Scheme');

/**
 * Production-Grade Government Schemes Service
 * Fetches schemes from myScheme portal using Next.js JSON API
 * Implements pagination, caching, retry logic, and change detection
 */

class SchemeService {
  constructor() {
    this.baseUrl = 'https://www.myscheme.gov.in';
    this.homepage = `${this.baseUrl}/en`;
    this.buildIdCache = null;
    this.buildIdCacheTime = null;
    this.buildIdCacheDuration = 60 * 60 * 1000; // 1 hour in milliseconds
    this.maxRetries = 2;
    this.retryDelay = 2000; // 2 seconds
    this.requestTimeout = 15000; // 15 seconds
    this.maxPages = 5;
  }

  /**
   * Generate content hash for change detection
   * @param {Object} content - Content object to hash
   * @returns {String} MD5 hash
   */
  generateContentHash(content) {
    try {
      const hashInput = JSON.stringify({
        title: content.title,
        description: content.shortDescription || content.description,
        link: content.link || content.slug,
      });

      return crypto
        .createHash('md5')
        .update(hashInput)
        .digest('hex');
    } catch (error) {
      logger.error('Error generating content hash', { error: error.message });
      return null;
    }
  }

  /**
   * Extract buildId from myScheme homepage using regex
   * BuildId is required to construct Next.js API URLs
   * Implements caching to avoid unnecessary homepage requests
   * @returns {Promise<String>} The buildId
   */
  async extractBuildId() {
    try {
      // Check cache first
      if (
        this.buildIdCache &&
        this.buildIdCacheTime &&
        Date.now() - this.buildIdCacheTime < this.buildIdCacheDuration
      ) {
        logger.debug('Using cached buildId', { buildId: this.buildIdCache });
        return this.buildIdCache;
      }

      logger.debug('Fetching fresh buildId from homepage');

      const response = await axios.get(this.homepage, {
        timeout: this.requestTimeout,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        },
      });

      // Extract buildId from HTML using regex
      // Next.js stores buildId in __NEXT_DATA__ script tag or as a query parameter in JS bundle URLs
      const buildIdMatch = response.data.match(/"buildId":"([^"]+)"/);

      if (!buildIdMatch || !buildIdMatch[1]) {
        throw new Error('Could not extract buildId from myScheme homepage');
      }

      this.buildIdCache = buildIdMatch[1];
      this.buildIdCacheTime = Date.now();

      logger.info('Successfully extracted buildId from homepage', {
        buildId: this.buildIdCache,
      });

      return this.buildIdCache;
    } catch (error) {
      logger.error('Error extracting buildId from homepage', {
        error: error.message,
        url: this.homepage,
      });

      // Fallback: If we have a cached buildId, return it even if expired
      if (this.buildIdCache) {
        logger.warn('Falling back to expired cached buildId');
        return this.buildIdCache;
      }

      throw new Error('Failed to extract buildId and no cache available');
    }
  }

  /**
   * Make HTTP request with retry logic
   * @param {String} url - URL to fetch
   * @param {Object} options - Axios options
   * @param {Number} retryCount - Current retry attempt (default: 0)
   * @returns {Promise<Object>} Response data
   */
  async makeRequestWithRetry(url, options = {}, retryCount = 0) {
    try {
      const defaultHeaders = {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'x-nextjs-data': '1',
      };

      const config = {
        timeout: this.requestTimeout,
        headers: { ...defaultHeaders, ...options.headers },
        ...options,
      };

      const response = await axios.get(url, config);
      return response.data;
    } catch (error) {
      if (retryCount < this.maxRetries) {
        logger.warn(`Request failed, retrying... (${retryCount + 1}/${this.maxRetries})`, {
          url,
          error: error.message,
        });

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, this.retryDelay));

        return this.makeRequestWithRetry(url, options, retryCount + 1);
      }

      logger.error(`Request failed after ${this.maxRetries} retries`, {
        url,
        error: error.message,
        status: error.response?.status,
      });

      throw error;
    }
  }

  /**
   * Fetch schemes from myScheme for specific page
   * @param {String} buildId - Next.js buildId
   * @param {Number} page - Page number (1-based)
   * @returns {Promise<Array>} Array of schemes
   */
  async fetchSchemesPage(buildId, page = 1) {
    try {
      // Construct Next.js API URL
      const apiUrl =
        `${this.baseUrl}/_next/data/${buildId}/en/search.json` +
        `?category=farmer&state=maharashtra&page=${page}`;

      logger.debug('Fetching schemes page', { page, apiUrl });

      const data = await this.makeRequestWithRetry(apiUrl);

      // Extract schemes from Next.js response structure
      // pageProps.searchResults contains the array of schemes
      const schemes = data?.pageProps?.searchResults || [];

      if (!Array.isArray(schemes)) {
        logger.warn('Unexpected response structure for schemes', {
          page,
          dataKeys: Object.keys(data?.pageProps || {}),
        });
        return [];
      }

      logger.debug(`Retrieved ${schemes.length} schemes from page ${page}`);

      return schemes;
    } catch (error) {
      logger.error('Error fetching schemes page', {
        page,
        error: error.message,
      });

      return [];
    }
  }

  /**
   * Fetch and process schemes from all pages with pagination
   * Implements deduplication using slug/link
   * @returns {Promise<Array>} Array of processed schemes
   */
  async fetchMaharashtraSchemes() {
    try {
      logger.info('Starting Maharashtra schemes fetch');

      // Step 1: Extract buildId
      let buildId;
      try {
        buildId = await this.extractBuildId();
      } catch (error) {
        logger.error('Critical: Could not extract buildId', { error: error.message });
        return [];
      }

      // Step 2: Fetch schemes from multiple pages
      const allSchemes = [];
      const seenSlugs = new Set(); // For deduplication

      for (let page = 1; page <= this.maxPages; page++) {
        try {
          const pageSchemes = await this.fetchSchemesPage(buildId, page);

          if (pageSchemes.length === 0) {
            logger.info(`No more schemes found after page ${page - 1}`);
            break; // Stop if no schemes on this page
          }

          // Process and deduplicate schemes
          for (const scheme of pageSchemes) {
            try {
              const processedScheme = this.normalizeScheme(scheme);

              // Skip if duplicate
              if (seenSlugs.has(processedScheme.link)) {
                logger.debug('Skipping duplicate scheme', {
                  link: processedScheme.link,
                });
                continue;
              }

              seenSlugs.add(processedScheme.link);
              allSchemes.push(processedScheme);
            } catch (parseError) {
              logger.warn('Error processing individual scheme', {
                error: parseError.message,
                page,
              });
              continue;
            }
          }

          logger.info(`Processed page ${page}`, {
            schemsThisPage: pageSchemes.length,
            totalUnique: allSchemes.length,
          });
        } catch (pageError) {
          logger.error(`Error fetching page ${page}`, {
            error: pageError.message,
          });
          // Continue to next page on error
          continue;
        }
      }

      logger.info('Completed fetching all pages', {
        totalSchemes: allSchemes.length,
      });

      return allSchemes;
    } catch (error) {
      logger.error('Critical error in fetchMaharashtraSchemes', {
        error: error.message,
        stack: error.stack,
      });

      return [];
    }
  }

  /**
   * Normalize raw scheme data from API into standard format
   * @param {Object} rawScheme - Raw scheme from API
   * @returns {Object} Normalized scheme object
   */
  normalizeScheme(rawScheme) {
    try {
      // Extract fields from API response
      const title = (rawScheme.title || rawScheme.name || '').trim().substring(0, 500);
      const description = (
        rawScheme.shortDescription ||
        rawScheme.description ||
        ''
      )
        .trim()
        .substring(0, 5000);
      const slug = rawScheme.slug || rawScheme.url || '';
      const category = this.normalizeCategory(rawScheme.category || 'farmer');

      // Construct full URL from slug if needed
      let link = slug;
      if (slug && !slug.startsWith('http')) {
        link = `${this.baseUrl}/en/${slug}`;
      }

      if (!title || !link) {
        throw new Error('Missing required fields: title or link');
      }

      const normalized = {
        title,
        description,
        link,
        category,
        state: 'Maharashtra',
        source: 'myscheme',
        eligibility: (rawScheme.eligibility || '').substring(0, 2000),
        benefits: (rawScheme.benefits || '').substring(0, 2000),
        contactInfo: (rawScheme.contactInfo || '').substring(0, 500),
        imageUrl: rawScheme.imageUrl || null,
      };

      // Generate content hash for change detection
      normalized.contentHash = this.generateContentHash(normalized);

      return normalized;
    } catch (error) {
      logger.error('Error normalizing scheme', {
        error: error.message,
        rawScheme: rawScheme?.title || 'unknown',
      });

      throw error;
    }
  }

  /**
   * Normalize category to standard enum values
   * @param {String} rawCategory - Raw category from API
   * @returns {String} Normalized category
   */
  normalizeCategory(rawCategory) {
    const categoryMap = {
      farmer: 'farmer',
      rural: 'rural',
      women: 'women',
      agriculture: 'agriculture',
      subsidy: 'subsidy',
      loan: 'loan',
      insurance: 'insurance',
      training: 'training',
      marketing: 'marketing',
      'animal husbandry': 'animal_husbandry',
      'animal_husbandry': 'animal_husbandry',
      irrigation: 'irrigation',
      'soil health': 'soil_health',
      'soil_health': 'soil_health',
      'organic farming': 'organic_farming',
      'organic_farming': 'organic_farming',
      horticulture: 'horticulture',
    };

    const normalized = rawCategory.toLowerCase().trim();
    return categoryMap[normalized] || 'farmer';
  }

  /**
   * Update database with fetched schemes
   * - Insert new schemes with isNew = true
   * - Update existing schemes if content hash changed
   * - Skip unchanged schemes
   * @param {Array} fetchedSchemes - Schemes fetched from API
   * @returns {Promise<Object>} Statistics about updates
   */
  async updateDatabase(fetchedSchemes) {
    try {
      logger.info('Starting database update', {
        totalSchemes: fetchedSchemes.length,
      });

      const stats = {
        inserted: 0,
        updated: 0,
        skipped: 0,
        errors: 0,
      };

      for (const scheme of fetchedSchemes) {
        try {
          // Check if scheme exists
          const existingScheme = await Scheme.findOne({ link: scheme.link });

          if (!existingScheme) {
            // New scheme: insert with isNew = true
            await Scheme.create({
              ...scheme,
              isNew: true,
            });

            stats.inserted++;
            logger.debug('Inserted new scheme', {
              title: scheme.title,
              link: scheme.link,
            });
          } else if (
            existingScheme.contentHash &&
            existingScheme.contentHash !== scheme.contentHash
          ) {
            // Content changed: update the scheme
            await Scheme.findByIdAndUpdate(
              existingScheme._id,
              {
                ...scheme,
                isNew: false, // Keep it as not-new since it already existed
              },
              { new: true }
            );

            stats.updated++;
            logger.debug('Updated existing scheme', {
              title: scheme.title,
              link: scheme.link,
            });
          } else {
            // No changes: skip
            stats.skipped++;
            logger.debug('Skipped unchanged scheme', {
              title: scheme.title,
              link: scheme.link,
            });
          }
        } catch (schemeError) {
          stats.errors++;
          logger.error('Error updating individual scheme', {
            title: scheme.title,
            error: schemeError.message,
          });

          // Continue processing other schemes on error
          continue;
        }
      }

      logger.info('Database update completed', stats);

      return stats;
    } catch (error) {
      logger.error('Critical error in updateDatabase', {
        error: error.message,
        stack: error.stack,
      });

      throw error;
    }
  }

  /**
   * Main orchestration method: Fetch schemes and update database
   * This is the method called by cron jobs and controllers
   * @returns {Promise<Object>} Result with fetched and update stats
   */
  async syncMaharashtraSchemes() {
    const startTime = Date.now();

    try {
      logger.info('Starting Maharashtra schemes sync');

      // Fetch schemes from API
      const fetchedSchemes = await this.fetchMaharashtraSchemes();

      if (fetchedSchemes.length === 0) {
        logger.warn('No schemes fetched from API');
        return {
          success: false,
          message: 'No schemes fetched',
          fetched: 0,
          stats: null,
          duration: Date.now() - startTime,
        };
      }

      // Update database
      const stats = await this.updateDatabase(fetchedSchemes);

      const duration = Date.now() - startTime;

      logger.info('Maharashtra schemes sync completed', {
        ...stats,
        duration,
      });

      return {
        success: true,
        message: 'Sync completed successfully',
        fetched: fetchedSchemes.length,
        stats,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      logger.error('Critical error in syncMaharashtraSchemes', {
        error: error.message,
        stack: error.stack,
        duration,
      });

      return {
        success: false,
        message: 'Sync failed',
        error: error.message,
        duration,
      };
    }
  }

  /**
   * Fetch schemes for a specific category
   * Useful for controllers and APIs
   * @param {String} category - Category filter
   * @param {Number} limit - Number of results
   * @returns {Promise<Array>} Array of schemes
   */
  async getSchemesByCategory(category, limit = 20) {
    try {
      const schemes = await Scheme.find({
        category,
        state: 'Maharashtra',
        source: 'myscheme',
      })
        .sort({ createdAt: -1 })
        .limit(limit);

      return schemes;
    } catch (error) {
      logger.error('Error fetching schemes by category', {
        category,
        error: error.message,
      });

      return [];
    }
  }

  /**
   * Get new schemes added in the last N days
   * @param {Number} days - Number of days
   * @returns {Promise<Array>} Array of new schemes
   */
  async getNewSchemes(days = 7) {
    try {
      const dateThreshold = new Date();
      dateThreshold.setDate(dateThreshold.getDate() - days);

      const schemes = await Scheme.find({
        createdAt: { $gte: dateThreshold },
        isNew: true,
        state: 'Maharashtra',
        source: 'myscheme',
      })
        .sort({ createdAt: -1 });

      return schemes;
    } catch (error) {
      logger.error('Error fetching new schemes', {
        days,
        error: error.message,
      });

      return [];
    }
  }

  /**
   * Search schemes by keyword
   * @param {String} keyword - Search keyword
   * @param {Number} limit - Number of results
   * @returns {Promise<Array>} Array of matching schemes
   */
  async searchSchemes(keyword, limit = 20) {
    try {
      const schemes = await Scheme.find(
        {
          $text: { $search: keyword },
          state: 'Maharashtra',
          source: 'myscheme',
        },
        { score: { $meta: 'textScore' } }
      )
        .sort({ score: { $meta: 'textScore' } })
        .limit(limit);

      return schemes;
    } catch (error) {
      logger.error('Error searching schemes', {
        keyword,
        error: error.message,
      });

      return [];
    }
  }
}

module.exports = new SchemeService();
