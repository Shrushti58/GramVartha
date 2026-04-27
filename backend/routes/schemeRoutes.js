const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/schemeController');

/**
 * Government Schemes Routes
 * 
 * All schemes are specific to Maharashtra state
 * Base path: /schemes
 */

/**
 * GET /schemes - Get all schemes with optional filters
 * Query params:
 *  - category: farmer, rural, women, agriculture, subsidy, loan, insurance, training, marketing, animal_husbandry, irrigation, soil_health, organic_farming, horticulture, general
 *  - state: Maharashtra (default)
 *  - source: myscheme, mahabdt, other
 *  - page: 1 (default)
 *  - limit: 20 (default)
 *  - sortBy: createdAt (default)
 *  - sortOrder: desc (default) or asc
 * 
 * Example: GET /schemes?category=farmer&page=1&limit=10
 */
router.get('/', getAllSchemes);

/**
 * GET /schemes/search - Search schemes by keyword
 * Query params:
 *  - q: Search query (required, min 2 chars)
 *  - category: Optional category filter
 *  - page: 1 (default)
 *  - limit: 20 (default)
 * 
 * Example: GET /schemes/search?q=irrigation&category=agriculture
 */
router.get('/search', searchSchemes);

/**
 * GET /schemes/new - Get only new schemes
 * Returns schemes marked as isNew = true (added in last 7 days)
 * Query params:
 *  - category: Optional filter
 *  - source: Optional filter
 *  - page: 1 (default)
 *  - limit: 20 (default)
 * 
 * Example: GET /schemes/new?category=farmer
 */
router.get('/new', getNewSchemes);

/**
 * GET /schemes/stats/dashboard - Get statistics dashboard
 * Returns:
 *  - Total schemes count
 *  - New schemes count
 *  - Schemes added in last 7 days
 *  - Breakdown by category
 *  - Breakdown by source
 */
router.get('/stats/dashboard', getSchemeStats);

/**
 * GET /schemes/admin/status - Get scheme update job status
 * Returns:
 *  - isRunning: Whether an update is currently in progress
 *  - cronJobActive: Whether the CRON job is running
 */
router.get('/admin/status', getUpdateStatus);

/**
 * POST /schemes/update/manual - Manually trigger scheme update
 * Useful for testing or forcing an immediate update
 * Response includes counts of added, updated, failed schemes
 * 
 * Note: Should be admin-only in production
 */
router.post('/update/manual', triggerManualUpdate);

/**
 * GET /schemes/sync/:state - Sync schemes for a given state
 * Example: GET /schemes/sync/maharashtra
 */
router.get('/sync/:state', syncSchemesByState);

/**
 * GET /schemes/by-category/:category - Get schemes by specific category
 * Params:
 *  - category: One of the valid categories
 * Query params:
 *  - page: 1 (default)
 *  - limit: 20 (default)
 * 
 * Example: GET /schemes/by-category/farmer?page=1
 */
router.get('/by-category/:category', getSchemesByCategory);

/**
 * GET /schemes/by-source/:source - Get schemes by source portal
 * Params:
 *  - source: myscheme, mahabdt, or other
 * Query params:
 *  - page: 1 (default)
 *  - limit: 20 (default)
 * 
 * Example: GET /schemes/by-source/myscheme
 */
router.get('/by-source/:source', getSchemesBySource);

/**
 * GET /schemes/:id - Get single scheme by ID
 * Params:
 *  - id: MongoDB scheme ID
 * 
 * Example: GET /schemes/507f1f77bcf86cd799439011
 */
router.get('/:id', getSchemeById);

/**
 * ============================================================================
 * NEW ROUTES - Maharashtra Schemes API Integration
 * Using Next.js JSON API with buildId extraction and pagination
 * ============================================================================
 */

/**
 * POST /schemes/sync/maharashtra - Trigger sync of Maharashtra schemes
 * Uses the new schemeService with:
 *  - Dynamic buildId extraction from homepage
 *  - Next.js JSON API (/_next/data/{buildId}/en/search.json)
 *  - Pagination (pages 1-5)
 *  - Retry logic (2 retries on failure)
 *  - Content hashing for change detection
 * 
 * Response includes:
 *  - fetched: Number of schemes fetched from API
 *  - stats: {inserted, updated, skipped, errors}
 *  - duration: Time taken in milliseconds
 * 
 * Note: Should be admin-only in production
 * Example: POST /schemes/sync/maharashtra
 */
router.post('/sync/maharashtra', triggerMaharashtraSchemeSync);

/**
 * GET /schemes/cron/status - Get status of all cron jobs
 * Returns status for each scheduled job:
 *  - maharashtra-schemes-sync: Runs every 6 hours
 * 
 * Response includes:
 *  - scheduled: Boolean
 *  - running: Boolean
 * 
 * Note: Should be admin-only in production
 * Example: GET /schemes/cron/status
 */
router.get('/cron/status', getCronJobStatus);

/**
 * POST /schemes/cron/:jobName/stop - Stop a specific cron job
 * Params:
 *  - jobName: Name of the job (e.g., 'maharashtra-schemes-sync')
 * 
 * Note: Should be admin-only in production
 * Example: POST /schemes/cron/maharashtra-schemes-sync/stop
 */
router.post('/cron/:jobName/stop', stopCronJob);

/**
 * POST /schemes/cron/:jobName/resume - Resume a specific cron job
 * Params:
 *  - jobName: Name of the job (e.g., 'maharashtra-schemes-sync')
 * 
 * Note: Should be admin-only in production
 * Example: POST /schemes/cron/maharashtra-schemes-sync/resume
 */
router.post('/cron/:jobName/resume', resumeCronJob);

module.exports = router;
