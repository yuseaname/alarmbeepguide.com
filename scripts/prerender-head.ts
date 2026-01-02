import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'

import { blogPosts, getBlogPostBySlug, type BlogPost } from '../src/lib/blog'
import {
  categories,
  getPageMeta,
  siteConfig,
  generateArticleSchema,
  generateBreadcrumbSchema,
  generateFAQSchema
} from '../src/lib/seo'
import { trustPages } from '../src/lib/content'

type HeadSpec = {
  title: string
  description: string
  canonical: string
  ogType: string
  robots: string
  jsonLd: Array<{ id: string; json: unknown; attrs?: Record<string, string> }>
}

type Route = {
  pathname: string
  head: HeadSpec
}

function escapeHtmlAttribute(value: string) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

function upsertMeta(html: string, selector: RegExp, tag: string) {
  if (selector.test(html)) return html.replace(selector, tag)
  return html.replace('</head>', `  ${tag}\n</head>`)
}

function removeJsonLd(html: string) {
  return html.replace(/\s*<script[^>]*type=["']application\/ld\+json["'][\s\S]*?<\/script>\s*/g, '\n')
}

function applyHead(baseHtml: string, head: HeadSpec) {
  let html = baseHtml

  // Title
  if (/<title>[\s\S]*?<\/title>/i.test(html)) {
    html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtmlAttribute(head.title)}</title>`)
  } else {
    html = html.replace('</head>', `  <title>${escapeHtmlAttribute(head.title)}</title>\n</head>`)
  }

  // Standard meta
  html = upsertMeta(
    html,
    /<meta\s+name=["']description["'][^>]*>/i,
    `<meta name="description" content="${escapeHtmlAttribute(head.description)}" />`
  )

  html = upsertMeta(
    html,
    /<meta\s+name=["']robots["'][^>]*>/i,
    `<meta name="robots" content="${escapeHtmlAttribute(head.robots)}" />`
  )

  // Canonical
  if (/<link\s+rel=["']canonical["'][^>]*>/i.test(html)) {
    html = html.replace(
      /<link\s+rel=["']canonical["'][^>]*>/i,
      `<link rel="canonical" href="${escapeHtmlAttribute(head.canonical)}" />`
    )
  } else {
    html = html.replace('</head>', `  <link rel="canonical" href="${escapeHtmlAttribute(head.canonical)}" />\n</head>`)
  }

  // Open Graph
  html = upsertMeta(
    html,
    /<meta\s+property=["']og:locale["'][^>]*>/i,
    `<meta property="og:locale" content="en_US" />`
  )
  html = upsertMeta(
    html,
    /<meta\s+property=["']og:type["'][^>]*>/i,
    `<meta property="og:type" content="${escapeHtmlAttribute(head.ogType)}" />`
  )
  html = upsertMeta(
    html,
    /<meta\s+property=["']og:title["'][^>]*>/i,
    `<meta property="og:title" content="${escapeHtmlAttribute(head.title)}" />`
  )
  html = upsertMeta(
    html,
    /<meta\s+property=["']og:description["'][^>]*>/i,
    `<meta property="og:description" content="${escapeHtmlAttribute(head.description)}" />`
  )
  html = upsertMeta(
    html,
    /<meta\s+property=["']og:url["'][^>]*>/i,
    `<meta property="og:url" content="${escapeHtmlAttribute(head.canonical)}" />`
  )
  html = upsertMeta(
    html,
    /<meta\s+property=["']og:site_name["'][^>]*>/i,
    `<meta property="og:site_name" content="${escapeHtmlAttribute(siteConfig.name)}" />`
  )

  // Twitter
  html = upsertMeta(
    html,
    /<meta\s+name=["']twitter:card["'][^>]*>/i,
    `<meta name="twitter:card" content="summary_large_image" />`
  )
  html = upsertMeta(
    html,
    /<meta\s+name=["']twitter:title["'][^>]*>/i,
    `<meta name="twitter:title" content="${escapeHtmlAttribute(head.title)}" />`
  )
  html = upsertMeta(
    html,
    /<meta\s+name=["']twitter:description["'][^>]*>/i,
    `<meta name="twitter:description" content="${escapeHtmlAttribute(head.description)}" />`
  )

  // JSON-LD (remove any existing first)
  html = removeJsonLd(html)

  const jsonLdTags = head.jsonLd
    .map(item => {
      const attrs = Object.entries(item.attrs ?? {})
        .map(([k, v]) => ` ${k}="${escapeHtmlAttribute(v)}"`)
        .join('')
      return `  <script type="application/ld+json"${attrs}>${JSON.stringify(item.json)}</script>`
    })
    .join('\n')

  html = html.replace('</head>', `${jsonLdTags}\n</head>`)

  return html
}

function titleFromSlug(slug: string) {
  return slug
    .split('-')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function makeBaseSchemas() {
  return [
    { id: 'org', json: siteConfig.organizationSchema, attrs: { 'data-app-schema': 'organization' } },
    { id: 'site', json: siteConfig.websiteSchema, attrs: { 'data-app-schema': 'website' } }
  ]
}

function makeBreadcrumb(items: { name: string; url: string }[]) {
  return { id: 'breadcrumb', json: generateBreadcrumbSchema(items), attrs: { 'data-app-schema': 'breadcrumb' } }
}

function makeArticleSchemas(post: BlogPost) {
  const schemas: Array<{ id: string; json: unknown; attrs?: Record<string, string> }> = []

  schemas.push({
    id: 'article',
    json: generateArticleSchema({
      title: post.title,
      description: post.excerpt,
      author: post.author,
      publishDate: post.publishDate,
      lastUpdated: post.lastUpdated,
      url: `${siteConfig.url}/blog/${post.slug}`
    }),
    attrs: { 'data-blog-schema': 'article' }
  })

  if (post.faqs && post.faqs.length > 0) {
    schemas.push({
      id: 'faq',
      json: generateFAQSchema(post.faqs),
      attrs: { 'data-blog-schema': 'faq' }
    })
  }

  return schemas
}

function buildRoutes(): Route[] {
  const routes: Route[] = []

  const defaultRobots = 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'

  // Home
  {
    const meta = getPageMeta('home')
    routes.push({
      pathname: '/',
      head: {
        title: meta.title,
        description: meta.description,
        canonical: meta.canonical,
        ogType: meta.ogType ?? 'website',
        robots: defaultRobots,
        jsonLd: makeBaseSchemas()
      }
    })
  }

  // Blog listing
  {
    const meta = getPageMeta('blog')
    routes.push({
      pathname: '/blog',
      head: {
        title: meta.title,
        description: meta.description,
        canonical: meta.canonical,
        ogType: meta.ogType ?? 'website',
        robots: defaultRobots,
        jsonLd: [
          ...makeBaseSchemas(),
          makeBreadcrumb([
            { name: 'Home', url: siteConfig.url },
            { name: 'Blog', url: `${siteConfig.url}/blog` }
          ])
        ]
      }
    })
  }

  // Categories
  for (const cat of categories) {
    routes.push({
      pathname: `/${cat.slug}`,
      head: {
        title: cat.meta.title,
        description: cat.meta.description,
        canonical: cat.meta.canonical,
        ogType: 'website',
        robots: defaultRobots,
        jsonLd: [
          ...makeBaseSchemas(),
          makeBreadcrumb([
            { name: 'Home', url: siteConfig.url },
            { name: cat.name, url: cat.meta.canonical }
          ])
        ]
      }
    })
  }

  // Trust pages
  const trustSlugs: string[] = [
    'about',
    'disclosure',
    'editorial-policy',
    'corrections-policy',
    'contact',
    'privacy',
    'accessibility'
  ]

  for (const slug of trustSlugs) {
    const meta = getPageMeta(slug)
    routes.push({
      pathname: `/${slug}`,
      head: {
        title: meta.title,
        description: meta.description,
        canonical: meta.canonical,
        ogType: 'website',
        robots: defaultRobots,
        jsonLd: [
          ...makeBaseSchemas(),
          makeBreadcrumb([
            { name: 'Home', url: siteConfig.url },
            { name: titleFromSlug(slug), url: meta.canonical }
          ])
        ]
      }
    })
  }

  // Search page (noindex)
  {
    const meta = getPageMeta('search')
    routes.push({
      pathname: '/search',
      head: {
        title: meta.title,
        description: meta.description,
        canonical: meta.canonical,
        ogType: 'website',
        robots: 'noindex, follow',
        jsonLd: [
          ...makeBaseSchemas(),
          makeBreadcrumb([
            { name: 'Home', url: siteConfig.url },
            { name: 'Search', url: meta.canonical }
          ])
        ]
      }
    })
  }

  // Blog posts
  for (const post of blogPosts) {
    routes.push({
      pathname: `/blog/${post.slug}`,
      head: {
        title: post.metaTitle,
        description: post.metaDescription,
        canonical: `${siteConfig.url}/blog/${post.slug}`,
        ogType: 'article',
        robots: defaultRobots,
        jsonLd: [
          ...makeBaseSchemas(),
          makeBreadcrumb([
            { name: 'Home', url: siteConfig.url },
            { name: 'Blog', url: `${siteConfig.url}/blog` },
            { name: post.title, url: `${siteConfig.url}/blog/${post.slug}` }
          ]),
          ...makeArticleSchemas(post)
        ]
      }
    })
  }

  // Ensure trust content object is referenced (avoids accidental tree-shake surprises)
  void trustPages

  return routes
}

async function writeRouteHtml(distDir: string, route: Route, baseHtml: string) {
  const normalized = route.pathname.replace(/\/$/, '')
  const outDir = normalized === '' ? distDir : path.join(distDir, normalized)
  const outFile = path.join(outDir, 'index.html')

  await mkdir(outDir, { recursive: true })
  await writeFile(outFile, applyHead(baseHtml, route.head), 'utf8')
}

function looksLikeProductionIndex(html: string) {
  const hasAssets = html.includes('/assets/')
  const referencesSrc = html.includes('/src/main.tsx')
  return hasAssets && !referencesSrc
}

async function main() {
  const distDir = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(process.cwd(), 'dist')
  const indexPath = path.join(distDir, 'index.html')

  if (!existsSync(indexPath)) {
    throw new Error(`Missing ${indexPath}. Run vite build first.`)
  }

  const baseHtml = await readFile(indexPath, 'utf8')

  if (!looksLikeProductionIndex(baseHtml)) {
    throw new Error(`Refusing to prerender: ${indexPath} does not look like a production Vite build (expected /assets/ and no /src/main.tsx).`)
  }

  const routes = buildRoutes()
  await Promise.all(routes.map(r => writeRouteHtml(distDir, r, baseHtml)))

  // eslint-disable-next-line no-console
  console.log(`Prerendered head-only HTML for ${routes.length} routes into ${distDir}`)
}

await main()
