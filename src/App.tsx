import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { BeepMatcherWidget } from './components/BeepMatcherWidget'
import { HomePage } from './components/HomePage'
import { CategoryPage } from './components/CategoryPage'
import { TrustPage } from './components/TrustPage'
import { BlogListPage } from './components/BlogListPage'
import { BlogPostPage } from './components/BlogPostPage'
import { useRouter } from './hooks/use-router'
import { Toaster } from './components/ui/sonner'
import { siteConfig, generateBreadcrumbSchema, categories, getPageMeta } from './lib/seo'
import { useEffect } from 'react'
import { trustPages } from './lib/content'
import { getBlogPostBySlug } from './lib/blog'

function App() {
  const { pathname } = useRouter()

  useEffect(() => {
    const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]')
    jsonLdScripts.forEach(script => script.remove())

    const organizationScript = document.createElement('script')
    organizationScript.type = 'application/ld+json'
    organizationScript.text = JSON.stringify(siteConfig.organizationSchema)
    document.head.appendChild(organizationScript)

    const websiteScript = document.createElement('script')
    websiteScript.type = 'application/ld+json'
    websiteScript.text = JSON.stringify(siteConfig.websiteSchema)
    document.head.appendChild(websiteScript)

    const breadcrumbItems: { name: string; url: string }[] = []
    breadcrumbItems.push({ name: 'Home', url: 'https://alarmbeepguide.com' })

    if (pathname !== '/') {
      const pathParts = pathname.split('/').filter(Boolean)
      if (pathParts.length > 0) {
        const slug = pathParts[0]
        const category = categories.find(c => c.slug === slug)
        if (category) {
          breadcrumbItems.push({ name: category.name, url: `https://alarmbeepguide.com/${slug}` })
        } else {
          const pageName = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
          breadcrumbItems.push({ name: pageName, url: `https://alarmbeepguide.com/${slug}` })
        }
      }
    }

    if (breadcrumbItems.length > 1) {
      const breadcrumbScript = document.createElement('script')
      breadcrumbScript.type = 'application/ld+json'
      breadcrumbScript.text = JSON.stringify(generateBreadcrumbSchema(breadcrumbItems))
      document.head.appendChild(breadcrumbScript)
    }

    let pageMeta
    if (pathname === '/') {
      pageMeta = getPageMeta('home')
    } else if (pathname === '/blog') {
      pageMeta = getPageMeta('blog')
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
      }
    } else {
      const slug = pathname.slice(1)
      const category = categories.find(c => c.slug === slug)
      if (category) {
        pageMeta = category.meta
      } else {
        pageMeta = getPageMeta(slug)
      }
    }

    if (pageMeta) {
      document.title = pageMeta.title
      
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

      if (pageMeta.ogType) {
        let ogType = document.querySelector('meta[property="og:type"]')
        if (!ogType) {
          ogType = document.createElement('meta')
          ogType.setAttribute('property', 'og:type')
          document.head.appendChild(ogType)
        }
        ogType.setAttribute('content', pageMeta.ogType)
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

    if (pathname.startsWith('/blog/')) {
      const slug = pathname.slice(6)
      return <BlogPostPage slug={slug} />
    }

    const slug = pathname.slice(1)
    
    const category = categories.find(c => c.slug === slug)
    if (category) {
      return <CategoryPage slug={slug} />
    }

    const trustPageMap: Record<string, keyof typeof trustPages> = {
      'about': 'about',
      'disclosure': 'disclosure',
      'editorial-policy': 'editorialPolicy',
      'corrections-policy': 'correctionsPolicy',
      'contact': 'contact',
      'privacy': 'privacy',
      'accessibility': 'accessibility'
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
      <Header />
      <main className="flex-1">
        {renderPage()}
      </main>
      <Footer />
      <BeepMatcherWidget />
      <Toaster />
    </div>
  )
}

export default App