import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Link } from './Link'
import { House, CaretRight, Clock, Calendar, ArrowLeft, Tag } from '@phosphor-icons/react'
import { getBlogPostBySlug, getBlogPostsByCategory, type BlogPost } from '@/lib/blog'
import { categories } from '@/lib/seo'
import { Separator } from './ui/separator'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion'
import { useEffect } from 'react'
import { generateFAQSchema, generateArticleSchema } from '@/lib/seo'
import { getUniqueAnchorId, normalizeHeadingText } from '@/lib/anchors'

interface BlogPostPageProps {
  slug: string
}

export function BlogPostPage({ slug }: BlogPostPageProps) {
  const post = getBlogPostBySlug(slug)

  useEffect(() => {
    if (!post) return

    const existingSchemas = document.querySelectorAll('script[data-blog-schema]')
    existingSchemas.forEach(script => script.remove())

    const articleScript = document.createElement('script')
    articleScript.type = 'application/ld+json'
    articleScript.setAttribute('data-blog-schema', 'article')
    articleScript.text = JSON.stringify(generateArticleSchema({
      title: post.title,
      description: post.excerpt,
      author: post.author,
      publishDate: post.publishDate,
      lastUpdated: post.lastUpdated,
      url: `https://alarmbeepguide.com/blog/${post.slug}`
    }))
    document.head.appendChild(articleScript)

    if (post.faqs && post.faqs.length > 0) {
      const faqScript = document.createElement('script')
      faqScript.type = 'application/ld+json'
      faqScript.setAttribute('data-blog-schema', 'faq')
      faqScript.text = JSON.stringify(generateFAQSchema(post.faqs))
      document.head.appendChild(faqScript)
    }

    return () => {
      const scripts = document.querySelectorAll('script[data-blog-schema]')
      scripts.forEach(script => script.remove())
    }
  }, [post])

  if (!post) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="mb-4 text-3xl font-bold">Blog Post Not Found</h1>
        <p className="mb-8 text-muted-foreground">The article you're looking for doesn't exist.</p>
        <Button asChild>
          <Link href="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>
        </Button>
      </div>
    )
  }

  const relatedPosts = getBlogPostsByCategory(post.category)
    .filter(p => p.id !== post.id)
    .slice(0, 3)

  const category = categories.find(c => c.id === post.category)

  return (
    <div className="min-h-screen">
      <BlogPostBreadcrumbs post={post} />
      <BlogPostHeader post={post} />
      <BlogPostContent post={post} />
      {post.faqs && post.faqs.length > 0 && <BlogPostFAQs faqs={post.faqs} />}
      {relatedPosts.length > 0 && <RelatedPosts posts={relatedPosts} currentPost={post} />}
      {category && <CategoryCallToAction category={category} />}
    </div>
  )
}

function BlogPostBreadcrumbs({ post }: { post: BlogPost }) {
  const category = categories.find(c => c.id === post.category)
  
  return (
    <nav className="border-b border-border bg-card">
      <div className="container mx-auto max-w-4xl px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">
            <House className="h-4 w-4" />
          </Link>
          <CaretRight className="h-4 w-4" />
          <Link href="/blog" className="hover:text-primary">
            Blog
          </Link>
          {category && (
            <>
              <CaretRight className="h-4 w-4" />
              <Link href={`/${category.slug}`} className="hover:text-primary">
                {category.name}
              </Link>
            </>
          )}
          <CaretRight className="h-4 w-4" />
          <span className="text-foreground font-medium line-clamp-1">{post.title}</span>
        </div>
      </div>
    </nav>
  )
}

function BlogPostHeader({ post }: { post: BlogPost }) {
  const category = categories.find(c => c.id === post.category)
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  return (
    <section className="border-b border-border bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto max-w-4xl px-4 py-12 md:py-16">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {category && (
            <Badge variant="secondary">
              {category.name}
            </Badge>
          )}
          {post.featured && (
            <Badge variant="default">
              Featured Guide
            </Badge>
          )}
        </div>
        
        <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          {post.title}
        </h1>
        
        <p className="mb-6 text-lg leading-relaxed text-muted-foreground">
          {post.excerpt}
        </p>

        <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Published {formatDate(post.publishDate)}</span>
          </div>
          {post.lastUpdated && post.lastUpdated !== post.publishDate && (
            <div className="flex items-center gap-2">
              <span>Updated {formatDate(post.lastUpdated)}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{post.readTime} min read</span>
          </div>
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <div key={tag} className="flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
                <Tag className="h-3 w-3" />
                <span>{tag}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function BlogPostContent({ post }: { post: BlogPost }) {
  const renderContent = (content: string) => {
    const sections = content.split('\n\n')
    const usedAnchors = new Map<string, number>()
    
    return sections.map((section, index) => {
      if (section.startsWith('## ')) {
        const headingText = normalizeHeadingText(section)
        const id = getUniqueAnchorId(headingText, usedAnchors)
        return (
          <h2
            key={index}
            id={id || undefined}
            className="mb-4 mt-10 scroll-mt-24 text-3xl font-semibold tracking-tight text-foreground first:mt-0"
          >
            {headingText}
          </h2>
        )
      }
      
      if (section.startsWith('### ')) {
        const headingText = normalizeHeadingText(section)
        const id = getUniqueAnchorId(headingText, usedAnchors)
        return (
          <h3 key={index} id={id || undefined} className="mb-3 mt-8 scroll-mt-24 text-2xl font-medium text-foreground">
            {headingText}
          </h3>
        )
      }

      if (section.startsWith('**') && section.endsWith('**')) {
        return (
          <p key={index} className="mb-4 text-base font-semibold leading-relaxed text-foreground">
            {section.replace(/\*\*/g, '')}
          </p>
        )
      }

      if (section.startsWith('- ') || section.match(/^\d+\. /)) {
        const items = section.split('\n')
        const isOrdered = items[0].match(/^\d+\. /)
        
        const ListComponent = isOrdered ? 'ol' : 'ul'
        const listClass = isOrdered 
          ? 'mb-6 list-decimal space-y-2 pl-6 text-base leading-relaxed text-foreground'
          : 'mb-6 list-disc space-y-2 pl-6 text-base leading-relaxed text-foreground'
        
        return (
          <ListComponent key={index} className={listClass}>
            {items.map((item, i) => {
              const cleanItem = item.replace(/^\s*(?:[-*•–—]|\d+\.)\s+/, '')
              const isBold = cleanItem.startsWith('**')
              
              if (isBold) {
                const parts = cleanItem.split('**')
                return (
                  <li key={i}>
                    <strong>{parts[1]}</strong>
                    {parts[2] && renderInlineFormatting(parts[2])}
                  </li>
                )
              }
              
              return <li key={i}>{renderInlineFormatting(cleanItem)}</li>
            })}
          </ListComponent>
        )
      }

      if (section.trim().length === 0) {
        return null
      }

      return (
        <p key={index} className="mb-6 text-base leading-relaxed text-foreground">
          {renderInlineFormatting(section)}
        </p>
      )
    })
  }

  const renderInlineFormatting = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/)

    const renderLinks = (plain: string, keyPrefix: string) => {
      const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g
      const nodes: Array<string | JSX.Element> = []

      let lastIndex = 0
      let match: RegExpExecArray | null
      let linkIndex = 0

      while ((match = linkPattern.exec(plain)) !== null) {
        const [full, label, href] = match
        const start = match.index
        const end = start + full.length

        if (start > lastIndex) {
          nodes.push(plain.slice(lastIndex, start))
        }

        const isHashLink = href.includes('#') && !href.startsWith('http')
        const isInternal = href.startsWith('/')
        if (isHashLink) {
          nodes.push(
            <a
              key={`${keyPrefix}-link-${linkIndex}`}
              href={href}
              className="text-primary underline underline-offset-4 hover:text-primary/80"
            >
              {label}
            </a>
          )
        } else if (isInternal) {
          nodes.push(
            <Link key={`${keyPrefix}-link-${linkIndex}`} href={href} className="text-primary underline underline-offset-4 hover:text-primary/80">
              {label}
            </Link>
          )
        } else {
          nodes.push(
            <a
              key={`${keyPrefix}-link-${linkIndex}`}
              href={href}
              className="text-primary underline underline-offset-4 hover:text-primary/80"
              target="_blank"
              rel="noreferrer"
            >
              {label}
            </a>
          )
        }

        lastIndex = end
        linkIndex += 1
      }

      if (lastIndex < plain.length) {
        nodes.push(plain.slice(lastIndex))
      }

      return nodes
    }
    
    return parts.flatMap((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return [<strong key={`b-${index}`}>{part.replace(/\*\*/g, '')}</strong>]
      }

      return renderLinks(part, `p-${index}`)
    })
  }

  return (
    <section className="bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <article className="prose prose-lg max-w-none">
          {renderContent(post.content)}
        </article>

        {/* Reserved ad slot container to prevent CLS when ads are introduced. */}
        <div
          className="my-10 min-h-[180px] rounded-lg border border-dashed border-border/60 bg-muted/20"
          data-ad-slot="article-inline"
          aria-hidden="true"
        />

        <Separator className="my-12" />

        <div className="rounded-lg border border-border bg-muted/50 p-6">
          <p className="text-sm leading-relaxed text-muted-foreground">
            <strong className="text-foreground">Safety Note:</strong> This guide provides general troubleshooting information. 
            For emergency situations, always call 911 or your local emergency services. 
            If you're uncomfortable working with electrical systems, consult a licensed professional.
          </p>
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-border pt-8">
          <Button variant="outline" asChild>
            <Link href="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Link>
          </Button>
          
          <p className="text-sm text-muted-foreground">
            Written by {post.author}
          </p>
        </div>
      </div>
    </section>
  )
}

function BlogPostFAQs({ faqs }: { faqs: { question: string; answer: string }[] }) {
  return (
    <section className="border-t border-border bg-card">
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <h2 className="mb-6 text-3xl font-semibold tracking-tight text-foreground">
          Frequently Asked Questions
        </h2>
        
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`faq-${index}`}>
              <AccordionTrigger className="text-left text-base font-medium">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-base leading-relaxed text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}

function RelatedPosts({ posts, currentPost }: { posts: BlogPost[]; currentPost: BlogPost }) {
  const category = categories.find(c => c.id === currentPost.category)
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  return (
    <section className="border-t border-border bg-card/40">
      <div className="container mx-auto max-w-7xl px-4 py-14">
        <div className="mb-8">
          <div className="header-vibe-band max-w-3xl">
            <div className="header-vibe-inner">
              <div className="mb-2 inline-flex items-center rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground">
                Keep reading
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
                More from {category?.name || 'this category'}
              </h2>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                Related guides to help you troubleshoot safely and faster.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {posts.map((post, index) => {
            const featured = index === 0
            return (
              <Card
                key={post.id}
                className={[
                  'flex flex-col card-hover',
                  'bg-background/60 border shadow-sm',
                  featured ? 'md:col-span-2 card-featured' : ''
                ].join(' ')}
              >
                <div className="flex-1 p-6">
                  <h3 className="mb-2 text-lg font-semibold leading-tight tracking-tight text-foreground">
                    <Link href={`/blog/${post.slug}`} className="transition-colors hover:text-primary">
                      {post.title}
                    </Link>
                  </h3>

                  <p className="mb-4 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{post.readTime} min</span>
                    </div>
                    <span>•</span>
                    <span>{formatDate(post.publishDate)}</span>
                  </div>
                </div>

                <div className="border-t border-border p-4">
                  <Button variant={featured ? 'default' : 'ghost'} size="sm" className="w-full" asChild>
                    <Link href={`/blog/${post.slug}`}>
                      Read Article
                      <CaretRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function CategoryCallToAction({ category }: { category: typeof categories[0] }) {
  return (
    <section className="border-t border-border bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <Card className="overflow-hidden">
          <div className="p-8 text-center">
            <Badge variant="secondary" className="mb-4">
              {category.name}
            </Badge>
            <h3 className="mb-3 text-2xl font-semibold text-foreground">
              More {category.name} Resources
            </h3>
            <p className="mb-6 text-muted-foreground">
              {category.description}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild>
                <Link href={`/${category.slug}`}>
                  Browse All {category.name} Guides
                  <CaretRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/blog">
                  View All Articles
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
}
