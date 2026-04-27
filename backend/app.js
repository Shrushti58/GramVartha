const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const db = require("./config/mongoose-connection");
const logger = require("./utlis/logger");
const schemeUpdateService = require("./service/schemeUpdateService");
const schemeCronJobs = require("./service/schemeCronJobs");
const myschemeDailyCron = require("./services/myschemeDailyCron");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

/* ========================
   MIDDLEWARES
======================== */

app.use(express.json());
app.use(cookieParser());

/* ========================
   CORS CONFIGURATION
   - Web (Admin + Deployed)
   - Mobile (Expo / iOS / Android)
======================== */

const allowedOrigins = (
  process.env.ALLOWED_ORIGINS || 
  "http://localhost:5173,https://gramvartha.vercel.app"
).split(',').map(origin => origin.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow mobile apps & tools (no origin)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  })
);

/* ========================
   ROUTES
======================== */

app.use("/admin", require("./routes/adminRoutes"));
app.use("/officials", require("./routes/officialsRoutes"));
app.use("/notice", require("./routes/noticeRoutes"));
app.use("/villages", require("./routes/villageRoutes"));
app.use("/citizen", require("./routes/citizenAuth"));
app.use("/complaints", require("./routes/complaintsRoutes"));
app.use("/workguide", require("./routes/workGuideRoutes"));
app.use("/schemes", require("./routes/schemeRoutes"));
app.use("/api/v1/weather", require("./modules/weather/weather.routes"));


/* ========================
   HEALTH CHECK
======================== */

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "GramVartha Backend Running",
  });
});

/* ========================
   ERROR HANDLER
======================== */

app.use(errorHandler);

/* ========================
   SERVER START
======================== */

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
  logger.info(`🚀 Server running on port ${PORT}`);

  // Initialize New Scheme Cron Jobs Service (Next.js API Integration)
  try {
    schemeCronJobs.initializeJobs();
    logger.info('✅ New scheme cron jobs initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize new scheme cron jobs', {
      error: error.message,
      stack: error.stack,
    });
  }

  // Initialize Legacy Scheme Update Service with CRON job
  try {
    // Check environment variable for custom interval (for testing)
    // Use: SCHEME_UPDATE_INTERVAL="*/30 * * * *" for every 30 minutes
    const customInterval = process.env.SCHEME_UPDATE_INTERVAL;

    if (customInterval) {
      logger.info(`Starting scheme update with custom interval: ${customInterval}`);
      schemeUpdateService.startScheduledUpdatesWithInterval(customInterval);
    } else {
      logger.info('Starting scheme update with default interval (every 6 hours)');
      schemeUpdateService.startScheduledUpdates();
    }

    // Optional: Trigger first update immediately on startup
    if (process.env.TRIGGER_SCHEME_UPDATE_ON_START === 'true') {
      logger.info('Triggering initial scheme update on server start...');
      schemeUpdateService.triggerManualUpdate().then(result => {
        logger.info('Initial scheme update completed', result);
      }).catch(error => {
        logger.error('Error during initial scheme update', { error: error.message });
      });
    }
  } catch (error) {
    logger.error('Failed to initialize scheme update service', {
      error: error.message,
      stack: error.stack,
    });
  }

  // Optional daily sync for the dynamic buildId-based pipeline.
  if (process.env.ENABLE_MYSCHEME_DAILY_SYNC === 'true') {
    try {
      myschemeDailyCron.start();
      logger.info('myScheme daily cron initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize myScheme daily cron', {
        error: error.message,
        stack: error.stack,
      });
    }
  }
});
