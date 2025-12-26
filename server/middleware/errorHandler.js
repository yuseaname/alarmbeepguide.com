/**
 * Error Handling Middleware
 * Centralized error handling for Express
 */

import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 404 Not Found Handler
export function notFoundHandler(req, res, next) {
  // Check if this is an API request
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      error: 'Not Found',
      message: `API endpoint ${req.path} does not exist`,
      path: req.path
    });
  }
  
  // For regular pages, serve the SPA (index.html will handle routing)
  // If you want a custom 404 page, serve it here:
  // res.status(404).sendFile(join(__dirname, '../../dist/404.html'));
  
  // Otherwise, let SPA handle it
  next();
}

// Global Error Handler
export function errorHandler(err, req, res, next) {
  // Log error
  console.error('? Error:', {
    message: err.message,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  // Don't expose internal errors in production
  const statusCode = err.statusCode || err.status || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;
  
  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV !== 'production' && {
      stack: err.stack,
      details: err.details || {}
    })
  });
}

// Async error wrapper (for async route handlers)
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
