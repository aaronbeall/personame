'use client'

import { DimensionEndpointLabel } from '@/components/dimension-endpoint-label'
import { Dimension } from '@prisma/client'
import { DimensionTag } from '@/components/entity-identity'
import { Tooltip } from '@/components/ui/tooltip'

interface DimensionTooltipProps {
  dimension: Dimension
  children: React.ReactNode
}

export function DimensionTooltip({ dimension, children }: DimensionTooltipProps) {
  return (
    <Tooltip
      content={
        <div className="space-y-2">
          <div>
            <DimensionTag
              name={dimension.name}
              emoji={dimension.emoji}
              color={dimension.color}
            />
            {dimension.description && (
              <p className="text-xs opacity-80 mt-0.5">{dimension.description}</p>
            )}
          </div>
          <span className="inline-block rounded bg-white/20 px-2.5 py-0.5 text-xs font-medium text-white">
            <DimensionEndpointLabel
              label={dimension.minLabel || 'Low'}
              emoji={dimension.minEmoji}
              end="low"
            />
            <span aria-hidden="true"> – </span>
            <DimensionEndpointLabel
              label={dimension.maxLabel || 'High'}
              emoji={dimension.maxEmoji}
              end="high"
            />
          </span>
        </div>
      }
      side="top"
    >
      {children}
    </Tooltip>
  )
}
