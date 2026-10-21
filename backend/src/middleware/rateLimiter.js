/**
 * Rate Limiter Middleware
 * Protects CareCompass public REST API from denial-of-service and brute force abuse.
 */

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

module.exports = {
  apiLimiter
};
