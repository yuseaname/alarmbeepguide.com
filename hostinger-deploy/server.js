import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

const distDir = path.join(__dirname, 'dist');
const indexHtml = path.join(distDir, 'index.html');

// Basic health endpoint (useful for Hostinger checks)
app.get('/health', (req, res) => res.status(200).json({ ok: true }));

// Serve robots.txt and sitemap.xml if present
app.get('/robots.txt', (req, res) => {
  const robotsFromPublic = path.join(__dirname, 'public', 'robots.txt');
  const robotsFromDist = path.join(distDir, 'robots.txt');
  const candidate = existsSync(robotsFromPublic) ? robotsFromPublic : robotsFromDist;

  if (existsSync(candidate)) {
    return res.type('text/plain').sendFile(candidate);
  }

  res.type('text/plain').send('User-agent: *\nAllow: /\n');
});

app.get('/sitemap.xml', (req, res) => {
  const sitemapFromPublic = path.join(__dirname, 'public', 'sitemap.xml');
  const sitemapFromDist = path.join(distDir, 'sitemap.xml');
  const candidate = existsSync(sitemapFromDist) ? sitemapFromDist : sitemapFromPublic;

  if (existsSync(candidate)) {
    return res.type('application/xml').sendFile(candidate);
  }

  res.status(404).type('text/plain').send('sitemap.xml not found');
});

// Serve built static assets
app.use(express.static(distDir, {
  maxAge: '1y',
  etag: true,
  index: false
}));

// SPA + prerendered HTML fallback
app.get(/.*/, (req, res) => {
  // If a prerendered page exists, serve it (e.g. /about -> dist/about/index.html)
  const requestPath = req.path.replace(/\/$/, '');
  const candidate = requestPath === ''
    ? path.join(distDir, 'index.html')
    : path.join(distDir, requestPath, 'index.html');

  if (existsSync(candidate)) {
    return res.sendFile(candidate);
  }

  // Fall back to SPA entry
  if (existsSync(indexHtml)) {
    return res.sendFile(indexHtml);
  }

  res.status(500).type('text/plain').send('dist/index.html missing');
});

app.listen(PORT, HOST, () => {
  console.log(`AlarmBeepGuide listening on http://${HOST}:${PORT}`);
  console.log('distDir:', distDir, 'indexExists:', existsSync(indexHtml));
});
