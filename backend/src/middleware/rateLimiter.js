const rateLimit = require('express-rate-limit');

const isStagingOrTest = process.env.NODE_ENV === 'staging' || process.env.NODE_ENV === 'test';
const apiWindowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || (isStagingOrTest ? '60000' : '900000'), 10);
const maxRequests = parseInt(process.env.RATE_LIMIT_MAX || (isStagingOrTest ? '1000' : '200'), 10);

const apiLimiter = rateLimit({
  windowMs: apiWindowMs,
  max: maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP. Please wait a few moments before trying again.'
  }
});

// Stricter rate limiter for sensitive patient lookup and auth (anti-brute-force)
const lookupWindowMs = parseInt(process.env.RATE_LIMIT_LOOKUP_WINDOW_MS || (isStagingOrTest ? '60000' : '900000'), 10);
const lookupMax = parseInt(process.env.RATE_LIMIT_LOOKUP_MAX || (isStagingOrTest ? '200' : '20'), 10);

const lookupLimiter = rateLimit({
  windowMs: lookupWindowMs,
  max: lookupMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many lookup or auth attempts from this IP address. Please wait before trying again.'
  }
});

module.exports = {
  apiLimiter,
  lookupLimiter
};
