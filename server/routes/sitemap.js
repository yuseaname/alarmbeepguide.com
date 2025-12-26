/**
 * Sitemap Route
 * Dynamically generates sitemap.xml
 */

// Blog posts data (import from your existing data)
const blogPosts = [
  { slug: 'smoke-detector-chirping-low-battery', lastmod: '2024-01-15', priority: 0.8 },
  { slug: 'carbon-monoxide-detector-beeping-patterns', lastmod: '2024-01-15', priority: 0.8 },
  { slug: 'hardwired-smoke-detector-beeping-troubleshooting', lastmod: '2024-01-15', priority: 0.7 },
  { slug: 'fire-extinguisher-pressure-gauge-reading', lastmod: '2024-01-15', priority: 0.7 },
  { slug: 'fire-extinguisher-when-to-replace', lastmod: '2024-01-15', priority: 0.7 },
  { slug: 'noaa-weather-radio-alerts-setup-guide', lastmod: '2024-01-15', priority: 0.7 },
  { slug: 'emergency-alert-system-phone-sounds', lastmod: '2024-01-15', priority: 0.7 },
  { slug: 'security-system-beeping-codes', lastmod: '2024-01-15', priority: 0.7 },
  { slug: 'smoke-detector-false-alarms', lastmod: '2024-01-15', priority: 0.7 },
  { slug: 'motion-sensor-light-wont-turn-off', lastmod: '2024-01-15', priority: 0.6 },
  { slug: 'heat-detector-vs-smoke-detector', lastmod: '2024-01-15', priority: 0.6 },
];

const categories = [
  'chirp-beep-codes',
  'fire-extinguishers',
  'home-flood-lights',
  'weather-outage-alerts',
  'household-alert-fixes'
];

const trustPages = [
  'about',
  'disclosure',
  'editorial-policy',
  'corrections-policy',
  'contact',
  'privacy',
  'accessibility'
];

function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

function generateSitemapXML() {
  const baseUrl = process.env.BASE_URL || 'https://alarmbeepguide.com';
  const today = getTodayDate();
  
  const urls = [];
  
  // Homepage
  urls.push({
    loc: baseUrl,
    lastmod: today,
    changefreq: 'daily',
    priority: 1.0
  });
  
  // Blog listing
  urls.push({
    loc: `${baseUrl}/blog`,
    lastmod: today,
    changefreq: 'daily',
    priority: 0.9
  });
  
  // Blog posts
  blogPosts.forEach(post => {
    urls.push({
      loc: `${baseUrl}/blog/${post.slug}`,
      lastmod: post.lastmod,
      changefreq: 'monthly',
      priority: post.priority
    });
  });
  
  // Categories
  categories.forEach(category => {
    urls.push({
      loc: `${baseUrl}/${category}`,
      lastmod: today,
      changefreq: 'weekly',
      priority: 0.9
    });
  });
  
  // Trust pages
  trustPages.forEach(page => {
    const priority = page === 'about' ? 0.6 : 0.5;
    urls.push({
      loc: `${baseUrl}/${page}`,
      lastmod: today,
      changefreq: 'monthly',
      priority
    });
  });
  
  // Generate XML
  const urlEntries = urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority.toFixed(1)}</priority>
  </url>`).join('\n');
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

export function serveSitemap(req, res) {
  const sitemap = generateSitemapXML();
  
  res.header('Content-Type', 'application/xml');
  res.header('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
  res.send(sitemap);
}
