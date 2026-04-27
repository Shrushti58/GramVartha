const cron = require("node-cron");
const myschemeSyncService = require("./myschemeSyncService");
const logger = require("../utlis/logger");

class MyschemeDailyCron {
  constructor() {
    this.task = null;
  }

  start() {
    if (this.task) {
      return;
    }

    const cronExpr = process.env.MYSCHEME_DAILY_CRON || "0 2 * * *";
    const defaultStates = process.env.MYSCHEME_DAILY_STATES || "maharashtra";
    const states = defaultStates
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    // Optional daily auto-sync. Controlled by env so teams can enable safely.
    this.task = cron.schedule(cronExpr, async () => {
      for (const state of states) {
        try {
          const result = await myschemeSyncService.syncState(state);
          logger.cronLog("myscheme-daily-sync", "Daily sync completed", result);
        } catch (error) {
          logger.error("Daily myScheme sync failed", {
            state,
            error: error.message,
          });
        }
      }
    });

    logger.info("myScheme daily cron started", { cronExpr, states });
  }

  stop() {
    if (this.task) {
      this.task.stop();
      this.task = null;
      logger.info("myScheme daily cron stopped");
    }
  }
}

module.exports = new MyschemeDailyCron();
