const logger = require("../utlis/logger");
const AppError = require("../utils/appError");

const errorHandler = (err, req, res, next) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err.message || "Internal Server Error";

  logger.error("Request failed", {
    method: req.method,
    path: req.originalUrl,
    statusCode,
    error: message,
    details: err.details || null,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });

  res.status(statusCode).json({
    status: "error",
    message,
    ...(err.details ? { details: err.details } : {}),
  });
};

module.exports = errorHandler;
