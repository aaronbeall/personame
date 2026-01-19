import { Metric, Archetype } from '@prisma/client'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { getColorTheme } from '@/lib/colors'

interface MetricsArchetypesSummaryProps {
  metrics: Metric[]
  archetypes: Archetype[]
}

export function MetricsArchetypesSummary({ metrics, archetypes }: MetricsArchetypesSummaryProps) {
  if (metrics.length === 0 && archetypes.length === 0) return null

  return (
    <Card className="mb-6 border-muted-200 bg-muted-50">
      <CardContent className="pt-4">
        <div className="grid grid-cols-12 gap-6">
          {metrics.length > 0 && (
            <div className="col-span-4">
              <p className="text-xs font-semibold text-muted-600 mb-2 uppercase">
                Metrics ({metrics.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {metrics.map(metric => (
                  <div
                    key={metric.id}
                    className={cn(
                      "px-2 py-1 rounded text-xs font-medium text-white",
                      getColorTheme(metric.color).bgClass
                    )}
                  >
                    {metric.emoji && <span className="mr-1">{metric.emoji}</span>}
                    {metric.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {archetypes.length > 0 && (
            <div className={cn(metrics.length > 0 ? "col-span-8" : "col-span-12")}>
              <p className="text-xs font-semibold text-muted-600 mb-2 uppercase">
                Archetypes ({archetypes.length})
              </p>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {archetypes.map(archetype => (
                  <div
                    key={archetype.id}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg min-w-[200px] shadow-sm",
                      getColorTheme(archetype.color).bgLightClass,
                      getColorTheme(archetype.color).borderLeftClass
                    )}
                  >
                    {archetype.emoji && (
                      <div className="flex-shrink-0 text-2xl">
                        {archetype.emoji}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-primary-900 mb-0.5">
                        {archetype.name}
                      </div>
                      {archetype.description && (
                        <div className="text-xs text-muted-600 line-clamp-2">
                          {archetype.description}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
