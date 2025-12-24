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
          </div>
        </div>
      </section>

      <section className="bg-background">
        <div className="container mx-auto max-w-7xl px-4 py-12">
          <div className="mb-8 flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">Filter by category:</span>
            <Button
              variant={selectedCategory === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All ({allPosts.length})
            </Button>
            {blogCategories.map(({ category, count }) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {getCategoryName(category)} ({count})
              </Button>
            ))}
          </div>

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
