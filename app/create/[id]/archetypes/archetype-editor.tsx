'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Metric, ArchetypeMetric, Archetype } from '@prisma/client'
import { EmojiPicker } from '@/components/ui/emoji-picker'
import { ColorPicker } from '@/components/ui/color-picker'
import { X, Palette, Save } from 'lucide-react'
import { COLOR_THEME, getColorTheme } from '@/lib/colors'
import { getTempId } from '@/lib/utils'
import { MetricTargetEditor } from './metric-target-editor'
import { MetricTooltip } from './metric-tooltip'

interface ArchetypeEditorProps {
  archetype: Archetype & { metrics: ArchetypeMetric[] }
  metrics: Metric[]
  onSave: (archetype: Archetype & { metrics: ArchetypeMetric[] }) => void
  onCancel: () => void
}

export function ArchetypeEditor({
  archetype,
  metrics,
  onSave,
  onCancel,
}: ArchetypeEditorProps) {
  const [name, setName] = useState(archetype.name)
  const [description, setDescription] = useState(archetype.description ?? '')
  const [emoji, setEmoji] = useState(archetype.emoji ?? '')
  const [color, setColor] = useState(archetype.color ?? COLOR_THEME[0].name)
  const [metricTargets, setMetricTargets] = useState<ArchetypeMetric[]>(
    archetype.metrics.length > 0
      ? archetype.metrics
      : metrics.map(m => ({
        id: getTempId(),
        archetypeId: archetype.id,
        metricId: m.id,
        targetValue: 50,
        relevance: 0.8,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
  )
  const [showStyleOptions, setShowStyleOptions] = useState(false)

  const handleTargetValueChange = (metricId: string, value: number) => {
    setMetricTargets(metricTargets.map(t => t.metricId === metricId ? { ...t, targetValue: value } : t))
  }

  const handleRelevanceChange = (metricId: string, value: number) => {
    setMetricTargets(metricTargets.map(t => t.metricId === metricId ? { ...t, relevance: value } : t))
  }

  const handleSave = () => {
    if (!name.trim()) return

    onSave({
      ...archetype,
      name: name.trim(),
      description: description.trim() || null,
      emoji: emoji || null,
      color: color || null,
      metrics: metricTargets,
    })
  }

  const colorInfo = getColorTheme(color)

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-white to-muted-50 rounded-2xl border-2 border-primary-200 shadow-lg">
      {/* Header with Profile */}
      <div className="flex items-start gap-6">
        <div className="flex flex-col items-center flex-shrink-0">
          <div className={`h-24 w-24 rounded-full ${colorInfo.bgClass} flex items-center justify-center text-white text-4xl shadow-lg`}>
            {emoji || '✨'}
          </div>
          <div className="mt-2">
            {!showStyleOptions ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowStyleOptions(true)}
                className="text-primary-700 hover:bg-primary-50"
              >
                <Palette className="h-4 w-4 mr-1" />
                Style
              </Button>
            ) : (
              <div className="flex flex-col items-center mt-1 gap-2">
                <div className="flex gap-2">
                  <EmojiPicker value={emoji} onSelect={setEmoji} />
                  <ColorPicker value={color} onSelect={setColor} />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowStyleOptions(false)}
                  className="text-muted-700"
                >
                  Done
                </Button>
              </div>
            )}
          </div>
        </div>
        <div className="flex-1">
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
            <Input
              placeholder="e.g., The Explorer"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-lg font-semibold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <Textarea
              placeholder="Describe this archetype..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="text-sm"
            />
          </div>
        </div>
      </div>

      {/* Metric Targets */}
      <div className="border-t border-muted-300 pt-6 space-y-4">
        <h3 className="font-semibold text-slate-900 text-sm">Metric Targets</h3>
        <div className="space-y-6">
          {metrics.map(metric => {
            const target = metricTargets.find(t => t.metricId === metric.id)
            const targetValue = target?.targetValue ?? 50
            const relevance = target?.relevance ?? 0.8

            return (
              <MetricTargetEditor
                key={metric.id}
                metric={metric}
                targetValue={targetValue}
                relevance={relevance}
                onTargetChange={(val) => handleTargetValueChange(metric.id, val)}
                onRelevanceChange={(val) => handleRelevanceChange(metric.id, val)}
              />
            )
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-muted-200">
        <Button
          variant="outline"
          onClick={onCancel}
          className="text-muted-700"
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={!name.trim()}
          className="bg-gradient-to-r from-primary to-secondary hover:from-primary-600 hover:to-secondary-600 text-white"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Archetype
        </Button>
      </div>
    </div>
  )
}
