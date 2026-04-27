const fs = require('fs');
const path = require('path');

/**
 * Logger Utility - Handles application logging
 * Creates log files for different types of logs
 * Supports console and file logging
 */

const logsDir = path.join(__dirname, '../logs');

// Create logs directory if it doesn't exist
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Log levels: ERROR, WARN, INFO, DEBUG
 */
const LogLevel = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
};

/**
 * Format log message with timestamp
 */
function formatLog(level, message, data = null) {
  const timestamp = new Date().toISOString();
  let logMessage = `[${timestamp}] [${level}] ${message}`;

  if (data) {
    logMessage += '\n' + JSON.stringify(data, null, 2);
  }

  return logMessage;
}

/**
 * Write log to file
 */
function writeToFile(filename, logMessage) {
  const filePath = path.join(logsDir, filename);
  const logEntry = logMessage + '\n' + '-'.repeat(80) + '\n';

  fs.appendFile(filePath, logEntry, (err) => {
    if (err) {
      console.error(`Failed to write to log file: ${err.message}`);
    }
  });
}

/**
 * Logger object with methods for different log levels
 */
const logger = {
  error: (message, data = null) => {
    const logMessage = formatLog(LogLevel.ERROR, message, data);
    console.error(logMessage);
    writeToFile('error.log', logMessage);
  },

  warn: (message, data = null) => {
    const logMessage = formatLog(LogLevel.WARN, message, data);
    console.warn(logMessage);
    writeToFile('app.log', logMessage);
  },

  info: (message, data = null) => {
    const logMessage = formatLog(LogLevel.INFO, message, data);
    console.log(logMessage);
    writeToFile('app.log', logMessage);
  },

  debug: (message, data = null) => {
    if (process.env.DEBUG === 'true') {
      const logMessage = formatLog(LogLevel.DEBUG, message, data);
      console.log(logMessage);
      writeToFile('debug.log', logMessage);
    }
  },

  // Special logger for scraping operations
  scrapeLog: (source, message, data = null) => {
    const logMessage = formatLog('SCRAPE', `[${source}] ${message}`, data);
    console.log(logMessage);
    writeToFile('scraping.log', logMessage);
  },

  // Special logger for cron jobs
  cronLog: (jobName, message, data = null) => {
    const logMessage = formatLog('CRON', `[${jobName}] ${message}`, data);
    console.log(logMessage);
    writeToFile('cron.log', logMessage);
  },
};

module.exports = logger;
