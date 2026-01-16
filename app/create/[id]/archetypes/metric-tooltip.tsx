'use client'

import { Metric } from '@prisma/client'
import { Tooltip } from '@/components/ui/tooltip'
import { Info } from 'lucide-react'

interface MetricTooltipProps {
  metric: Metric
  children: React.ReactNode
}

export function MetricTooltip({ metric, children }: MetricTooltipProps) {
  return (
    <Tooltip
      content={
        <div className="space-y-2">
          <div>
            <p className="font-semibold text-white">{metric.name}</p>
            {metric.description && (
              <p className="text-xs opacity-80 mt-0.5">{metric.description}</p>
            )}
          </div>
          <span className="inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium text-white">
            {metric.minLabel} – {metric.maxLabel}
          </span>
        </div>
      }
      side="top"
    >
      {children}
    </Tooltip>
  )
}
