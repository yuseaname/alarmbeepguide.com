import { useState } from 'react'
import { Button } from './ui/button'
import { CategoryCards } from './CategoryCards'
import { TopCommentsLeaderboard } from './TopCommentsLeaderboard'
import { SeasonalTipsModule } from './SeasonalTipsModule'
import { Shield, CheckCircle, Megaphone, Clock, CaretRight, SpeakerHigh } from '@phosphor-icons/react'
import { Card } from './ui/card'
import { Link } from './Link'
import { Badge } from './ui/badge'
import { getFeaturedBlogPosts, getAllBlogPosts } from '@/lib/blog'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { beepPatterns } from '@/lib/content'

export function HomePage() {
  const featuredPosts = getFeaturedBlogPosts()
  const allPosts = getAllBlogPosts()
  const [isBeepMatcherOpen, setIsBeepMatcherOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [deviceFilter, setDeviceFilter] = useState<string>('all')

  const devices = Array.from(new Set(beepPatterns.map(p => p.device)))

  const filteredPatterns = beepPatterns.filter(pattern => {
    const matchesSearch = pattern.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pattern.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDevice = deviceFilter === 'all' || pattern.device === deviceFilter
    return matchesSearch && matchesDevice
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  return (
    <div className="min-h-screen">
      <section className="border-b border-border bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto max-w-7xl px-4 py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Shield className="h-4 w-4" weight="fill" />
              <span>No Manuals Needed</span>
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Decode Alarm Beeps & Fix Safety Devices
            </h1>
            <p className="mb-8 text-lg leading-relaxed text-muted-foreground md:text-xl">
              Stop the chirps. Understand the beeps. Fix household alerts without digging through manuals. 
              Plain-English solutions for smoke detectors, CO alarms, motion lights, and more.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" className="w-full sm:w-auto text-base px-8 py-6" onClick={() => setIsBeepMatcherOpen(true)}>
                <SpeakerHigh className="mr-2 h-5 w-5" weight="bold" />
                Decode My Beep Now
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 py-6" asChild>
                <Link href="/about">Learn How It Works</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="section-surface">
        <div className="container mx-auto max-w-7xl px-4 py-14 md:py-20">
          <div className="mb-12 text-center">
            <div className="header-vibe-band mx-auto max-w-3xl">
              <div className="header-vibe-inner">
                <div className="mb-4 flex justify-center">
                  <div className="kicker-pill">
                    Simple, fast, safe
                  </div>
                </div>

                <h2 className="mb-3 text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
                  Your 3-Step Solution to Every Alert
                </h2>
                <p className="mx-auto max-w-2xl text-muted-foreground">
                  We've decoded thousands of beeps so you don't have to search for hours.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="card-hover relative p-7 text-center bg-background/60 border shadow-sm">
              <div className="mb-4 flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary text-2xl font-extrabold shadow-sm">
                  1
                </div>
              </div>
              <h3 className="mb-2 text-xl font-semibold tracking-tight">Match the Pattern</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Use our beep decoder to identify your device's specific chirp, beep, or flash pattern.
              </p>
            </Card>

            <Card className="card-hover card-featured relative p-7 text-center shadow-lg md:-translate-y-1">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <div className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow">
                  Most common
                </div>
              </div>

              <div className="mb-4 flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary text-2xl font-extrabold shadow-sm">
                  2
                </div>
              </div>
              <h3 className="mb-2 text-xl font-semibold tracking-tight">Understand What It Means</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Get plain-English explanations—no technical jargon, just clear answers about what's happening.
              </p>
            </Card>

            <Card className="card-hover relative p-7 text-center bg-background/60 border shadow-sm md:translate-y-1">
              <div className="mb-4 flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary text-2xl font-extrabold shadow-sm">
                  3
                </div>
              </div>
              <h3 className="mb-2 text-xl font-semibold tracking-tight">Fix It Safely</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Follow tested step-by-step solutions, with clear guidance on when to call a pro.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-background">
        <div className="container mx-auto max-w-7xl px-4 py-12 md:py-16">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">
              Browse by Category
            </h2>
            <p className="text-muted-foreground">
              Find solutions organized by device type and problem area
            </p>
          </div>
          <CategoryCards />
        </div>
      </section>

      <section className="border-b border-border bg-card">
        <div className="container mx-auto max-w-7xl px-4 py-12 md:py-16">
          <div className="grid gap-8 lg:grid-cols-2">
            <SeasonalTipsModule />
            <TopCommentsLeaderboard />
          </div>
        </div>
      </section>

      {featuredPosts.length > 0 && (
        <section className="border-b border-border bg-gradient-to-br from-primary/5 via-background to-background">
          <div className="container mx-auto max-w-7xl px-4 py-12 md:py-16">
            <div className="mb-10 text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-semibold text-accent">
                <Megaphone className="h-3.5 w-3.5" weight="fill" />
                <span>EXPERT GUIDES</span>
              </div>
              <h2 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">
                Featured Troubleshooting Guides
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                In-depth, step-by-step solutions to the most common alarm and safety device problems
              </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredPosts.slice(0, 3).map((post, index) => (
                <Card key={post.id} className="group relative flex flex-col overflow-hidden border-2 transition-all duration-300 hover:border-primary/30 hover:shadow-xl">
                  <div className="absolute right-4 top-4 z-10">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary backdrop-blur-sm">
                      {index + 1}
                    </div>
                  </div>
                  
                  <div className="flex-1 p-6">
                    <Badge variant="secondary" className="mb-4 border border-primary/20 bg-primary/5 text-xs font-medium text-primary">
                      Featured
                    </Badge>
                    
                    <h3 className="mb-3 text-xl font-bold leading-tight text-foreground">
                      <Link 
                        href={`/blog/${post.slug}`}
                        className="transition-colors group-hover:text-primary"
                      >
                        {post.title}
                      </Link>
                    </h3>
                    
                    <p className="mb-4 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                      {post.excerpt}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" weight="bold" />
                        <span className="font-medium">{post.readTime} min read</span>
                      </div>
                      <span className="text-border">•</span>
                      <span>{formatDate(post.publishDate)}</span>
                    </div>
                  </div>

                  <div className="border-t border-border bg-muted/30 p-4">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full font-semibold transition-colors group-hover:bg-primary group-hover:text-primary-foreground" 
                      asChild
                    >
                      <Link href={`/blog/${post.slug}`}>
                        Read Full Guide
                        <CaretRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Button size="lg" variant="outline" asChild className="group">
                <Link href="/blog">
                  View All {allPosts.length} Articles
                  <CaretRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      <section className="section-surface">
        <div className="container mx-auto max-w-7xl px-4 py-14 md:py-20">
          <div className="mb-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 shadow-sm">
              <Megaphone className="h-8 w-8 text-primary" weight="duotone" />
            </div>
            <h2 className="mb-2 text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
              Why Homeowners Trust AlarmBeepGuide
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Clear answers, practical fixes, and safety-first guidance—without digging through manuals.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="card-hover card-featured p-6 shadow-md">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <CheckCircle className="h-6 w-6 text-primary" weight="fill" />
              </div>
              <h3 className="mb-2 font-semibold tracking-tight">No Manuals Needed</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Skip the 80-page PDF. Get instant answers in plain English.
              </p>
            </Card>

            <Card className="card-hover p-6 bg-background/60 border shadow-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <CheckCircle className="h-6 w-6 text-primary" weight="fill" />
              </div>
              <h3 className="mb-2 font-semibold tracking-tight">Tested Solutions</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Every fix is verified and practical for real homeowners.
              </p>
            </Card>

            <Card className="card-hover p-6 bg-background/60 border shadow-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <CheckCircle className="h-6 w-6 text-primary" weight="fill" />
              </div>
              <h3 className="mb-2 font-semibold tracking-tight">Safety-First</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Clear guidance on when DIY is safe and when to call a professional.
              </p>
            </Card>

            <Card className="card-hover p-6 bg-background/60 border shadow-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <CheckCircle className="h-6 w-6 text-primary" weight="fill" />
              </div>
              <h3 className="mb-2 font-semibold tracking-tight">Always Updated</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                We continuously update guides with the latest device information.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-4xl px-4 py-12 text-center md:py-16">
          <h2 className="mb-4 text-3xl font-bold">
            Stop Ignoring That Beep
          </h2>
          <p className="mb-8 text-lg text-primary-foreground/90">
            Safety alerts exist for a reason. Decode them in seconds, fix them with confidence.
          </p>
          <Button size="lg" variant="secondary" className="text-base px-8 py-6" onClick={() => setIsBeepMatcherOpen(true)}>
            <SpeakerHigh className="mr-2 h-5 w-5" weight="bold" />
            Match Your Beep Pattern Now
          </Button>
        </div>
      </section>

      <Dialog open={isBeepMatcherOpen} onOpenChange={setIsBeepMatcherOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <SpeakerHigh className="h-6 w-6 text-primary" weight="bold" />
              Beep Pattern Decoder
            </DialogTitle>
            <DialogDescription>
              Match your alarm's beep pattern to find out what it means and how to fix it.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex-1">
                <Input
                  placeholder="Search beep patterns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                  id="beep-search-homepage"
                />
              </div>
              <Select value={deviceFilter} onValueChange={setDeviceFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by device" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Devices</SelectItem>
                  {devices.map(device => (
                    <SelectItem key={device} value={device}>{device}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              {filteredPatterns.length > 0 ? (
                filteredPatterns.map(pattern => (
                  <Card key={pattern.id} className="p-4 hover:border-primary/50 transition-colors">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-foreground">{pattern.name}</h3>
                      <Badge variant="secondary">{pattern.device}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{pattern.description}</p>
                  </Card>
                ))
              ) : (
                <div className="py-12 text-center">
                  <SpeakerHigh className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    No beep patterns match your search. Try different keywords or device type.
                  </p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}