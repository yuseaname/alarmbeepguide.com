/**
 * Content Security Policy Middleware
 * AdSense-compatible CSP configuration
 * 
 * WARNING: CSP can break AdSense if configured incorrectly.
 * This configuration allows AdSense scripts while maintaining security.
 */

export function setupCSP(req, res, next) {
  // CSP directives
  const directives = [
    "default-src 'self'",
    
    // Scripts: Allow AdSense + inline (required for AdSense)
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://adservice.google.com https://www.googletagmanager.com https://www.google-analytics.com https://app.rybbit.io",
    
    // Styles: Allow inline (required for AdSense + Tailwind)
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    
    // Fonts
    "font-src 'self' https://fonts.gstatic.com data:",
    
    // Images: Allow AdSense CDN
    "img-src 'self' data: https: https://pagead2.googlesyndication.com https://www.google.com https://googleads.g.doubleclick.net",
    
    // Frames: Required for AdSense
    "frame-src https://googleads.g.doubleclick.net https://tpc.googlesyndication.com",
    
    // Connect: API calls
    "connect-src 'self' https://pagead2.googlesyndication.com https://www.google-analytics.com https://app.rybbit.io",
    
    // Media
    "media-src 'self'",
    
    // Objects
    "object-src 'none'",
    
    // Base URI
    "base-uri 'self'",
    
    // Form actions
    "form-action 'self'"
  ].join('; ');

  res.setHeader('Content-Security-Policy', directives);
  
  next();
}
