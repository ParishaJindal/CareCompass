const rateLimit = require('express-rate-limit');

const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10); // 15 mins default
const maxRequests = parseInt(process.env.RATE_LIMIT_MAX || '200', 10);

const apiLimiter = rateLimit({
  windowMs,
  max: maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP. Please wait a few moments before trying again.'
  }
});

// Stricter rate limiter for sensitive patient lookup and cancellation (anti-brute-force)
const lookupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Max 20 attempts per IP per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many lookup attempts from this IP address. Please wait 15 minutes before trying again.'
  }
});

module.exports = {
  apiLimiter,
  lookupLimiter
};
