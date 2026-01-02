import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { categories } from '@/lib/seo'
import { getBlogCategories } from '@/lib/blog'
import { SpeakerHigh, FireExtinguisher, Lightbulb, Lightning, House } from '@phosphor-icons/react'
import { Link } from './Link'
import { ReactNode } from 'react'

const iconMap: Record<string, ReactNode> = {
  SpeakerHigh: <SpeakerHigh className="h-8 w-8" weight="duotone" />,
  FireExtinguisher: <FireExtinguisher className="h-8 w-8" weight="duotone" />,
  Lightbulb: <Lightbulb className="h-8 w-8" weight="duotone" />,
  Lightning: <Lightning className="h-8 w-8" weight="duotone" />,
  House: <House className="h-8 w-8" weight="duotone" />
}

export function CategoryCards() {
  const blogCategories = getBlogCategories()
  
  const getCategoryArticleCount = (categoryId: string): number => {
    return blogCategories.find(bc => bc.category === categoryId)?.count || 0
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category, index) => {
        const articleCount = getCategoryArticleCount(category.id)
        const isFeatured = index === 0
        const staggerClass = index === 1 ? 'lg:-translate-y-1' : index === 2 ? 'lg:translate-y-1' : ''
        const featuredClass = isFeatured ? 'border-primary/20 bg-primary/5 shadow-lg' : ''
        
        return (
          <Link key={category.id} href={`/${category.slug}`}>
            <Card className={`tile-card group card-hover ${staggerClass} ${featuredClass} hover:border-primary/50`}>
              <div className="mb-4 flex items-start justify-between">
                <div className={`tile-icon ${isFeatured ? 'bg-primary/15' : ''}`}>
                  {iconMap[category.icon]}
                </div>
                {articleCount > 0 && (
                  <Badge variant="secondary" className="text-xs border border-border/50 bg-background/60">
                    {articleCount} {articleCount === 1 ? 'guide' : 'guides'}
                  </Badge>
                )}
              </div>
              <h3 className="mb-2 text-xl font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
                {category.name}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground/90">
                {category.description}
              </p>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}