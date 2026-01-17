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
    publishDate: '2025-01-15',
    featured: true
  },
  {
    slug: 'how-long-do-smoke-detectors-last',
    publishDate: '2025-01-15',
    featured: true
  },
  {
    slug: 'when-to-replace-a-carbon-monoxide-detector',
    publishDate: '2025-01-15',
    featured: true
  },
  {
    slug: 'smoke-alarm-end-of-life-beeps',
    publishDate: '2025-01-15',
    featured: false
  }
]
