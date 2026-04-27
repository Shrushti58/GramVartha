const Scheme = require('../models/Scheme');
const schemeUpdateService = require('../service/schemeUpdateService');
const myschemeSyncService = require('../services/myschemeSyncService');
const schemeCronJobs = require('../service/schemeCronJobs');
const logger = require('../utlis/logger');

/**
 * Scheme Controller
 * Handles all scheme-related API endpoints
 */

/**
 * GET /schemes - Get all schemes with optional filters
 * Query parameters:
 *  - category: Filter by category (e.g., farmer, rural, women)
 *  - state: Filter by state (default: Maharashtra)
 *  - source: Filter by source (myscheme, mahabdt)
 *  - page: Page number for pagination (default: 1)
 *  - limit: Items per page (default: 20)
 *  - sortBy: Sort field (default: createdAt)
 *  - sortOrder: asc or desc (default: desc)
 */
const getAllSchemes = async (req, res) => {
  try {
    const {
      category,
      state = 'Maharashtra',
      source,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    // Build filter object
    const filter = { state };

    if (category) {
      filter.category = category;
    }

    if (source) {
      filter.source = source;
    }

    // Parse pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20)); // Max 100 items per page
    const skip = (pageNum - 1) * limitNum;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query
    const schemes = await Scheme.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count
    const total = await Scheme.countDocuments(filter);

    logger.debug('Retrieved all schemes', {
      count: schemes.length,
      filter,
      page: pageNum,
      limit: limitNum,
    });

    res.status(200).json({
      success: true,
      data: {
        schemes,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    logger.error('Error in getAllSchemes', {
      error: error.message,
      query: req.query,
    });

    res.status(500).json({
      success: false,
      message: 'Error fetching schemes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * GET /schemes/new - Get only new schemes
 * Returns schemes marked as isNew = true
 */
const getNewSchemes = async (req, res) => {
  try {
    const {
      category,
      source,
      page = 1,
      limit = 20,
    } = req.query;

    // Build filter for new schemes
    const filter = { isNew: true, state: 'Maharashtra' };

    if (category) {
      filter.category = category;
    }

    if (source) {
      filter.source = source;
    }

    // Parse pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    // Get new schemes sorted by newest first
    const schemes = await Scheme.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Scheme.countDocuments(filter);

    logger.debug('Retrieved new schemes', {
      count: schemes.length,
      filter,
    });

    res.status(200).json({
      success: true,
      data: {
        schemes,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    logger.error('Error in getNewSchemes', {
      error: error.message,
    });

    res.status(500).json({
      success: false,
      message: 'Error fetching new schemes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * GET /schemes/by-category/:category - Get schemes by specific category
 */
const getSchemesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Validate category
    const validCategories = [
      'farmer',
      'rural',
      'women',
      'agriculture',
      'subsidy',
      'loan',
      'insurance',
      'training',
      'marketing',
      'animal_husbandry',
      'irrigation',
      'soil_health',
      'organic_farming',
      'horticulture',
      'general',
    ];

    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Valid categories: ${validCategories.join(', ')}`,
      });
    }

    // Parse pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    // Get schemes by category
    const schemes = await Scheme.find({
      category,
      state: 'Maharashtra',
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Scheme.countDocuments({
      category,
      state: 'Maharashtra',
    });

    logger.debug('Retrieved schemes by category', {
      category,
      count: schemes.length,
    });

    res.status(200).json({
      success: true,
      data: {
        category,
        schemes,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    logger.error('Error in getSchemesByCategory', {
      error: error.message,
      category: req.params.category,
    });

    res.status(500).json({
      success: false,
      message: 'Error fetching schemes by category',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * GET /schemes/by-source/:source - Get schemes by source
 */
const getSchemesBySource = async (req, res) => {
  try {
    const { source } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Validate source
    const validSources = ['myscheme', 'mahabdt', 'other'];

    if (!validSources.includes(source)) {
      return res.status(400).json({
        success: false,
        message: `Invalid source. Valid sources: ${validSources.join(', ')}`,
      });
    }

    // Parse pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    // Get schemes by source
    const schemes = await Scheme.find({
      source,
      state: 'Maharashtra',
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Scheme.countDocuments({
      source,
      state: 'Maharashtra',
    });

    logger.debug('Retrieved schemes by source', {
      source,
      count: schemes.length,
    });

    res.status(200).json({
      success: true,
      data: {
        source,
        schemes,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    logger.error('Error in getSchemesBySource', {
      error: error.message,
      source: req.params.source,
    });

    res.status(500).json({
      success: false,
      message: 'Error fetching schemes by source',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * GET /schemes/:id - Get single scheme by ID
 */
const getSchemeById = async (req, res) => {
  try {
    const { id } = req.params;

    const scheme = await Scheme.findById(id);

    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: 'Scheme not found',
      });
    }

    logger.debug('Retrieved scheme by ID', { id });

    res.status(200).json({
      success: true,
      data: scheme,
    });
  } catch (error) {
    logger.error('Error in getSchemeById', {
      error: error.message,
      id: req.params.id,
    });

    res.status(500).json({
      success: false,
      message: 'Error fetching scheme',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * GET /schemes/search - Search schemes by keyword
 * Query parameters:
 *  - q: Search query (searches in title and description)
 *  - category: Optional category filter
 *  - page: Page number
 *  - limit: Items per page
 */
const searchSchemes = async (req, res) => {
  try {
    const { q, category, page = 1, limit = 20 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters',
      });
    }

    // Build search filter
    const searchFilter = {
      state: 'Maharashtra',
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
      ],
    };

    if (category) {
      searchFilter.category = category;
    }

    // Parse pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    // Execute search
    const schemes = await Scheme.find(searchFilter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Scheme.countDocuments(searchFilter);

    logger.debug('Searched schemes', {
      query: q,
      count: schemes.length,
      total,
    });

    res.status(200).json({
      success: true,
      data: {
        query: q,
        schemes,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    logger.error('Error in searchSchemes', {
      error: error.message,
      query: req.query.q,
    });

    res.status(500).json({
      success: false,
      message: 'Error searching schemes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * GET /schemes/stats/dashboard - Get statistics dashboard
 * Returns counts by category, source, and new schemes
 */
const getSchemeStats = async (req, res) => {
  try {
    // Get counts by category
    const byCategory = await Scheme.aggregate([
      { $match: { state: 'Maharashtra' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Get counts by source
    const bySource = await Scheme.aggregate([
      { $match: { state: 'Maharashtra' } },
      { $group: { _id: '$source', count: { $sum: 1 } } },
    ]);

    // Get new schemes count
    const newCount = await Scheme.countDocuments({
      isNew: true,
      state: 'Maharashtra',
    });

    // Get total count
    const totalCount = await Scheme.countDocuments({ state: 'Maharashtra' });

    // Get recent schemes (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentCount = await Scheme.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
      state: 'Maharashtra',
    });

    logger.debug('Retrieved scheme statistics');

    res.status(200).json({
      success: true,
      data: {
        total: totalCount,
        new: newCount,
        recent7Days: recentCount,
        byCategory,
        bySource,
      },
    });
  } catch (error) {
    logger.error('Error in getSchemeStats', {
      error: error.message,
    });

    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * POST /schemes/update/manual - Manually trigger scheme update (admin only)
 */
const triggerManualUpdate = async (req, res) => {
  try {
    logger.info('Manual scheme update triggered by admin');

    // Note: In production, add authentication/authorization check here
    // if (!req.user || req.user.role !== 'admin') {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Unauthorized - Admin access required'
    //   });
    // }

    const result = await schemeUpdateService.triggerManualUpdate();

    res.status(200).json({
      success: result.success,
      message: result.message,
      data: result,
    });
  } catch (error) {
    logger.error('Error in triggerManualUpdate', {
      error: error.message,
    });

    res.status(500).json({
      success: false,
      message: 'Error triggering manual update',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * GET /schemes/admin/status - Get update job status
 */
const getUpdateStatus = async (req, res) => {
  try {
    const status = schemeUpdateService.getStatus();

    res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error) {
    logger.error('Error in getUpdateStatus', {
      error: error.message,
    });

    res.status(500).json({
      success: false,
      message: 'Error fetching update status',
    });
  }
};

/**
 * POST /schemes/sync/maharashtra - Trigger sync using Next.js API (admin only)
 * Uses robust myScheme sync service with dynamic fallback chain.
 */
const triggerMaharashtraSchemeSync = async (req, res) => {
  try {
    logger.info('Maharashtra schemes sync triggered', {
      userId: req.user?.id || 'anonymous',
      ip: req.ip,
    });

    const result = await myschemeSyncService.syncState('maharashtra');
    const statusCode = 200;

    res.status(statusCode).json({
      success: true,
      message: result.fromFallback
        ? result.fallbackMessage
        : 'Maharashtra schemes synced successfully',
      data: {
        fetched: result.fetched,
        added: result.added,
        skipped: result.skipped,
        fromFallback: result.fromFallback,
      },
    });
  } catch (error) {
    logger.error('Error in triggerMaharashtraSchemeSync', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
    });

    res.status(500).json({
      success: false,
      message: 'Error triggering scheme sync',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * GET /schemes/sync/:state
 * Robust state-based sync from myScheme Next.js data API.
 */
const syncSchemesByState = async (req, res) => {
  try {
    const { state } = req.params;
    const result = await myschemeSyncService.syncState(state);

    return res.status(200).json({
      success: true,
      message: result.fromFallback
        ? result.fallbackMessage
        : 'Schemes synced successfully',
      data: result,
    });
  } catch (error) {
    logger.error('Error in syncSchemesByState', {
      state: req.params.state,
      error: error.message,
      stack: error.stack,
    });

    const isBuildIdError = /buildid|next\.js/i.test(error.message);
    return res.status(isBuildIdError ? 502 : 500).json({
      success: false,
      message: isBuildIdError
        ? 'Unable to fetch latest myScheme buildId'
        : 'Failed to sync schemes for requested state',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * GET /schemes/cron/status - Get status of all cron jobs (admin only)
 */
const getCronJobStatus = async (req, res) => {
  try {
    const status = schemeCronJobs.getJobsStatus();

    res.status(200).json({
      success: true,
      data: {
        jobs: status,
      },
    });
  } catch (error) {
    logger.error('Error in getCronJobStatus', {
      error: error.message,
    });

    res.status(500).json({
      success: false,
      message: 'Error fetching cron job status',
    });
  }
};

/**
 * POST /schemes/cron/:jobName/stop - Stop a specific cron job (admin only)
 */
const stopCronJob = async (req, res) => {
  try {
    const { jobName } = req.params;

    schemeCronJobs.stopJob(jobName);

    logger.info('Cron job stopped', {
      jobName,
      userId: req.user?.id,
      ip: req.ip,
    });

    res.status(200).json({
      success: true,
      message: `Cron job '${jobName}' stopped successfully`,
    });
  } catch (error) {
    logger.error('Error in stopCronJob', {
      error: error.message,
      jobName: req.params.jobName,
    });

    res.status(500).json({
      success: false,
      message: 'Error stopping cron job',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * POST /schemes/cron/:jobName/resume - Resume a specific cron job (admin only)
 */
const resumeCronJob = async (req, res) => {
  try {
    const { jobName } = req.params;

    schemeCronJobs.resumeJob(jobName);

    logger.info('Cron job resumed', {
      jobName,
      userId: req.user?.id,
      ip: req.ip,
    });

    res.status(200).json({
      success: true,
      message: `Cron job '${jobName}' resumed successfully`,
    });
  } catch (error) {
    logger.error('Error in resumeCronJob', {
      error: error.message,
      jobName: req.params.jobName,
    });

    res.status(500).json({
      success: false,
      message: 'Error resuming cron job',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};


module.exports = {
  getAllSchemes,
  getNewSchemes,
  getSchemesByCategory,
  getSchemesBySource,
  getSchemeById,
  searchSchemes,
  getSchemeStats,
  triggerManualUpdate,
  getUpdateStatus,
  syncSchemesByState,
  triggerMaharashtraSchemeSync,
  getCronJobStatus,
  stopCronJob,
  resumeCronJob,
};
