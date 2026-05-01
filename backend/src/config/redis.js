const Redis = require("ioredis");
const logger = require("../../utlis/logger");

const redis = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379", {
  lazyConnect: true,
  enableOfflineQueue: false,
  maxRetriesPerRequest: 1,
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
