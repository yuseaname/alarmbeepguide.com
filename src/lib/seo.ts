export interface PageMeta {
  title: string
  description: string
  canonical: string
  ogType?: string
}

export const siteConfig = {
  name: 'AlarmBeepGuide',
  domain: 'alarmbeepguide.com',
  url: 'https://alarmbeepguide.com',
  description: 'Decode confusing alarm beeps, troubleshoot smoke detectors, fix chirping alerts, and solve household safety device problems without manuals.',
  organizationSchema: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AlarmBeepGuide',
    url: 'https://alarmbeepguide.com',
    logo: 'https://alarmbeepguide.com/assets/alarmbeepguide%20lgo.png',
    description: 'Educational resource for household alarm systems and safety device troubleshooting',
    sameAs: []
  },
  websiteSchema: {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AlarmBeepGuide',
    url: 'https://alarmbeepguide.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://alarmbeepguide.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  }
}

export const categories = [
  {
    id: 'chirp-beep-codes',
    name: 'Chirp & Beep Codes',
    slug: 'chirp-beep-codes',
    description: 'Decode smoke detector chirps, CO alarm beeps, and security system alert patterns. Learn what each beep means and how to fix it.',
    heroImage: '/images/categories/chirp-beep-codes.png',
    icon: 'SpeakerHigh',
    meta: {
      title: 'Chirp & Beep Codes - Decode Alarm Sounds | AlarmBeepGuide',
      description: 'Decode smoke detector chirps, CO alarm beeps, and security system alert patterns. Plain-English explanations for every beep sound.',
      canonical: 'https://alarmbeepguide.com/chirp-beep-codes'
    }
  },
  {
    id: 'fire-extinguishers',
    name: 'Fire Extinguishers',
    slug: 'fire-extinguishers',
    description: 'Fix fire extinguisher indicator lights, reset pressure gauges, troubleshoot inspection alerts, and understand safety certification dates.',
    heroImage: '/images/categories/fire-extinguishers.png',
    icon: 'FireExtinguisher',
    meta: {
      title: 'Fire Extinguisher Troubleshooting & Alerts | AlarmBeepGuide',
      description: 'Fix fire extinguisher indicator lights, reset pressure gauges, and troubleshoot inspection alerts. Easy safety guidance.',
      canonical: 'https://alarmbeepguide.com/fire-extinguishers'
    }
  },
  {
    id: 'home-flood-lights',
    name: 'Home Flood Lights',
    slug: 'home-flood-lights',
    description: 'Troubleshoot motion sensor lights, fix blinking flood lights, adjust sensitivity settings, and solve common outdoor lighting issues.',
    heroImage: '/images/categories/home-flood-lights.png',
    icon: 'Lightbulb',
    meta: {
      title: 'Motion Light & Flood Light Troubleshooting | AlarmBeepGuide',
      description: 'Fix motion sensor lights, troubleshoot blinking flood lights, and adjust sensitivity settings. Stop false triggers today.',
      canonical: 'https://alarmbeepguide.com/home-flood-lights'
    }
  },
  {
    id: 'weather-outage-alerts',
    name: 'Weather & Outage Alerts',
    slug: 'weather-outage-alerts',
    description: 'Understand weather radio alerts, decode NOAA emergency tones, fix battery backup beeps, and manage storm warning systems.',
    heroImage: '/images/categories/weather-outage-alerts.png',
    icon: 'Lightning',
    meta: {
      title: 'Weather Radio & Outage Alert Troubleshooting | AlarmBeepGuide',
      description: 'Decode NOAA emergency tones, fix battery backup beeps, and manage storm warning systems. Stay safe with clear guidance.',
      canonical: 'https://alarmbeepguide.com/weather-outage-alerts'
    }
  },
  {
    id: 'household-alert-fixes',
    name: 'Household Alert Fixes',
    slug: 'household-alert-fixes',
    description: 'Quick fixes for thermostat alerts, appliance error beeps, doorbell chimes, garage door sensors, and common home device notifications.',
    heroImage: '/images/categories/household-alert-fixes.png',
    icon: 'House',
    meta: {
      title: 'Household Alert Fixes - Appliances & Devices | AlarmBeepGuide',
      description: 'Fix thermostat alerts, appliance error beeps, doorbell chimes, and garage sensors. Fast troubleshooting for common home alerts.',
      canonical: 'https://alarmbeepguide.com/household-alert-fixes'
    }
  },
  {
    id: 'alarm-lifespan-replacement-maintenance',
    name: 'Alarm Lifespan, Replacement & Maintenance',
    slug: 'alarm-lifespan-replacement-maintenance',
    description: 'Understand alarm aging, replacement timelines, end-of-life signals, and simple upkeep that keeps safety devices reliable.',
    heroImage: '/images/categories/alarm-lifespan-replacement-maintenance.svg',
    icon: 'Clock',
    meta: {
      title: 'Alarm Lifespan & Replacement Timelines | AlarmBeepGuide',
      description: 'Learn when to replace smoke alarms and CO detectors, how end-of-life signals sound, and simple maintenance that keeps devices reliable.',
      canonical: 'https://alarmbeepguide.com/alarm-lifespan-replacement-maintenance'
    }
  }
]

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  }
}

export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  }
}

export function generateWebPageSchema(page: { title: string; description: string; canonical: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.title,
    description: page.description,
    url: page.canonical,
    isPartOf: siteConfig.websiteSchema
  }
}

export function generateArticleSchema(article: {
  title: string
  description: string
  author: string
  publishDate: string
  lastUpdated?: string
  url: string
}) {
  return {
    '@context': 'https://schema.org',
    // BlogPosting is a more specific subtype of Article and is SEO-safe.
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.description,
    author: {
      '@type': 'Organization',
      name: article.author
    },
    publisher: {
      '@type': 'Organization',
      name: 'AlarmBeepGuide',
      logo: {
        '@type': 'ImageObject',
        url: 'https://alarmbeepguide.com/assets/alarmbeepguide%20lgo.png'
      }
    },
    datePublished: article.publishDate,
    dateModified: article.lastUpdated || article.publishDate,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': article.url
    }
  }
}

export function getPageMeta(page: string): PageMeta {
  const pages: Record<string, PageMeta> = {
    home: {
      title: 'AlarmBeepGuide - Decode Alarm Beeps & Fix Safety Devices',
      description: 'Decode confusing alarm beeps, troubleshoot smoke detectors, fix chirping alerts, and solve household safety device problems without manuals. Fast, plain-English solutions.',
      canonical: 'https://alarmbeepguide.com',
      ogType: 'website'
    },
    blog: {
      title: 'AlarmBeepGuide Blog - Safety Device Troubleshooting Guides',
      description: 'In-depth troubleshooting guides, safety tips, and plain-English explanations for household alarms, detectors, and safety devices.',
      canonical: 'https://alarmbeepguide.com/blog',
      ogType: 'website'
    },
    about: {
      title: 'About AlarmBeepGuide - Your Safety Device Expert',
      description: 'Learn about AlarmBeepGuide\'s mission to decode alarm beeps and provide plain-English safety device troubleshooting for homeowners.',
      canonical: 'https://alarmbeepguide.com/about'
    },
    disclosure: {
      title: 'Advertising Disclosure - AlarmBeepGuide',
      description: 'AlarmBeepGuide\'s transparent advertising disclosure and monetization practices. Learn how we keep content free.',
      canonical: 'https://alarmbeepguide.com/disclosure'
    },
    'editorial-policy': {
      title: 'Editorial Policy - Accuracy & Standards | AlarmBeepGuide',
      description: 'Our commitment to accurate, tested safety information. Learn about AlarmBeepGuide\'s editorial standards and review process.',
      canonical: 'https://alarmbeepguide.com/editorial-policy'
    },
    'fact-checking': {
      title: 'Fact-Checking Policy - AlarmBeepGuide',
      description: 'How AlarmBeepGuide verifies safety information, sources, and updates to keep guidance accurate and trustworthy.',
      canonical: 'https://alarmbeepguide.com/fact-checking'
    },
    'corrections-policy': {
      title: 'Corrections Policy - AlarmBeepGuide',
      description: 'How AlarmBeepGuide handles corrections and updates to maintain accuracy in safety information.',
      canonical: 'https://alarmbeepguide.com/corrections-policy'
    },
    contact: {
      title: 'Contact AlarmBeepGuide - Get Help & Support',
      description: 'Contact AlarmBeepGuide for support, suggestions, or safety questions. We respond quickly to help you solve alarm issues.',
      canonical: 'https://alarmbeepguide.com/contact'
    },
    privacy: {
      title: 'Privacy Policy - AlarmBeepGuide',
      description: 'AlarmBeepGuide\'s privacy policy covering data collection, usage, and security practices.',
      canonical: 'https://alarmbeepguide.com/privacy'
    },
    accessibility: {
      title: 'Accessibility Statement - AlarmBeepGuide',
      description: 'AlarmBeepGuide\'s commitment to web accessibility and inclusive design for all users.',
      canonical: 'https://alarmbeepguide.com/accessibility'
    },
    search: {
      title: 'Search - AlarmBeepGuide',
      description: 'Search AlarmBeepGuide troubleshooting guides and safety tips.',
      canonical: 'https://alarmbeepguide.com/search',
      ogType: 'website'
    }
  }
  
  return pages[page] || pages.home
}

export function generateSitemap(
  blogPosts?: Array<{ slug: string; publishDate: string; lastUpdated?: string; featured: boolean }>
): string {
  const contentDates = (blogPosts || [])
    .flatMap(post => [post.publishDate, post.lastUpdated].filter(Boolean) as string[])
    .map(date => new Date(date))
    .filter(date => !Number.isNaN(date.getTime()))

  const latestContentDate = contentDates.length
    ? new Date(Math.max(...contentDates.map(date => date.getTime())))
    : new Date()

  const siteLastMod = latestContentDate.toISOString().split('T')[0]
  
  const urls = [
    { loc: 'https://alarmbeepguide.com', priority: '1.0', changefreq: 'daily', lastmod: siteLastMod },
    { loc: 'https://alarmbeepguide.com/blog', priority: '0.9', changefreq: 'daily', lastmod: siteLastMod },
    ...categories.map(cat => ({
      loc: `https://alarmbeepguide.com/${cat.slug}`,
      priority: '0.9',
      changefreq: 'weekly',
      lastmod: siteLastMod
    })),
    ...(blogPosts || []).map(post => ({
      loc: `https://alarmbeepguide.com/blog/${post.slug}`,
      priority: post.featured ? '0.8' : '0.7',
      changefreq: 'monthly',
      lastmod: post.lastUpdated || post.publishDate
    })),
    { loc: 'https://alarmbeepguide.com/about', priority: '0.6', changefreq: 'monthly', lastmod: siteLastMod },
    { loc: 'https://alarmbeepguide.com/disclosure', priority: '0.5', changefreq: 'monthly', lastmod: siteLastMod },
    { loc: 'https://alarmbeepguide.com/editorial-policy', priority: '0.5', changefreq: 'monthly', lastmod: siteLastMod },
    { loc: 'https://alarmbeepguide.com/fact-checking', priority: '0.5', changefreq: 'monthly', lastmod: siteLastMod },
    { loc: 'https://alarmbeepguide.com/corrections-policy', priority: '0.5', changefreq: 'monthly', lastmod: siteLastMod },
    { loc: 'https://alarmbeepguide.com/contact', priority: '0.6', changefreq: 'monthly', lastmod: siteLastMod },
    { loc: 'https://alarmbeepguide.com/privacy', priority: '0.5', changefreq: 'monthly', lastmod: siteLastMod },
    { loc: 'https://alarmbeepguide.com/accessibility', priority: '0.5', changefreq: 'monthly', lastmod: siteLastMod }
  ]
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`
}

export function generateRobotsTxt(): string {
  return `User-agent: *
Allow: /

Sitemap: https://alarmbeepguide.com/sitemap.xml

User-agent: Googlebot
Allow: /
Crawl-delay: 0

User-agent: Googlebot-Image
Allow: /

User-agent: Bingbot
Allow: /
Crawl-delay: 0`
}
