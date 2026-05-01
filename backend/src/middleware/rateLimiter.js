const {
  RateLimiterMemory,
  RateLimiterRedis,
} = require("rate-limiter-flexible");
const redis = require("../config/redis");
const logger = require("../../utlis/logger");

const globalMemoryLimiter = new RateLimiterMemory({
  points: 100,
  duration: 15 * 60,
});

const authMemoryLimiter = new RateLimiterMemory({
  points: 5,
  duration: 15 * 60,
});

const globalRateLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: "gramvartha_global",
  points: 100,
  duration: 15 * 60,
  insuranceLimiter: globalMemoryLimiter,
});

const authRateLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: "gramvartha_auth",
  points: 5,
  duration: 15 * 60,
  insuranceLimiter: authMemoryLimiter,
});

const createRateLimitMiddleware = (limiter) => async (req, res, next) => {
  try {
    await limiter.consume(req.ip);
    return next();
  } catch (error) {
    if (error && typeof error.msBeforeNext === "number") {
      res.set("Retry-After", String(Math.ceil(error.msBeforeNext / 1000)));
      return res.status(429).json({
        message: "Too many requests. Please try again later.",
      });
    }

    logger.error("Rate limiter failed open", {
      path: req.originalUrl,
      ip: req.ip,
      error: error.message,
    });

    return next();
  }
};

module.exports = {
  globalLimiter: createRateLimitMiddleware(globalRateLimiter),
  authLimiter: createRateLimitMiddleware(authRateLimiter),
};
