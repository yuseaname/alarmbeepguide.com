import { categories } from '@/lib/seo'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { House, CaretRight } from '@phosphor-icons/react'
import { Link } from './Link'
import { Badge } from './ui/badge'

interface CategoryPageProps {
  slug: string
}

export function CategoryPage({ slug }: CategoryPageProps) {
  const category = categories.find(c => c.slug === slug)
  
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
          </div>
        </div>
      </section>

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
                <Link href="/">Browse Other Categories</Link>
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  )
}