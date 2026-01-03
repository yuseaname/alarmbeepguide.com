import { Link } from './Link'
import { categories } from '@/lib/seo'

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="text-sm font-bold">AB</span>
              </div>
              <span className="font-bold text-foreground">AlarmBeepGuide</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Decode alarm beeps and troubleshoot safety devices without manuals. Plain-English solutions for homeowners.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Categories</h3>
            <ul className="space-y-2">
              {categories.slice(0, 3).map((cat) => (
                <li key={cat.id}>
                  <Link href={`/${cat.slug}`} className="text-sm text-muted-foreground hover:text-primary">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">More Categories</h3>
            <ul className="space-y-2">
              {categories.slice(3).map((cat) => (
                <li key={cat.id}>
                  <Link href={`/${cat.slug}`} className="text-sm text-muted-foreground hover:text-primary">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">About</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-primary">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/disclosure" className="text-sm text-muted-foreground hover:text-primary">
                  Disclosure
                </Link>
              </li>
              <li>
                <Link href="/editorial-policy" className="text-sm text-muted-foreground hover:text-primary">
                  Editorial Policy
                </Link>
              </li>
              <li>
                <Link href="/fact-checking" className="text-sm text-muted-foreground hover:text-primary">
                  Fact-Checking Policy
                </Link>
              </li>
              <li>
                <Link href="/corrections-policy" className="text-sm text-muted-foreground hover:text-primary">
                  Corrections
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/accessibility" className="text-sm text-muted-foreground hover:text-primary">
                  Accessibility
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} AlarmBeepGuide. All rights reserved.</p>
          <p className="mt-2">
            Educational resource for safety device troubleshooting. Not a substitute for professional inspection or emergency services.
          </p>
          {/* Safety disclaimer clarifies escalation paths without altering URLs or core content. */}
          <p className="mt-2">
            For gas, carbon monoxide, or electrical hazards, contact a qualified professional or emergency services immediately.
          </p>
        </div>
      </div>
    </footer>
  )
}
