import { MagnifyingGlass, List, X } from '@phosphor-icons/react'
import { Button } from './ui/button'
import { useState } from 'react'
import { categories } from '@/lib/seo'
import { Link } from './Link'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto max-w-7xl">
        <div className="flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-xl font-bold">AB</span>
            </div>
            <span className="hidden font-bold text-foreground sm:inline-block">
              AlarmBeepGuide
            </span>
          </Link>

          <nav className="hidden items-center space-x-6 md:flex">
            <Link href="/" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
              Home
            </Link>
            <div className="group relative">
              <button className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors py-2">
                Categories
              </button>
              <div className="absolute left-0 top-full pt-2 hidden group-hover:block">
                <div className="w-64 rounded-lg border border-border bg-card p-2 shadow-lg">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/${cat.slug}`}
                      className="block rounded-md px-3 py-2 text-sm text-foreground/80 hover:bg-accent hover:text-accent-foreground"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <Link href="/blog" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
              Blog
            </Link>
            <Link href="/about" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
              Contact
            </Link>
          </nav>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="hidden md:inline-flex" asChild>
              <Link href="/search" aria-label="Search">
                <MagnifyingGlass className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <List className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-border px-4 py-4 md:hidden">
            <nav className="flex flex-col space-y-3">
              <Link href="/" className="text-sm font-medium text-foreground/80 hover:text-primary">
                Home
              </Link>
              <div className="text-sm font-medium text-muted-foreground">Categories</div>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/${cat.slug}`}
                  className="pl-4 text-sm text-foreground/80 hover:text-primary"
                >
                  {cat.name}
                </Link>
              ))}
              <Link href="/blog" className="text-sm font-medium text-foreground/80 hover:text-primary">
                Blog
              </Link>
              <Link href="/about" className="text-sm font-medium text-foreground/80 hover:text-primary">
                About
              </Link>
              <Link href="/contact" className="text-sm font-medium text-foreground/80 hover:text-primary">
                Contact
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}