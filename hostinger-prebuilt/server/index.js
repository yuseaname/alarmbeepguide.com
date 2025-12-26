/**
 * AlarmBeepGuide.com - Express Server
 * SEO-optimized, AdSense-ready Node.js server for Hostinger
 * 
 * Features:
 * - Serves prerendered static HTML (SEO)
 * - Dynamic meta tag injection
 * - Security headers (Helmet)
 * - Compression (Gzip/Brotli)
 * - Rate limiting
 * - Health check endpoint
 * - Proper caching strategy
 */

import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import dotenv from 'dotenv';

// Import middleware
import { setupCSP } from './middleware/csp.js';
import { logger } from './middleware/logger.js';
import { limiter } from './middleware/rateLimit.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { handleRedirects, enforceTrailingSlash } from './middleware/redirects.js';

// Import routes
import { serveSitemap } from './routes/sitemap.js';
import { serveRobots } from './routes/robots.js';
import { healthCheck } from './routes/health.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV || 'development';

const distCandidates = [
  join(__dirname, '../dist'),
  join(__dirname, '../hostinger-deploy/dist'),
  join(__dirname, '../../dist'),
  join(process.cwd(), 'dist')
];

const DIST_DIR = distCandidates.find(p => existsSync(p)) || distCandidates[0];
const INDEX_HTML = join(DIST_DIR, 'index.html');

// ============================================
// MIDDLEWARE SETUP
// ============================================

// Security headers (must be first)
app.use(helmet({
  contentSecurityPolicy: false, // We'll set custom CSP for AdSense
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

// Custom CSP for AdSense compatibility
app.use(setupCSP);

// Compression (Gzip/Brotli)
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
}));

// Logging
app.use(logger);

// Rate limiting (API routes only)
app.use('/api/', limiter);

// Redirects (www, trailing slash, http?https)
app.use(handleRedirects);
app.use(enforceTrailingSlash);

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// STATIC FILE SERVING (Vite build output)
// ============================================

app.use(express.static(DIST_DIR, {
  maxAge: ENV === 'production' ? '1y' : 0,
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    // HTML: short cache for updates
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'public, max-age=3600, must-revalidate');
    }
    // JS/CSS: long cache (Vite adds hashes to filenames)
    else if (path.match(/\.(js|css)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
    // Images: long cache
    else if (path.match(/\.(jpg|png|webp|avif|svg|woff2)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
}));

// ============================================
// ROUTES
// ============================================

// Health check (for monitoring)
app.get('/health', healthCheck);
app.get('/api/health', healthCheck);

// SEO routes
app.get('/sitemap.xml', serveSitemap);
app.get('/robots.txt', serveRobots);

// SPA fallback (serve index.html for all other routes)
// This must be LAST (after all other routes)
app.use((req, res, next) => {
  // Skip if it's an API route
  if (req.path.startsWith('/api/')) {
    return next();
  }

  // Serve index.html for all other routes (SPA routing)
  res.sendFile(INDEX_HTML);
});

// ============================================
// ERROR HANDLING
// ============================================

app.use(notFoundHandler);
app.use(errorHandler);

// ============================================
// SERVER START
// ============================================

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('AlarmBeepGuide server listening', {
    env: ENV,
    port: PORT,
    distDir: DIST_DIR,
    indexExists: existsSync(INDEX_HTML)
  });

  if (!existsSync(INDEX_HTML)) {
    console.error('FATAL: index.html not found. Expected at:', INDEX_HTML);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;
