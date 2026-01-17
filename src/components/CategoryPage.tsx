import { categories } from '@/lib/seo'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { House, CaretRight, CheckCircle, Clock, Warning } from '@phosphor-icons/react'
import { Link } from './Link'
import { Badge } from './ui/badge'
import { getBlogPostsByCategory, type BlogPost } from '@/lib/blog'

interface CategoryPageProps {
  slug: string
}

export function CategoryPage({ slug }: CategoryPageProps) {
  const category = categories.find(c => c.slug === slug)
  const categoryPosts = category ? getBlogPostsByCategory(category.id) : []
  
  if (!category) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="mb-4 text-3xl font-bold">Category Not Found</h1>
        <p className="mb-8 text-muted-foreground">The category you're looking for doesn't exist.</p>
        <Button asChild>
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    )
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
            <span className="text-foreground font-medium">{category.name}</span>
          </div>
        </div>
      </nav>

      <section className="border-b border-border bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto max-w-7xl px-4 py-12 md:py-16">
          <div className="mx-auto max-w-3xl">
            <Badge variant="secondary" className="mb-4">Category</Badge>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              {category.name}
            </h1>
            <p className="text-lg leading-relaxed text-muted-foreground">
              {category.description}
            </p>
            <figure
              className="mt-6 overflow-hidden rounded-2xl border border-border/60 shadow-md"
              data-slot-id="71fb68f4f306"
            >
              <img
                src={category.heroImage}
                alt={`Photo of ${category.name}`}
                width={1600}
                height={900}
                loading="eager"
                decoding="async"
                fetchPriority="high"
                className="h-auto w-full"
                data-slot-id="71fb68f4f306"
                onError={(event) => {
                  const target = event.currentTarget
                  if (target.dataset.imageMissing) return
                  target.dataset.imageMissing = 'true'
                  target.classList.add('hidden')
                  target.closest('figure')?.classList.add('hidden')
                }}
              />
            </figure>
          </div>
        </div>
      </section>

      {categoryPosts.length > 0 ? (
        <>
          <section className="border-b border-border bg-accent/10">
            <div className="container mx-auto max-w-7xl px-4 py-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <CheckCircle className="h-6 w-6" weight="fill" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Complete Resource Hub</p>
                    <p className="text-lg font-semibold text-foreground">
                      {categoryPosts.length} Expert {categoryPosts.length === 1 ? 'Guide' : 'Guides'} Available
                    </p>
                  </div>
                </div>
                <Button variant="outline" asChild className="hidden sm:flex">
                  <Link href="/blog">
                    View All Articles
                    <CaretRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>

          <section className="border-b border-border bg-background">
            <div className="container mx-auto max-w-7xl px-4 py-12 md:py-16">
              <div className="mb-8">
                <h2 className="mb-2 text-3xl font-semibold text-foreground">
                  Troubleshooting Guides & Resources
                </h2>
                <p className="text-muted-foreground">
                  Comprehensive step-by-step guides to solve {category.name.toLowerCase()} problems
                </p>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {categoryPosts.map((post) => (
                  <CategoryArticleCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          </section>

          <section className="border-b border-border bg-card">
            <div className="container mx-auto max-w-7xl px-4 py-12 md:py-16">
              <div className="mx-auto max-w-4xl">
                <h2 className="mb-8 text-center text-3xl font-semibold text-foreground">
                  Quick Reference Guide
                </h2>
                <CategoryQuickGuide categoryId={category.id} />
              </div>
            </div>
          </section>
        </>
      ) : (
        <section className="bg-background">
          <div className="container mx-auto max-w-7xl px-4 py-12 md:py-16">
            <Card className="p-8 text-center">
              <div className="mx-auto max-w-2xl">
                <h2 className="mb-4 text-2xl font-semibold">Articles Coming Soon</h2>
                <p className="mb-6 text-muted-foreground">
                  We're preparing comprehensive troubleshooting guides for {category.name.toLowerCase()}. 
                  This category will soon contain detailed articles covering common problems, beep patterns, 
                  and step-by-step solutions.
                </p>
                <div className="mb-8 rounded-lg border border-border bg-muted/30 p-6">
                  <h3 className="mb-3 font-semibold">What to Expect:</h3>
                  <ul className="space-y-2 text-left text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CaretRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" weight="bold" />
                      <span>Detailed beep code decoder tables</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CaretRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" weight="bold" />
                      <span>Step-by-step troubleshooting guides</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CaretRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" weight="bold" />
                      <span>Common problem quick fixes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CaretRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" weight="bold" />
                      <span>Safety tips and best practices</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CaretRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" weight="bold" />
                      <span>Device-specific guidance</span>
                    </li>
                  </ul>
                </div>
                <Button asChild size="lg">
                  <Link href="/blog">Browse All Articles</Link>
                </Button>
              </div>
            </Card>
          </div>
        </section>
      )}

      <section className="bg-background">
        <div className="container mx-auto max-w-7xl px-4 py-12">
          <div className="mb-12 rounded-lg border border-primary/20 bg-primary/5 p-6 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="mb-2 text-xl font-semibold text-foreground">
                  Need Immediate Help?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Use our beep pattern decoder to identify your device's alert sound instantly
                </p>
              </div>
              <Button
                size="lg"
                className="shrink-0"
                onClick={() => window.dispatchEvent(new CustomEvent('alarmbeepguide:open-beep-decoder'))}
              >
                Open Beep Decoder
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 md:p-8">
            <div className="mb-6 text-center">
              <h3 className="mb-2 text-2xl font-semibold text-foreground">
                Explore More Safety Guides
              </h3>
              <p className="text-muted-foreground">
                Browse articles from all categories to expand your safety knowledge
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button variant="outline" asChild>
                <Link href="/blog">View All Blog Articles</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">Explore All Categories</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function CategoryArticleCard({ post }: { post: BlogPost }) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  return (
    <Card className="flex flex-col card-hover">
      <div className="flex-1 p-6">
        {post.featured && (
          <Badge variant="default" className="mb-3">
            Featured Guide
          </Badge>
        )}
        
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

        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{post.readTime} min read</span>
          </div>
          <span>•</span>
          <span>{formatDate(post.publishDate)}</span>
        </div>
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

function CategoryQuickGuide({ categoryId }: { categoryId: string }) {
  const guides: Record<string, { common: string[]; safety: string[]; tips: string[] }> = {
    'chirp-beep-codes': {
      common: [
        'Single chirp every 30-60 seconds = Low battery',
        'Continuous alarm = Smoke or CO detected (evacuate immediately)',
        'Three beeps, pause, repeat = Carbon monoxide warning',
        'Five chirps in a row = End of life (replace detector)'
      ],
      safety: [
        'Never remove battery without replacing it immediately',
        'Test detectors monthly using the test button',
        'Replace smoke detectors every 10 years',
        'Install CO detectors on every level of your home'
      ],
      tips: [
        'Change batteries when you change clocks (daylight savings)',
        'Write the install date on detector with marker',
        'Clean detector vents every 6 months with vacuum',
        'Keep detector at least 10 feet from bathrooms'
      ]
    },
    'fire-extinguishers': {
      common: [
        'Pressure gauge in green zone = Ready to use',
        'Pressure gauge in red zone = Needs recharge or replacement',
        'Pressure gauge in yellow zone = Overpressurized (inspect)',
        'After 12 years = Replace disposable unit regardless of pressure'
      ],
      safety: [
        'Check pressure gauge monthly',
        'Keep extinguisher accessible, not blocked',
        'Know PASS technique: Pull, Aim, Squeeze, Sweep',
        'Call 911 before using extinguisher on any fire'
      ],
      tips: [
        'Mount 3.5-5 feet off the floor for easy access',
        'Keep away from heat sources like stoves',
        'Have professional inspection annually (required for businesses)',
        'After any use, even 1 second, have it recharged or replaced'
      ]
    },
    'home-flood-lights': {
      common: [
        'Light stays on = Sensitivity too high or obstruction detected',
        'Light won\'t turn on = Dead bulb, power issue, or sensor failure',
        'Flashing red light = Low battery or sensor obstruction',
        'Rapid blinking = Bulb or wiring problem'
      ],
      safety: [
        'Turn off power at breaker before cleaning or repairs',
        'Use proper wattage bulbs (check fixture label)',
        'Keep sensor lens clean and unobstructed',
        'Don\'t mount sensors where they can be easily damaged'
      ],
      tips: [
        'Adjust sensitivity dial to medium, then fine-tune',
        'Trim vegetation away from sensor detection zone',
        'Clean sensor lens twice yearly with soft cloth',
        'Adjust timer to 3-5 minutes for typical use'
      ]
    },
    'weather-outage-alerts': {
      common: [
        'Continuous tone = Emergency alert active (listen for details)',
        'Single chirp every minute = Low battery in weather radio',
        'Weekly test = Normal Wednesday testing (usually 11 AM)',
        'No alerts during storm = Check SAME code programming'
      ],
      safety: [
        'Keep weather radio plugged in with backup batteries fresh',
        'Program only your county SAME code to reduce alert fatigue',
        'Enable critical warnings only (tornado, flash flood, etc.)',
        'Keep phone charged during severe weather for WEA alerts'
      ],
      tips: [
        'Replace backup batteries every 6 months',
        'Position radio for best signal reception',
        'Test weekly using test button',
        'Don\'t disable extreme weather alerts on phone'
      ]
    },
    'household-alert-fixes': {
      common: [
        'Security panel beeping = Low battery, sensor fault, or comm error',
        'Appliance error beeps = Check owner\'s manual for specific codes',
        'Doorbell chimes randomly = Moisture on button or low battery',
        'Thermostat chirping = Low battery or filter change reminder'
      ],
      safety: [
        'Don\'t ignore persistent beeping—investigate the cause',
        'Turn off power at breaker for electrical troubleshooting',
        'Replace batteries in all devices annually',
        'Call professionals for complex electrical issues'
      ],
      tips: [
        'Document error codes before calling support',
        'Keep spare batteries for common devices',
        'Label circuit breakers for easier troubleshooting',
        'Create home maintenance calendar for battery changes'
      ]
    },
    'alarm-lifespan-replacement-maintenance': {
      common: [
        'End-of-life chirps = Replace the whole unit',
        'Low battery chirps = Replace battery and retest',
        'Date label missing = Treat alarm as old and replace',
        'Install date unknown = Start a new timeline'
      ],
      safety: [
        'Replace smoke alarms every 7-10 years',
        'Replace CO detectors on the manufacturer timeline',
        'Test alarms monthly using the test button',
        'Use matching power type for replacements'
      ],
      tips: [
        'Write the install month and year inside the cover',
        'Keep a simple home safety log',
        'Change batteries during seasonal checks',
        'Vacuum alarm vents twice a year'
      ]
    }
  }

  const guide = guides[categoryId]
  
  if (!guide) {
    return null
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="p-6">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Warning className="h-6 w-6" weight="duotone" />
        </div>
        <h3 className="mb-4 text-lg font-semibold text-foreground">Common Signals</h3>
        <ul className="space-y-3 text-sm text-muted-foreground">
          {guide.common.map((item, index) => (
            <li key={index} className="flex items-start gap-2">
              <CaretRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-6">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
          <CheckCircle className="h-6 w-6" weight="duotone" />
        </div>
        <h3 className="mb-4 text-lg font-semibold text-foreground">Safety Priorities</h3>
        <ul className="space-y-3 text-sm text-muted-foreground">
          {guide.safety.map((item, index) => (
            <li key={index} className="flex items-start gap-2">
              <CaretRight className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-6">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/20 text-secondary">
          <CheckCircle className="h-6 w-6" weight="duotone" />
        </div>
        <h3 className="mb-4 text-lg font-semibold text-foreground">Pro Tips</h3>
        <ul className="space-y-3 text-sm text-muted-foreground">
          {guide.tips.map((item, index) => (
            <li key={index} className="flex items-start gap-2">
              <CaretRight className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
