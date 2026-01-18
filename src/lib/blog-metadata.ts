/**
 * Build-time blog metadata (no markdown content imports)
 * Used by scripts that run in Node.js environment (tsx)
 */

export interface BlogPostMetadata {
  slug: string
  publishDate: string
  lastUpdated?: string
  featured: boolean
}

export const blogPostsMetadata: BlogPostMetadata[] = [
  {
    slug: 'smoke-detector-chirping-low-battery',
    publishDate: '2024-01-15',
    featured: true
  },
  {
    slug: 'carbon-monoxide-detector-beeping-patterns',
    publishDate: '2024-01-18',
    featured: true
  },
  {
    slug: 'motion-sensor-light-stays-on',
    publishDate: '2024-01-20',
    featured: false
  },
  {
    slug: 'fire-extinguisher-pressure-gauge-reading',
    publishDate: '2024-01-25',
    featured: true
  },
  {
    slug: 'fire-extinguisher-when-to-replace',
    publishDate: '2024-01-28',
    featured: true
  },
  {
    slug: 'noaa-weather-radio-alerts-setup-guide',
    publishDate: '2024-02-01',
    featured: true
  },
  {
    slug: 'hardwired-smoke-detector-beeping-troubleshooting',
    publishDate: '2024-02-08',
    featured: true
  },
  {
    slug: 'heat-detector-vs-smoke-detector',
    publishDate: '2024-02-10',
    featured: false
  },
  {
    slug: 'emergency-alert-system-phone-sounds',
    publishDate: '2024-02-05',
    featured: true
  },
  {
    slug: 'security-system-beeping-codes',
    publishDate: '2024-02-12',
    featured: true
  },
  {
    slug: 'smoke-detector-false-alarms',
    publishDate: '2024-02-15',
    featured: true
  },
  {
    slug: 'smoke-detector-chirping-after-battery-change',
    publishDate: '2024-02-20',
    featured: true
  },
  {
    slug: 'combo-smoke-co-alarm-beeping-patterns',
    publishDate: '2024-02-21',
    featured: true
  },
  {
    slug: '10-year-sealed-battery-smoke-detector-chirping',
    publishDate: '2024-02-22',
    featured: false
  },
  {
    slug: 'refrigerator-beeping-meaning-fixes',
    publishDate: '2024-03-01',
    featured: false
  },
  {
    slug: 'dishwasher-beeping-meaning-fixes',
    publishDate: '2024-03-02',
    featured: false
  },
  {
    slug: 'garage-door-opener-beeping-meaning-fixes',
    publishDate: '2024-03-03',
    featured: false
  },
  {
    slug: 'best-smoke-alarms-home-safety',
    publishDate: '2024-03-04',
    featured: false
  },
  {
    slug: 'first-alert-vs-kidde-smoke-alarms',
    publishDate: '2024-03-05',
    featured: false
  },
  {
    slug: 'are-smart-smoke-alarms-worth-it',
    publishDate: '2024-03-06',
    featured: false
  },
  {
    slug: 'fire-extinguisher-types-guide',
    publishDate: '2024-03-07',
    featured: false
  },
  {
    slug: 'fire-extinguisher-inspection-checklist',
    publishDate: '2024-03-08',
    featured: false
  },
  {
    slug: 'fire-extinguisher-mounting-height-placement',
    publishDate: '2024-03-09',
    featured: false
  },
  {
    slug: 'how-long-do-smoke-detectors-last',
    publishDate: '2026-01-15',
    featured: false
  },
  {
    slug: 'when-to-replace-a-carbon-monoxide-detector',
    publishDate: '2026-01-16',
    featured: false
  },
  {
    slug: 'smoke-alarm-end-of-life-beeps',
    publishDate: '2026-01-17',
    featured: false
  }
]
