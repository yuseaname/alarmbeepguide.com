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
import { existsSync, readFileSync } from 'fs';
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
  join(process.cwd(), 'dist'),
  join(__dirname, '../dist'),
  join(__dirname, '../../dist'),
  join(__dirname, '../hostinger-deploy/dist'),
  join(__dirname, '../hostinger-prebuilt/dist')
];

function isLikelyProductionViteBuild(distDir) {
  const indexPath = join(distDir, 'index.html');
  const assetsDir = join(distDir, 'assets');
  if (!existsSync(indexPath) || !existsSync(assetsDir)) return false;

  try {
    const headSample = readFileSync(indexPath, 'utf8').slice(0, 50000);
    const hasAssets = headSample.includes('/assets/');
    const referencesSrcEntry = headSample.includes('/src/main.tsx');
    return hasAssets && !referencesSrcEntry;
  } catch {
    return false;
  }
}

const DIST_DIR = distCandidates.find(isLikelyProductionViteBuild)
  || distCandidates.find(p => existsSync(p))
  || distCandidates[0];
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
    // Images/fonts: long cache
    else if (path.match(/\.(jpg|jpeg|png|webp|avif|svg|woff2|woff|ttf|eot)$/)) {
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

// Contact form (posts to a configurable webhook)
app.post('/api/contact', async (req, res) => {
  const webhookUrl = process.env.CONTACT_WEBHOOK_URL;
  if (!webhookUrl) {
    return res.status(501).json({ ok: false, error: 'CONTACT_WEBHOOK_URL not configured' });
  }

  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
  const subject = typeof req.body?.subject === 'string' ? req.body.subject.trim() : '';
  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';

  if (!message || message.length < 5) {
    return res.status(400).json({ ok: false, error: 'Message is required' });
  }

  if (typeof fetch !== 'function') {
    return res.status(500).json({ ok: false, error: 'Server fetch() not available' });
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'user-agent': 'AlarmBeepGuide/ContactForm'
      },
      body: JSON.stringify({
        name,
        email,
        subject,
        message,
        page: req.headers.referer || null,
        createdAt: new Date().toISOString()
      })
    });

    if (!response.ok) {
      return res.status(502).json({ ok: false, error: `Webhook error: ${response.status}` });
    }

    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'Failed to submit contact form' });
  }
});

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

  // Only serve the SPA shell for real page navigations.
  // This prevents returning HTML for missing static assets (JS/CSS/images),
  // which can cause blank pages and higher bounce.
  const acceptsHtml = req.accepts('html');
  if (!acceptsHtml) {
    return next();
  }

  // If the request looks like a file (has an extension), allow 404s instead of SPA.
  if (req.path.includes('.')) {
    return next();
  }

  // Prefer prerendered route HTML when present.
  // (Express static is configured with index:false, so we need this explicitly.)
  const requestPath = req.path.replace(/^\/+/, '').replace(/\/+$/, '');
  const candidate = requestPath === ''
    ? INDEX_HTML
    : join(DIST_DIR, requestPath, 'index.html');

  if (candidate !== INDEX_HTML && existsSync(candidate)) {
    try {
      const headSample = readFileSync(candidate, 'utf8').slice(0, 50000);
      const safe = headSample.includes('/assets/') && !headSample.includes('/src/main.tsx');
      if (safe) {
        res.type('html');
        res.setHeader('Cache-Control', ENV === 'production' ? 'public, max-age=0, must-revalidate' : 'no-store');
        return res.sendFile(candidate);
      }
    } catch {
      // ignore and fall back
    }
  }

  // Serve SPA entry for all other routes
  res.type('html');
  res.setHeader('Cache-Control', ENV === 'production' ? 'public, max-age=0, must-revalidate' : 'no-store');
  return res.sendFile(INDEX_HTML);
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
