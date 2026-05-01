const Redis = require("ioredis");
const logger = require("../../utlis/logger");

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  logger.info("REDIS_URL not configured. Using in-memory rate limiter fallback.");
  module.exports = null;
  return;
}

const redis = new Redis(redisUrl, {
  lazyConnect: true,
  enableOfflineQueue: false,
  maxRetriesPerRequest: 1,
  retryStrategy: null,
});

redis.on("connect", () => {
  logger.info("Redis connected");
});

redis.on("error", (error) => {
  logger.error("Redis connection error", { error: error.message });
});

redis.connect().catch((error) => {
  logger.error("Redis initial connection failed", { error: error.message });
});

module.exports = redis;
