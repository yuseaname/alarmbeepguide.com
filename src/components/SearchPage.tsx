import { useEffect, useMemo, useState } from 'react'
import { Card } from './ui/card'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Link } from './Link'
import { blogPosts } from '@/lib/blog'

function getQueryFromLocation() {
  const params = new URLSearchParams(window.location.search)
  return (params.get('q') ?? '').trim()
}

type SearchResult = {
  slug: string
  title: string
  excerpt: string
  category: string
  score: number
}

function scorePost(query: string, post: typeof blogPosts[number]): number {
  const q = query.toLowerCase()
  if (!q) return 0

  const title = post.title.toLowerCase()
  const excerpt = post.excerpt.toLowerCase()
  const tags = post.tags.map(t => t.toLowerCase())

  let score = 0
  if (title.includes(q)) score += 10
  if (excerpt.includes(q)) score += 5
  if (tags.some(t => t.includes(q))) score += 6

  // partial term scoring
  const parts = q.split(/\s+/).filter(Boolean)
  for (const part of parts) {
    if (part.length < 2) continue
    if (title.includes(part)) score += 3
    if (excerpt.includes(part)) score += 1
    if (tags.some(t => t.includes(part))) score += 2
  }

  return score
}

export function SearchPage() {
  const [query, setQuery] = useState(() => getQueryFromLocation())
  const [submittedQuery, setSubmittedQuery] = useState(() => getQueryFromLocation())

  useEffect(() => {
    const onPopState = () => {
      const q = getQueryFromLocation()
      setQuery(q)
      setSubmittedQuery(q)
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const results = useMemo(() => {
    const q = submittedQuery.trim()
    if (!q) return [] as SearchResult[]

    const scored = blogPosts
      .map(post => ({
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        category: post.category,
        score: scorePost(q, post)
      }))
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20)

    return scored
  }, [submittedQuery])

  const submit = () => {
    const q = query.trim()
    const nextUrl = q ? `/search?q=${encodeURIComponent(q)}` : '/search'
    window.history.pushState({}, '', nextUrl)
    setSubmittedQuery(q)
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold">Search</h1>
      <p className="mb-6 text-muted-foreground">
        Search troubleshooting guides and safety tips.
      </p>

      <Card className="mb-8 p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            value={query}
            placeholder="Try: smoke detector chirping, CO alarm, motion sensor light…"
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submit()
            }}
            aria-label="Search query"
          />
          <Button onClick={submit} className="shrink-0">Search</Button>
        </div>
      </Card>

      {submittedQuery.trim() === '' ? (
        <p className="text-muted-foreground">Enter a search term to see results.</p>
      ) : results.length === 0 ? (
        <p className="text-muted-foreground">No results found for “{submittedQuery}”.</p>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Showing {results.length} result{results.length === 1 ? '' : 's'} for “{submittedQuery}”.
          </p>
          {results.map((r) => (
            <Card key={r.slug} className="p-4">
              <h2 className="text-lg font-semibold">
                <Link href={`/blog/${r.slug}`} className="hover:text-primary transition-colors">
                  {r.title}
                </Link>
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{r.excerpt}</p>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-10">
        <Button variant="outline" asChild>
          <Link href="/blog">Browse all articles</Link>
        </Button>
      </div>
    </div>
  )
}
