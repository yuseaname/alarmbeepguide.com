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
    logo: 'https://alarmbeepguide.com/logo.png',
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
    icon: 'House',
    meta: {
      title: 'Household Alert Fixes - Appliances & Devices | AlarmBeepGuide',
      description: 'Fix thermostat alerts, appliance error beeps, doorbell chimes, and garage sensors. Fast troubleshooting for common home alerts.',
      canonical: 'https://alarmbeepguide.com/household-alert-fixes'
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

export function getPageMeta(page: string): PageMeta {
  const pages: Record<string, PageMeta> = {
    home: {
      title: 'AlarmBeepGuide - Decode Alarm Beeps & Fix Safety Devices',
      description: 'Decode confusing alarm beeps, troubleshoot smoke detectors, fix chirping alerts, and solve household safety device problems without manuals. Fast, plain-English solutions.',
      canonical: 'https://alarmbeepguide.com',
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
    }
  }
  
  return pages[page] || pages.home
}

export function generateSitemap(): string {
  const today = new Date().toISOString().split('T')[0]
  
  const urls = [
    { loc: 'https://alarmbeepguide.com', priority: '1.0', changefreq: 'daily' },
    ...categories.map(cat => ({
      loc: `https://alarmbeepguide.com/${cat.slug}`,
      priority: '0.9',
      changefreq: 'weekly'
    })),
    { loc: 'https://alarmbeepguide.com/about', priority: '0.6', changefreq: 'monthly' },
    { loc: 'https://alarmbeepguide.com/disclosure', priority: '0.5', changefreq: 'monthly' },
    { loc: 'https://alarmbeepguide.com/editorial-policy', priority: '0.5', changefreq: 'monthly' },
    { loc: 'https://alarmbeepguide.com/corrections-policy', priority: '0.5', changefreq: 'monthly' },
    { loc: 'https://alarmbeepguide.com/contact', priority: '0.6', changefreq: 'monthly' },
    { loc: 'https://alarmbeepguide.com/privacy', priority: '0.5', changefreq: 'monthly' },
    { loc: 'https://alarmbeepguide.com/accessibility', priority: '0.5', changefreq: 'monthly' }
  ]
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${today}</lastmod>
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