import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { BeepMatcherWidget } from './components/BeepMatcherWidget'
import { HomePage } from './components/HomePage'
import { useRouter } from './hooks/use-router'
import { Toaster } from './components/ui/sonner'
import { siteConfig, generateBreadcrumbSchema, categories, getPageMeta, generateWebPageSchema } from './lib/seo'
import { useEffect, lazy, Suspense } from 'react'
import { trustPages } from './lib/content'
import { getBlogPostBySlug } from './lib/blog'

const trustPageMap: Record<string, keyof typeof trustPages> = {
  'about': 'about',
  'disclosure': 'disclosure',
  'editorial-policy': 'editorialPolicy',
  'fact-checking': 'factChecking',
  'corrections-policy': 'correctionsPolicy',
  'contact': 'contact',
  'privacy': 'privacy',
  'accessibility': 'accessibility'
}

// Lazy route modules reduce initial JS without altering URLs or rendering behavior.
const CategoryPage = lazy(() =>
  import('./components/CategoryPage').then(mod => ({ default: mod.CategoryPage }))
)
const TrustPage = lazy(() =>
  import('./components/TrustPage').then(mod => ({ default: mod.TrustPage }))
)
const BlogListPage = lazy(() =>
  import('./components/BlogListPage').then(mod => ({ default: mod.BlogListPage }))
)
const BlogPostPage = lazy(() =>
  import('./components/BlogPostPage').then(mod => ({ default: mod.BlogPostPage }))
)
const SearchPage = lazy(() =>
  import('./components/SearchPage').then(mod => ({ default: mod.SearchPage }))
)

function App() {
  const { pathname } = useRouter()

  useEffect(() => {
    const jsonLdScripts = document.querySelectorAll('script[data-app-schema]')
    jsonLdScripts.forEach(script => script.remove())

    const organizationScript = document.createElement('script')
    organizationScript.type = 'application/ld+json'
    organizationScript.setAttribute('data-app-schema', 'organization')
    organizationScript.text = JSON.stringify(siteConfig.organizationSchema)
    document.head.appendChild(organizationScript)

    const websiteScript = document.createElement('script')
    websiteScript.type = 'application/ld+json'
    websiteScript.setAttribute('data-app-schema', 'website')
    websiteScript.text = JSON.stringify(siteConfig.websiteSchema)
    document.head.appendChild(websiteScript)

    const breadcrumbItems: { name: string; url: string }[] = []
    breadcrumbItems.push({ name: 'Home', url: 'https://alarmbeepguide.com' })

    if (pathname === '/blog') {
      breadcrumbItems.push({ name: 'Blog', url: 'https://alarmbeepguide.com/blog' })
    } else if (pathname.startsWith('/blog/')) {
      breadcrumbItems.push({ name: 'Blog', url: 'https://alarmbeepguide.com/blog' })
      const slug = pathname.slice(6)
      const post = getBlogPostBySlug(slug)
      if (post) {
        breadcrumbItems.push({ name: post.title, url: `https://alarmbeepguide.com/blog/${post.slug}` })
      }
    } else if (pathname !== '/') {
      const slug = pathname.slice(1)
      const category = categories.find(c => c.slug === slug)
      if (category) {
        breadcrumbItems.push({ name: category.name, url: `https://alarmbeepguide.com/${slug}` })
      } else {
        const pageName = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        breadcrumbItems.push({ name: pageName, url: `https://alarmbeepguide.com/${slug}` })
      }
    }

    if (breadcrumbItems.length > 1) {
      const breadcrumbScript = document.createElement('script')
      breadcrumbScript.type = 'application/ld+json'
      breadcrumbScript.setAttribute('data-app-schema', 'breadcrumb')
      breadcrumbScript.text = JSON.stringify(generateBreadcrumbSchema(breadcrumbItems))
      document.head.appendChild(breadcrumbScript)
    }

    let pageMeta
    let isNotFound = false
    if (pathname === '/') {
      pageMeta = getPageMeta('home')
    } else if (pathname === '/blog') {
      pageMeta = getPageMeta('blog')
    } else if (pathname === '/search') {
      pageMeta = getPageMeta('search')
    } else if (pathname.startsWith('/blog/')) {
      const slug = pathname.slice(6)
      const post = getBlogPostBySlug(slug)
      if (post) {
        pageMeta = {
          title: post.metaTitle,
          description: post.metaDescription,
          canonical: `https://alarmbeepguide.com/blog/${post.slug}`,
          ogType: 'article'
        }
      } else {
        isNotFound = true
      }
    } else {
      const slug = pathname.slice(1)
      const category = categories.find(c => c.slug === slug)
      if (category) {
        pageMeta = category.meta
      } else if (trustPageMap[slug]) {
        pageMeta = getPageMeta(slug)
      } else {
        isNotFound = true
      }
    }

    if (!pageMeta) {
      // Avoid defaulting to the homepage canonical on unknown routes.
      pageMeta = {
        title: 'Page Not Found | AlarmBeepGuide',
        description: 'The page you are looking for does not exist.',
        canonical: `${siteConfig.url}${pathname === '/' ? '' : pathname}`,
        ogType: 'website'
      }
    }

    if (pageMeta) {
      document.title = pageMeta.title

      const robotsValue = pathname === '/search' || isNotFound
        ? 'noindex, follow'
        : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'

      let metaRobots = document.querySelector('meta[name="robots"]')
      if (!metaRobots) {
        metaRobots = document.createElement('meta')
        metaRobots.setAttribute('name', 'robots')
        document.head.appendChild(metaRobots)
      }
      metaRobots.setAttribute('content', robotsValue)
      
      let metaDescription = document.querySelector('meta[name="description"]')
      if (!metaDescription) {
        metaDescription = document.createElement('meta')
        metaDescription.setAttribute('name', 'description')
        document.head.appendChild(metaDescription)
      }
      metaDescription.setAttribute('content', pageMeta.description)

      let ogTitle = document.querySelector('meta[property="og:title"]')
      if (!ogTitle) {
        ogTitle = document.createElement('meta')
        ogTitle.setAttribute('property', 'og:title')
        document.head.appendChild(ogTitle)
      }
      ogTitle.setAttribute('content', pageMeta.title)

      let ogSiteName = document.querySelector('meta[property="og:site_name"]')
      if (!ogSiteName) {
        ogSiteName = document.createElement('meta')
        ogSiteName.setAttribute('property', 'og:site_name')
        document.head.appendChild(ogSiteName)
      }
      ogSiteName.setAttribute('content', siteConfig.name)

      let ogDescription = document.querySelector('meta[property="og:description"]')
      if (!ogDescription) {
        ogDescription = document.createElement('meta')
        ogDescription.setAttribute('property', 'og:description')
        document.head.appendChild(ogDescription)
      }
      ogDescription.setAttribute('content', pageMeta.description)

      let ogUrl = document.querySelector('meta[property="og:url"]')
      if (!ogUrl) {
        ogUrl = document.createElement('meta')
        ogUrl.setAttribute('property', 'og:url')
        document.head.appendChild(ogUrl)
      }
      ogUrl.setAttribute('content', pageMeta.canonical)

      let canonical = document.querySelector('link[rel="canonical"]')
      if (!canonical) {
        canonical = document.createElement('link')
        canonical.setAttribute('rel', 'canonical')
        document.head.appendChild(canonical)
      }
      canonical.setAttribute('href', pageMeta.canonical)

      // Ensure a stable OG type even when page metadata omits it.
      let ogType = document.querySelector('meta[property="og:type"]')
      if (!ogType) {
        ogType = document.createElement('meta')
        ogType.setAttribute('property', 'og:type')
        document.head.appendChild(ogType)
      }
      ogType.setAttribute('content', pageMeta.ogType || 'website')

      let twitterCard = document.querySelector('meta[name="twitter:card"]')
      if (!twitterCard) {
        twitterCard = document.createElement('meta')
        twitterCard.setAttribute('name', 'twitter:card')
        document.head.appendChild(twitterCard)
      }
      twitterCard.setAttribute('content', 'summary_large_image')

      let twitterTitle = document.querySelector('meta[name="twitter:title"]')
      if (!twitterTitle) {
        twitterTitle = document.createElement('meta')
        twitterTitle.setAttribute('name', 'twitter:title')
        document.head.appendChild(twitterTitle)
      }
      twitterTitle.setAttribute('content', pageMeta.title)

      let twitterDescription = document.querySelector('meta[name="twitter:description"]')
      if (!twitterDescription) {
        twitterDescription = document.createElement('meta')
        twitterDescription.setAttribute('name', 'twitter:description')
        document.head.appendChild(twitterDescription)
      }
      twitterDescription.setAttribute('content', pageMeta.description)

      // Add WebPage schema for non-post pages (additive, safe for SEO consistency).
      if (!pathname.startsWith('/blog/') && pathname !== '/search' && !isNotFound) {
        const webPageScript = document.createElement('script')
        webPageScript.type = 'application/ld+json'
        webPageScript.setAttribute('data-app-schema', 'webpage')
        webPageScript.text = JSON.stringify(generateWebPageSchema({
          title: pageMeta.title,
          description: pageMeta.description,
          canonical: pageMeta.canonical
        }))
        document.head.appendChild(webPageScript)
      }
    }
  }, [pathname])

  const renderPage = () => {
    if (pathname === '/') {
      return <HomePage />
    }

    if (pathname === '/blog') {
      return <BlogListPage />
    }

    if (pathname === '/search') {
      return <SearchPage />
    }

    if (pathname.startsWith('/blog/')) {
      const slug = pathname.slice(6)
      return <BlogPostPage slug={slug} />
    }

    const slug = pathname.slice(1)
    
    const category = categories.find(c => c.slug === slug)
    if (category) {
      return <CategoryPage slug={slug} />
    }

    const trustPageKey = trustPageMap[slug]
    if (trustPageKey) {
      return <TrustPage pageKey={trustPageKey} />
    }

    return (
      <div className="container mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="mb-4 text-3xl font-bold">Page Not Found</h1>
        <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <Header />
      <main id="main-content" className="flex-1">
        <Suspense
          fallback={
            <div className="container mx-auto max-w-4xl px-4 py-16 text-sm text-muted-foreground">
              Loading...
            </div>
          }
        >
          {renderPage()}
        </Suspense>
      </main>
      <Footer />
      <BeepMatcherWidget />
      <Toaster />
    </div>
  )
}

export default App
