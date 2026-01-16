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
    <div
      className="relative p-0 bg-gradient-to-br from-white via-white to-muted-100 rounded-3xl shadow-xl overflow-hidden group transition-all duration-300"
      style={{ boxShadow: `0 6px 16px 0 ${colorInfo.hex}33` }}
    >
      {/* Profile Badge Header */}
      <div className="relative flex items-center gap-6 px-8 pt-8 pb-6 bg-gradient-to-br"
        style={{ background: `linear-gradient(120deg, ${colorInfo.hex}22 0%, ${colorInfo.hex}11 100%)` }}
      >
        <div className="relative">
          <div
            className={`h-24 w-24 rounded-full border-4 ${colorInfo.bgClass} ${colorInfo.textClass} flex items-center justify-center text-5xl font-extrabold shadow-lg ring-4 ring-white/80 ring-offset-2 ring-offset-white group-hover:scale-105 transition-transform duration-300`}
            style={{ filter: 'drop-shadow(0 2px 12px rgba(0,0,0,0.10))' }}
          >
            {archetype.emoji ?? getInitials(archetype.name)}
          </div>
          <div className="absolute -bottom-2 -right-2 bg-white rounded-full px-3 py-1 text-xs font-bold shadow text-muted-700 border border-muted-200 max-w-[110px] truncate">
            {archetype.name}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-3xl font-extrabold text-primary-900 leading-tight truncate flex items-center gap-2">
            {archetype.name}
          </h3>
          {archetype.description && (
            <p className="text-base text-muted-700 mt-1 line-clamp-2 max-w-xl">{archetype.description}</p>
          )}
        </div>
        <div className="flex flex-row gap-2 items-center self-start mt-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="text-primary-700 border border-transparent hover:bg-white hover:border-primary-400 hover:text-primary-900 focus-visible:ring-2 focus-visible:ring-primary-400"
            style={{ transition: 'background 0.2s, color 0.2s, border-color 0.2s' }}
          >
            <Edit2 className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-destructive-600 border border-transparent hover:bg-white hover:border-destructive-400 hover:text-destructive-900 focus-visible:ring-2 focus-visible:ring-destructive-400"
            style={{ transition: 'background 0.2s, color 0.2s, border-color 0.2s' }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Metrics Section */}
      <div className="px-8 pb-8 pt-4 bg-white/90">
        <h4 className="text-xs font-bold text-muted-700 uppercase tracking-wider mb-4">Metric Profile</h4>
        <div className="space-y-3">
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
              const importanceOpacity = Math.max(0.08, Math.min(1, relevance * 2))
              return (
                <div key={metric.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                      <span className={`inline-block h-3 w-3 rounded-full ${colorInfo.bgClass} mr-1 border border-white/80 shadow`} />
                      {metric.name}
                    </span>
                    <div className="flex items-center gap-2 min-w-[60px]">
                      <div className="text-xs text-muted-600 font-bold tabular-nums">{Math.round(targetValue)}</div>
                      <Tooltip content={<span>{Math.round(relevance * 100)}% importance</span>} side="top">
                        <div className="relative w-14 h-2 bg-muted-200 rounded-full overflow-hidden cursor-help">
                          <div
                            className={colorInfo.bgClass + ' ' + colorInfo.textClass + " absolute left-0 top-0 h-full rounded-full transition-all"}
                            style={{ width: `${Math.round(relevance * 100)}%`, opacity: 0.85 }}
                          />
                        </div>
                      </Tooltip>
                    </div>
                  </div>
                  <div className="w-full h-3 bg-muted-100 rounded-full overflow-hidden shadow-inner">
                    <div
                      className={colorInfo.bgClass + ' ' + colorInfo.textClass + " h-full transition-all"}
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
