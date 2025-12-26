/**
 * Redirect Middleware
 * Handles SEO-critical redirects (www, trailing slash, http?https)
 */

export function handleRedirects(req, res, next) {
  const host = req.hostname;
  const protocol = req.protocol;
  
  // 1. Redirect www ? non-www (301)
  if (host.startsWith('www.')) {
    const newHost = host.replace('www.', '');
    return res.redirect(301, `${protocol}://${newHost}${req.originalUrl}`);
  }
  
  // 2. Redirect HTTP ? HTTPS (301)
  // Note: Hostinger handles this at proxy level, but this is a fallback
  if (process.env.NODE_ENV === 'production' && protocol === 'http') {
    return res.redirect(301, `https://${host}${req.originalUrl}`);
  }
  
  next();
}

export function enforceTrailingSlash(req, res, next) {
  const { path, url } = req;

  // Never redirect file-like paths (assets), to avoid breaking caching/CDN behavior.
  if (path.includes('.')) {
    return next();
  }
  
  // Remove trailing slash (except for root)
  if (path !== '/' && path.endsWith('/')) {
    const newPath = path.slice(0, -1);
    const newUrl = url.replace(path, newPath);
    return res.redirect(301, newUrl);
  }
  
  next();
}

// Custom redirects (add as needed)
const customRedirects = {
  // Example:
  // '/old-url': '/new-url',
};

export function customRedirectHandler(req, res, next) {
  const redirect = customRedirects[req.path];
  
  if (redirect) {
    return res.redirect(301, redirect);
  }
  
  next();
}
