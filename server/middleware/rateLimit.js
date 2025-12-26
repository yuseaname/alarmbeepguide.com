/**
 * Rate Limiting Middleware
 * Prevents abuse and DDoS attacks
 */

import rateLimit from 'express-rate-limit';

// General rate limiter (100 requests per 15 minutes)
export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests',
      message: 'Please slow down and try again in a few minutes.',
      retryAfter: req.rateLimit.resetTime
    });
  },
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path === '/api/health';
  }
});

// Strict rate limiter for API endpoints (if you add any)
export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: {
    error: 'API rate limit exceeded',
    retryAfter: '15 minutes'
  }
});
