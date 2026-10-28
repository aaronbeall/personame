import { Dimension, Archetype } from '@prisma/client'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { EntityIcon } from '@/components/entity-icon'
import { ArchetypeBadge, DimensionTag } from '@/components/entity-identity'

interface DimensionsArchetypesSummaryProps {
  dimensions: Dimension[]
  archetypes: Archetype[]
}

export function DimensionsArchetypesSummary({
  dimensions,
  archetypes,
}: DimensionsArchetypesSummaryProps) {
  if (dimensions.length === 0 && archetypes.length === 0) return null

  return (
    <Card className="builder-context mb-5">
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {dimensions.length > 0 && (
            <div className="md:col-span-4">
              <p className="entity-heading text-xs font-semibold text-muted-600 mb-2 uppercase">
                <EntityIcon kind="dimension" size={13} />
                Dimensions ({dimensions.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {dimensions.map((dimension) => (
                  <DimensionTag
                    key={dimension.id}
                    name={dimension.name}
                    emoji={dimension.emoji}
                    color={dimension.color}
                  />
                ))}
              </div>
            </div>
          )}

          {archetypes.length > 0 && (
            <div
              className={cn(
                dimensions.length > 0 ? 'md:col-span-8' : 'md:col-span-12',
              )}
            >
              <p className="entity-heading text-xs font-semibold text-muted-600 mb-2 uppercase">
                <EntityIcon kind="archetype" size={13} />
                Archetypes ({archetypes.length})
              </p>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {archetypes.map((archetype) => (
                  <div key={archetype.id} className="archetype-summary-item">
                    <ArchetypeBadge
                      name={archetype.name}
                      emoji={archetype.emoji}
                      color={archetype.color}
                      size={44}
                      label={false}
                    />
                    <strong>{archetype.name}</strong>
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
