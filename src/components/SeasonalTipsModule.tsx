import { Card } from './ui/card'
import { seasonalTips, getCurrentSeason } from '@/lib/content'
import { Calendar } from '@phosphor-icons/react'
import { Badge } from './ui/badge'
import { Link } from './Link'
import { categories } from '@/lib/seo'

export function SeasonalTipsModule() {
  const currentSeason = getCurrentSeason()
  const tips = seasonalTips.filter(tip => tip.season === currentSeason)
  
  const getSeasonColor = (season: string) => {
    switch(season) {
      case 'winter': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'spring': return 'bg-green-100 text-green-800 border-green-200'
      case 'summer': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'fall': return 'bg-orange-100 text-orange-800 border-orange-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="bg-primary px-6 py-4 text-primary-foreground">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5" weight="bold" />
          <h2 className="text-xl font-semibold capitalize">{currentSeason} Safety Tips</h2>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {tips.map((tip) => {
            const category = categories.find(c => c.id === tip.category)
            return (
              <div key={tip.id} className="group rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h3 className="font-medium text-foreground group-hover:text-primary">{tip.title}</h3>
                  <Badge variant="outline" className={`shrink-0 ${getSeasonColor(tip.season)}`}>
                    {tip.season}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{tip.description}</p>
                {category && (
                  <Link 
                    href={`/${category.slug}`} 
                    className="mt-2 inline-block text-xs font-medium text-primary hover:underline"
                  >
                    Learn more →
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}