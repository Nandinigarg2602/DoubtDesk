const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter — 300 requests per 15 minutes.
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests — please try again later' },
});

/**
 * Strict auth rate limiter — 10 requests per 15 minutes.
 * Protects against brute-force login attempts.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many auth attempts — please try again later' },
});

module.exports = { generalLimiter, authLimiter };
