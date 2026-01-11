import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Link } from './Link'
import { House, CaretRight, Clock, Tag } from '@phosphor-icons/react'
import { getAllBlogPosts, getBlogCategories, type BlogPost } from '@/lib/blog'
import { categories } from '@/lib/seo'
import { useState } from 'react'

export function BlogListPage() {
  const allPosts = getAllBlogPosts()
  const blogCategories = getBlogCategories()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredPosts = selectedCategory
    ? allPosts.filter(post => post.category === selectedCategory)
    : allPosts

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    return category ? category.name : categoryId
  }

  return (
    <div className="min-h-screen">
      <nav className="border-b border-border bg-card">
        <div className="container mx-auto max-w-7xl px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">
              <House className="h-4 w-4" />
            </Link>
            <CaretRight className="h-4 w-4" />
            <span className="text-foreground font-medium">Blog</span>
          </div>
        </div>
      </nav>

      <section className="border-b border-border bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto max-w-7xl px-4 py-12 md:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-4">Safety Guides & Tips</Badge>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              AlarmBeepGuide Blog
            </h1>
            <p className="text-lg leading-relaxed text-muted-foreground">
              In-depth troubleshooting guides, safety tips, and plain-English explanations for every household alarm and alert system.
            </p>
            <figure
              className="mt-6 overflow-hidden rounded-2xl border border-border/60 shadow-md"
              data-slot-id="40f030a788ca"
            >
              <img
                src="/images/generated/40f030a788ca.png"
                alt="Photo of AlarmBeepGuide Blog"
                width={1600}
                height={900}
                loading="eager"
                decoding="async"
                fetchPriority="high"
                className="h-auto w-full"
                data-slot-id="40f030a788ca"
              />
            </figure>
          </div>
        </div>
      </section>

      <section className="bg-background">
        <div className="container mx-auto max-w-7xl px-4 py-12">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center rounded-full border border-border bg-muted/20 px-3 py-1 text-xs font-medium text-muted-foreground">
                Browse & filter guides
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
                {selectedCategory 
                  ? `${getCategoryName(selectedCategory)} Articles` 
                  : 'All Safety Guides'}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {filteredPosts.length} {filteredPosts.length === 1 ? 'article' : 'articles'} 
                {selectedCategory && ' in this category'}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-muted/20 p-4 shadow-sm">
              <div className="mb-2 text-xs font-medium text-muted-foreground">Filter</div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant={selectedCategory === null ? 'default' : 'outline'}
                  size="sm"
                  className="min-h-9"
                  onClick={() => setSelectedCategory(null)}
                >
                  All <span className="ml-1 opacity-70">({allPosts.length})</span>
                </Button>

                {blogCategories.map(({ category, count }) => {
                  const active = selectedCategory === category
                  return (
                    <Button
                      key={category}
                      variant={active ? 'default' : 'outline'}
                      size="sm"
                      className={`min-h-9 ${active ? 'shadow-sm' : ''}`}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {getCategoryName(category)} <span className="ml-1 opacity-70">({count})</span>
                    </Button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Reserved ad slot container to prevent CLS when ads are introduced. */}
          <div
            className="mb-10 min-h-[140px] rounded-lg border border-dashed border-border/60 bg-muted/20"
            data-ad-slot="blog-index-inline"
            aria-hidden="true"
          />

          {filteredPosts.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No blog posts found in this category yet.</p>
            </Card>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((post) => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-border bg-card">
        <div className="container mx-auto max-w-7xl px-4 py-12">
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-2xl font-semibold text-foreground">
              Browse Articles by Category
            </h2>
            <p className="text-muted-foreground">
              Explore safety guides organized by device type and problem area
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => {
              const catBlogCount = blogCategories.find(bc => bc.category === cat.id)?.count || 0
              return (
                <Card key={cat.id} className="flex flex-col card-hover">
                  <div className="flex-1 p-6">
                    <h3 className="mb-2 text-lg font-semibold text-foreground">
                      {cat.name}
                    </h3>
                    <p className="mb-4 text-sm text-muted-foreground">
                      {cat.description}
                    </p>
                    <p className="text-xs font-medium text-primary">
                      {catBlogCount} {catBlogCount === 1 ? 'article' : 'articles'}
                    </p>
                  </div>
                  <div className="border-t border-border p-4">
                    <Button variant="ghost" size="sm" className="w-full" asChild>
                      <Link href={`/${cat.slug}`}>
                        View Category
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
    </div>
  )
}

function BlogPostCard({ post }: { post: BlogPost }) {
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    return category ? category.name : categoryId
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  return (
    <Card className="flex flex-col overflow-hidden card-hover">
      <div className="flex-1 p-6">
        <div className="mb-3 flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {getCategoryName(post.category)}
          </Badge>
          {post.featured && (
            <Badge variant="default" className="text-xs">
              Featured
            </Badge>
          )}
        </div>
        
        <h3 className="mb-3 text-xl font-semibold leading-tight text-foreground">
          <Link 
            href={`/blog/${post.slug}`}
            className="hover:text-primary transition-colors"
          >
            {post.title}
          </Link>
        </h3>
        
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground line-clamp-3">
          {post.excerpt}
        </p>

        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{post.readTime} min read</span>
          </div>
          <span>•</span>
          <span>{formatDate(post.publishDate)}</span>
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.slice(0, 3).map((tag) => (
              <div key={tag} className="flex items-center gap-1 text-xs text-muted-foreground">
                <Tag className="h-3 w-3" />
                <span>{tag}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-border p-4">
        <Button variant="ghost" size="sm" className="w-full" asChild>
          <Link href={`/blog/${post.slug}`}>
            Read Full Guide
            <CaretRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </Card>
  )
}
