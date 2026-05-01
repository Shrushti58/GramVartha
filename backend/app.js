const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const db = require("./config/mongoose-connection");
const corsOptions = require("./config/corsOptions");
const logger = require("./utlis/logger");
const errorHandler = require("./middlewares/errorHandler");
const { globalLimiter } = require("./src/middleware/rateLimiter");
const routes = require("./routes");
const { initializeStartupJobs } = require("./config/serverStartup");

const app = express();

/* ========================
   MIDDLEWARES
======================== */

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));
app.use("/api", globalLimiter);

/* ========================
   ROUTES
======================== */

app.use(routes);

/* ========================
   ERROR HANDLER
======================== */

app.use(errorHandler);

/* ========================
   SERVER START
======================== */

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  logger.info(`Server running on port ${PORT}`);

  initializeStartupJobs();
});
