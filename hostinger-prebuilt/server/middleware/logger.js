/**
 * Request Logger Middleware
 * Logs all HTTP requests with timing information
 */

import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let logStream = null;
const logsDir = join(__dirname, '../../logs');

try {
  // Ensure logs directory exists
  if (!existsSync(logsDir)) {
    mkdirSync(logsDir, { recursive: true });
  }

  logStream = createWriteStream(join(logsDir, 'access.log'), { flags: 'a' });
} catch (err) {
  // On some managed hosts the app directory may be read-only or restricted.
  // Fall back to console-only logging so the server still boots.
  console.warn('Logger: file logging disabled (cannot write logs directory)', {
    logsDir,
    message: err?.message
  });
}

export function logger(req, res, next) {
  const start = Date.now();
  const { method, url, headers } = req;
  const userAgent = headers['user-agent'] || 'unknown';
  
  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    
    const log = {
      timestamp: new Date().toISOString(),
      method,
      url,
      statusCode,
      duration: `${duration}ms`,
      userAgent: userAgent.substring(0, 100), // Truncate long user agents
      ip: req.ip || req.connection.remoteAddress
    };
    
    const logLine = `${log.timestamp} ${log.method} ${log.url} ${log.statusCode} ${log.duration} ${log.ip}\n`;
    
    // Write to file if enabled
    if (logStream) {
      logStream.write(logLine);
    }
    
    // Console log in development
    if (process.env.NODE_ENV !== 'production') {
      const colorCode = statusCode >= 500 ? '\x1b[31m' : statusCode >= 400 ? '\x1b[33m' : '\x1b[32m';
      console.log(`${colorCode}${method} ${url} ${statusCode}\x1b[0m ${duration}ms`);
    }
  });
  
  next();
}
