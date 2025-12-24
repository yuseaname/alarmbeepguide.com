import { trustPages } from '@/lib/content'
import { Card } from './ui/card'
import { House, CaretRight } from '@phosphor-icons/react'
import { Link } from './Link'
import { Button } from './ui/button'

interface TrustPageProps {
  pageKey: keyof typeof trustPages
}

const pageKeyToSlug: Record<keyof typeof trustPages, string> = {
  about: 'about',
  disclosure: 'disclosure',
  editorialPolicy: 'editorial-policy',
  correctionsPolicy: 'corrections-policy',
  contact: 'contact',
  privacy: 'privacy',
  accessibility: 'accessibility'
}

export function TrustPage({ pageKey }: TrustPageProps) {
  const page = trustPages[pageKey]
  
  if (!page) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="mb-4 text-3xl font-bold">Page Not Found</h1>
        <p className="mb-8 text-muted-foreground">The page you're looking for doesn't exist.</p>
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
            <span className="text-foreground font-medium">{page.title}</span>
          </div>
        </div>
      </nav>

      <div className="bg-background">
        <div className="container mx-auto max-w-4xl px-4 py-12 md:py-16">
          <Card className="p-8 md:p-12">
            <h1 className="mb-8 text-3xl font-bold text-foreground md:text-4xl">
              {page.title}
            </h1>
            <div className="prose prose-slate max-w-none">
              {page.content.split('\n\n').map((paragraph, index) => {
                if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                  return (
                    <h2 key={index} className="mb-4 mt-8 text-2xl font-semibold text-foreground first:mt-0">
                      {paragraph.replace(/\*\*/g, '')}
                    </h2>
                  )
                }
                
                if (paragraph.startsWith('•')) {
                  const items = paragraph.split('\n')
                  return (
                    <ul key={index} className="mb-6 ml-6 list-disc space-y-2 text-muted-foreground">
                      {items.map((item, i) => (
                        <li key={i}>{item.replace('• ', '')}</li>
                      ))}
                    </ul>
                  )
                }
                
                if (/^\d+\./.test(paragraph)) {
                  const items = paragraph.split('\n')
                  return (
                    <ol key={index} className="mb-6 ml-6 list-decimal space-y-2 text-muted-foreground">
                      {items.map((item, i) => (
                        <li key={i}>{item.replace(/^\d+\.\s/, '')}</li>
                      ))}
                    </ol>
                  )
                }
                
                return (
                  <p key={index} className="mb-6 leading-relaxed text-muted-foreground">
                    {paragraph.split('**').map((part, i) => 
                      i % 2 === 1 ? <strong key={i} className="font-semibold text-foreground">{part}</strong> : part
                    )}
                  </p>
                )
              })}
            </div>
            
            {pageKey === 'contact' && (
              <div className="mt-8 rounded-lg border border-border bg-muted/30 p-6">
                <h3 className="mb-4 text-lg font-semibold">Send Us a Message</h3>
                <form className="space-y-4">
                  <div>
                    <label htmlFor="contact-name" className="mb-2 block text-sm font-medium">Name</label>
                    <input
                      id="contact-name"
                      type="text"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="mb-2 block text-sm font-medium">Email</label>
                    <input
                      id="contact-email"
                      type="email"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-subject" className="mb-2 block text-sm font-medium">Subject</label>
                    <input
                      id="contact-subject"
                      type="text"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder="What's this about?"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-message" className="mb-2 block text-sm font-medium">Message</label>
                    <textarea
                      id="contact-message"
                      className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder="Your message..."
                    />
                  </div>
                  <Button type="button" className="w-full" onClick={() => alert('Contact form submitted! (Demo only)')}>
                    Send Message
                  </Button>
                </form>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}