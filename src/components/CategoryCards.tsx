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
      {categories.map((category) => {
        const articleCount = getCategoryArticleCount(category.id)
        
        return (
          <Link key={category.id} href={`/${category.slug}`}>
            <Card className="card-hover group h-full cursor-pointer p-6 transition-all hover:border-primary/50">
              <div className="mb-4 flex items-start justify-between">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  {iconMap[category.icon]}
                </div>
                {articleCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {articleCount} {articleCount === 1 ? 'guide' : 'guides'}
                  </Badge>
                )}
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground group-hover:text-primary">
                {category.name}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {category.description}
              </p>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}