const axios = require('axios');
const cheerio = require('cheerio');
const crypto = require('crypto');
const logger = require('../utlis/logger');

/**
 * Government Schemes Scraper
 * Handles scraping from myScheme portal and MahaDBT portal
 * Extracts scheme details and normalizes data
 */

// Configuration for scrapers
const SCRAPERS_CONFIG = {
  myScheme: {
    baseUrl: 'https://www.myscheme.in',
    searchUrl: 'https://www.myscheme.in/search?category=farmer&state=maharashtra',
    timeout: 10000,
  },
  mahabdt: {
    baseUrl: 'https://www.mahabdt.gov.in',
    schemsUrl: 'https://www.mahabdt.gov.in/schemes',
    timeout: 10000,
  },
};

/**
 * Generate content hash for change detection
 */
function generateContentHash(content) {
  return crypto
    .createHash('md5')
    .update(JSON.stringify(content))
    .digest('hex');
}

/**
 * Scraper class for myScheme portal
 */
class MySchemeScaper {
  constructor() {
    this.source = 'myscheme';
    this.baseUrl = SCRAPERS_CONFIG.myScheme.baseUrl;
  }

  /**
   * Fetch schemes from myScheme portal
   */
  async scrapeSchemes() {
    try {
      logger.scrapeLog(
        this.source,
        'Starting scrape from myScheme portal'
      );

      const schemes = [];

      // For production, you would use real scraping logic
      // This is a template approach that needs adjustment based on actual HTML structure
      try {
        const response = await axios.get(
          SCRAPERS_CONFIG.myScheme.searchUrl,
          {
            timeout: SCRAPERS_CONFIG.myScheme.timeout,
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
          }
        );

        const $ = cheerio.load(response.data);

        // Example: Adjust selectors based on actual myScheme HTML structure
        // This is a template - actual selectors depend on the website structure
        const schemeElements = $('.scheme-card, .scheme-item, [data-scheme]');

        schemeElements.each((index, element) => {
          try {
            const $el = $(element);

            // Extract data - adjust selectors based on actual HTML
            const title =
              $el.find('.scheme-title, h3, [data-title]').text().trim() ||
              $el.find('a').first().text().trim();
            const description =
              $el.find('.scheme-desc, p, [data-desc]').text().trim() ||
              $el.find('.description').text().trim();
            const link =
              $el.find('a').first().attr('href') ||
              $el.attr('data-link') ||
              '';
            const category = $el
              .find('[data-category]')
              .attr('data-category') ||
              'farmer';

            // Validate extracted data
            if (!title || !link) {
              logger.debug('Skipping incomplete scheme element', { title, link });
              return;
            }

            // Normalize link to absolute URL
            const absoluteLink = link.startsWith('http')
              ? link
              : `${this.baseUrl}${link}`;

            const scheme = {
              title: title.substring(0, 500),
              description: description.substring(0, 5000),
              link: absoluteLink,
              category: this.normalizeCategory(category),
              state: 'Maharashtra',
              source: this.source,
              eligibility: $el.find('[data-eligibility]').text().trim() || '',
              benefits: $el.find('[data-benefits]').text().trim() || '',
              contactInfo: $el.find('[data-contact]').text().trim() || '',
            };

            // Only add if title and link exist
            if (scheme.title && scheme.link) {
              scheme.contentHash = generateContentHash(scheme);
              schemes.push(scheme);
            }
          } catch (error) {
            logger.debug('Error parsing individual scheme element', {
              error: error.message,
            });
          }
        });

        logger.scrapeLog(
          this.source,
          `Successfully scraped ${schemes.length} schemes`
        );
        return schemes;
      } catch (axiosError) {
        logger.error('Failed to fetch myScheme portal', {
          error: axiosError.message,
          status: axiosError.response?.status,
        });
        return [];
      }
    } catch (error) {
      logger.error('Error in MySchemeScaper.scrapeSchemes', {
        error: error.message,
        stack: error.stack,
      });
      return [];
    }
  }

  /**
   * Normalize category to standard enum values
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
      irrigation: 'irrigation',
      'soil health': 'soil_health',
      'organic farming': 'organic_farming',
      horticulture: 'horticulture',
    };

    const normalized = rawCategory.toLowerCase().trim();
    return categoryMap[normalized] || 'general';
  }
}

/**
 * Scraper class for MahaDBT portal
 */
class MahaDBTScraper {
  constructor() {
    this.source = 'mahabdt';
    this.baseUrl = SCRAPERS_CONFIG.mahabdt.baseUrl;
  }

  /**
   * Fetch schemes from MahaDBT portal
   */
  async scrapeSchemes() {
    try {
      logger.scrapeLog(
        this.source,
        'Starting scrape from MahaDBT portal'
      );

      const schemes = [];

      try {
        const response = await axios.get(
          SCRAPERS_CONFIG.mahabdt.schemsUrl,
          {
            timeout: SCRAPERS_CONFIG.mahabdt.timeout,
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
          }
        );

        const $ = cheerio.load(response.data);

        // Example: Adjust selectors based on actual MahaDBT HTML structure
        const schemeElements = $('.dbt-scheme, .scheme-box, [data-scheme]');

        schemeElements.each((index, element) => {
          try {
            const $el = $(element);

            const title =
              $el.find('.scheme-name, h4, [data-name]').text().trim() ||
              $el.find('a').first().text().trim();
            const description =
              $el.find('.scheme-info, p, [data-info]').text().trim() ||
              $el.find('.details').text().trim();
            const link =
              $el.find('a').first().attr('href') ||
              $el.attr('data-url') ||
              '';

            if (!title || !link) {
              logger.debug('Skipping incomplete MahaDBT scheme', { title, link });
              return;
            }

            const absoluteLink = link.startsWith('http')
              ? link
              : `${this.baseUrl}${link}`;

            // Try to extract category from scheme details or default to agriculture
            const category =
              $el.find('[data-category]').attr('data-category') ||
              $el.find('.category').text().trim() ||
              'agriculture';

            const scheme = {
              title: title.substring(0, 500),
              description: description.substring(0, 5000),
              link: absoluteLink,
              category: this.normalizeCategory(category),
              state: 'Maharashtra',
              source: this.source,
              eligibility: $el.find('[data-eligible]').text().trim() || '',
              benefits: $el.find('[data-benefit]').text().trim() || '',
              deadline: $el.find('[data-deadline]').text().trim() || null,
              contactInfo: $el.find('[data-contact]').text().trim() || '',
            };

            if (scheme.title && scheme.link) {
              scheme.contentHash = generateContentHash(scheme);
              schemes.push(scheme);
            }
          } catch (error) {
            logger.debug('Error parsing MahaDBT scheme element', {
              error: error.message,
            });
          }
        });

        logger.scrapeLog(
          this.source,
          `Successfully scraped ${schemes.length} schemes`
        );
        return schemes;
      } catch (axiosError) {
        logger.error('Failed to fetch MahaDBT portal', {
          error: axiosError.message,
          status: axiosError.response?.status,
        });
        return [];
      }
    } catch (error) {
      logger.error('Error in MahaDBTScraper.scrapeSchemes', {
        error: error.message,
        stack: error.stack,
      });
      return [];
    }
  }

  /**
   * Normalize category to standard enum values
   */
  normalizeCategory(rawCategory) {
    const categoryMap = {
      farmer: 'farmer',
      agriculture: 'agriculture',
      subsidy: 'subsidy',
      loan: 'loan',
      'agricultural loan': 'loan',
      insurance: 'insurance',
      'crop insurance': 'insurance',
      training: 'training',
      marketing: 'marketing',
      'animal husbandry': 'animal_husbandry',
      dairy: 'animal_husbandry',
      'dairy farming': 'animal_husbandry',
      irrigation: 'irrigation',
      'soil health': 'soil_health',
      'organic farming': 'organic_farming',
      horticulture: 'horticulture',
      women: 'women',
      rural: 'rural',
    };

    const normalized = rawCategory.toLowerCase().trim();
    return categoryMap[normalized] || 'agriculture';
  }
}

/**
 * Master scraper class that orchestrates all scraping operations
 */
class GovernmentSchemesScraper {
  constructor() {
    this.mySchemeScaper = new MySchemeScaper();
    this.mahaDBTScaper = new MahaDBTScraper();
  }

  /**
   * Scrape all sources in parallel
   */
  async scrapeAllSources() {
    try {
      logger.info('Starting parallel scraping from all sources');

      const [mySchemeResults, mahaDBTResults] = await Promise.allSettled([
        this.mySchemeScaper.scrapeSchemes(),
        this.mahaDBTScaper.scrapeSchemes(),
      ]).then((results) =>
        results.map((result) =>
          result.status === 'fulfilled' ? result.value : []
        )
      );

      const allSchemes = [...mySchemeResults, ...mahaDBTResults];

      logger.info(`Total schemes scraped: ${allSchemes.length}`, {
        myScheme: mySchemeResults.length,
        mahaDBT: mahaDBTResults.length,
      });

      return allSchemes;
    } catch (error) {
      logger.error('Error in scrapeAllSources', {
        error: error.message,
        stack: error.stack,
      });
      return [];
    }
  }

  /**
   * Scrape from a specific source
   */
  async scrapeFromSource(source) {
    try {
      if (source === 'myscheme') {
        return await this.mySchemeScaper.scrapeSchemes();
      } else if (source === 'mahabdt') {
        return await this.mahaDBTScaper.scrapeSchemes();
      } else {
        logger.warn(`Unknown source: ${source}`);
        return [];
      }
    } catch (error) {
      logger.error(`Error scraping from source: ${source}`, {
        error: error.message,
      });
      return [];
    }
  }
}

module.exports = GovernmentSchemesScraper;
