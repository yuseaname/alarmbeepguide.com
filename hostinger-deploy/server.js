import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync, readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Parse JSON bodies
app.use(express.json());

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

const distCandidates = [
  path.join(__dirname, 'dist'),
  path.join(__dirname, '..', 'dist')
];

function isLikelyProductionViteBuild(dir) {
  const indexPath = path.join(dir, 'index.html');
  const assetsDir = path.join(dir, 'assets');
  if (!existsSync(indexPath) || !existsSync(assetsDir)) return false;
  try {
    const headSample = readFileSync(indexPath, 'utf8').slice(0, 50000);
    return headSample.includes('/assets/') && !headSample.includes('/src/main.tsx');
  } catch {
    return false;
  }
}

const distDir = distCandidates.find(isLikelyProductionViteBuild)
  || distCandidates.find(d => existsSync(d))
  || distCandidates[0];

const indexHtml = path.join(distDir, 'index.html');

// Basic health endpoint (useful for Hostinger checks)
app.get('/health', (req, res) => res.status(200).json({ ok: true }));

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
    try {
      const headSample = readFileSync(candidate, 'utf8').slice(0, 50000);
      const safe = headSample.includes('/assets/') && !headSample.includes('/src/main.tsx');
      if (safe) {
        return res.sendFile(candidate);
      }
    } catch {
      // ignore and fall back
    }
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
