'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Metric, ArchetypeMetric, Archetype } from '@prisma/client'
import { Edit2, Trash2 } from 'lucide-react'
import { getColorTheme } from '@/lib/colors'
import { Tooltip } from '@/components/ui/tooltip'
import { ArchetypeEditor } from './archetype-editor'
import { getInitials } from '@/lib/utils'

interface ArchetypeRowProps {
  archetype: Archetype & { metrics: ArchetypeMetric[] }
  metrics: Metric[]
  onSave: (archetype: Archetype & { metrics: ArchetypeMetric[] }) => void
  onDelete: () => void
}

export function ArchetypeRow({
  archetype,
  metrics,
  onSave,
  onDelete,
}: ArchetypeRowProps) {
  const [isEditing, setIsEditing] = useState(!archetype.name)
  const colorInfo = getColorTheme(archetype.color)

  if (isEditing) {
    return (
      <ArchetypeEditor
        archetype={archetype}
        metrics={metrics}
        onSave={(updated) => {
          onSave(updated)
          setIsEditing(false)
        }}
        onCancel={() => setIsEditing(false)}
      />
    )
  }

  return (
    <div className="relative p-6 bg-white border-2 border-muted-200 rounded-2xl hover:shadow-md transition-shadow">
      {/* Header with badge and actions */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className={`h-20 w-20 rounded-full ${colorInfo.bgClass} flex items-center justify-center ${colorInfo.textClass} text-4xl shadow-md`}>
            {archetype.emoji ?? getInitials(archetype.name)}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-primary-900">{archetype.name}</h3>
            <p className="text-muted-600 mt-1 line-clamp-2">{archetype.description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="text-primary-700 hover:bg-primary-50"
          >
            <Edit2 className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-destructive-600 hover:bg-destructive-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Metric Targets Summary */}
      <div className="mt-6 pt-4 border-t border-muted-200">
        <h4 className="text-xs font-semibold text-muted-700 uppercase tracking-wider mb-3">Metric Profile</h4>
        <div className="space-y-2">
          {[...metrics]
            .map(metric => {
              const target = archetype.metrics.find(t => t.metricId === metric.id)
              return {
                metric,
                targetValue: target?.targetValue ?? 50,
                relevance: target?.relevance ?? 0,
              }
            })
            .sort((a, b) => b.relevance - a.relevance)
            .map(({ metric, targetValue, relevance }) => {
              const colorInfo = getColorTheme(metric.color)
              // Importance bar: width = relevance * 100, color = colorInfo.class
              // Opacity: 0.05 at 0% importance, 1 at 50% or more
              const importanceOpacity = Math.max(0.05, Math.min(1, relevance * 2))
              return (
                <div key={metric.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">{metric.name}</span>
                    <div className="flex items-center gap-2 min-w-[60px]">
                      <div className="text-xs text-muted-600 font-medium">{Math.round(targetValue)}</div>
                      {/* Importance visualization: bar with color and width proportional to relevance, percent in tooltip */}
                      <Tooltip content={<span>{Math.round(relevance * 100)}% importance</span>} side="top">
                        <div className="relative w-12 h-2 bg-muted-200 rounded-full overflow-hidden cursor-help">
                          <div
                            className={colorInfo.bgClass + " absolute left-0 top-0 h-full rounded-full transition-all"}
                            style={{ width: `${Math.round(relevance * 100)}%`, opacity: 0.7 }}
                          />
                        </div>
                      </Tooltip>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-muted-200 rounded-full overflow-hidden">
                    <div
                      className={colorInfo.bgClass + " h-full transition-all"}
                      style={{ width: `${targetValue}%`, opacity: importanceOpacity }}
                    />
                  </div>
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}
