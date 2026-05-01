const logger = require("../utlis/logger");
const schemeUpdateService = require("../service/schemeUpdateService");
const schemeCronJobs = require("../service/schemeCronJobs");
const myschemeDailyCron = require("../services/myschemeDailyCron");

const initializeSchemeCronJobs = () => {
  try {
    schemeCronJobs.initializeJobs();
    logger.info("âœ… New scheme cron jobs initialized successfully");
  } catch (error) {
    logger.error("Failed to initialize new scheme cron jobs", {
      error: error.message,
      stack: error.stack,
    });
  }
};

const initializeSchemeUpdateService = () => {
  try {
    // Check environment variable for custom interval (for testing)
    // Use: SCHEME_UPDATE_INTERVAL="*/30 * * * *" for every 30 minutes
    const customInterval = process.env.SCHEME_UPDATE_INTERVAL;

    if (customInterval) {
      logger.info(`Starting scheme update with custom interval: ${customInterval}`);
      schemeUpdateService.startScheduledUpdatesWithInterval(customInterval);
    } else {
      logger.info("Starting scheme update with default interval (every 6 hours)");
      schemeUpdateService.startScheduledUpdates();
    }

    // Optional: Trigger first update immediately on startup
    if (process.env.TRIGGER_SCHEME_UPDATE_ON_START === "true") {
      logger.info("Triggering initial scheme update on server start...");
      schemeUpdateService
        .triggerManualUpdate()
        .then((result) => {
          logger.info("Initial scheme update completed", result);
        })
        .catch((error) => {
          logger.error("Error during initial scheme update", { error: error.message });
        });
    }
  } catch (error) {
    logger.error("Failed to initialize scheme update service", {
      error: error.message,
      stack: error.stack,
    });
  }
};

const initializeMyschemeDailyCron = () => {
  if (process.env.ENABLE_MYSCHEME_DAILY_SYNC === "true") {
    try {
      myschemeDailyCron.start();
      logger.info("myScheme daily cron initialized successfully");
    } catch (error) {
      logger.error("Failed to initialize myScheme daily cron", {
        error: error.message,
        stack: error.stack,
      });
    }
  }
};

const initializeStartupJobs = () => {
  initializeSchemeCronJobs();
  initializeSchemeUpdateService();
  initializeMyschemeDailyCron();
};

module.exports = {
  initializeStartupJobs,
};
