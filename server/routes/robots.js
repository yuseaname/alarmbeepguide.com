/**
 * Robots.txt Route
 * Dynamically generates robots.txt
 */

export function serveRobots(req, res) {
  const baseUrl = process.env.BASE_URL || 'https://alarmbeepguide.com';
  
  const robotsTxt = `# AlarmBeepGuide.com - Robots.txt
# Generated: ${new Date().toISOString()}

User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Googlebot
User-agent: Googlebot
Allow: /
Crawl-delay: 0

# Googlebot Images
User-agent: Googlebot-Image
Allow: /

# Bingbot
User-agent: Bingbot
Allow: /
Crawl-delay: 0

# Disallow admin/private areas (if any in future)
# User-agent: *
# Disallow: /admin/
# Disallow: /api/private/
`.trim();

  res.header('Content-Type', 'text/plain');
  res.header('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
  res.send(robotsTxt);
}
