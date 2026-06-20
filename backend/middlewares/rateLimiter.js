const rateLimit = require("express-rate-limit");

const defaultMessage = {
  success: false,
  message: "Too many requests. Please try again later.",
};

const assistantMessage = {
  success: false,
  message: "Too many assistant requests. Please wait before trying again.",
};

const createLimiter = ({ windowMs, limit, message = defaultMessage }) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.method === "OPTIONS",
    handler: (req, res, next, options) => {
      res.status(options.statusCode).json(message);
    },
  });

// Protects every API from accidental traffic spikes and basic abuse.
const globalLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 300,
});

// Keeps login/register/OTP/password-reset style endpoints harder to brute force.
const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 20,
});

// Smart Assistant calls are AI-backed, so they need a tighter per-minute limit.
const assistantLimiter = createLimiter({
  windowMs: 60 * 1000,
  limit: 10,
  message: assistantMessage,
});

// Complaint submissions can trigger uploads and verification work, so limit creation only.
const complaintLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 15,
});

// Weather APIs call external/advisory services and should be protected from polling abuse.
const weatherLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 60,
});

// Scheme search/assistant endpoints are read-heavy and can be queried often, but still capped.
const schemeLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 120,
});

// The default in-memory store is fine for a single-server MVP.
// Use a shared store such as Redis later when running multiple backend instances.
module.exports = {
  globalLimiter,
  authLimiter,
  assistantLimiter,
  complaintLimiter,
  weatherLimiter,
  schemeLimiter,
};
