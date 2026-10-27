import { DimensionEndpointLabel } from '@/components/dimension-endpoint-label'
import { useEffect, useState } from 'react'
import { DimensionTag } from '@/components/entity-identity'
import { Dimension } from '@prisma/client'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { DimensionTooltip } from './dimension-tooltip'
import { CircleQuestionMark, Info } from 'lucide-react'
import { Tooltip } from '@/components/ui/tooltip'

interface DimensionTargetEditorProps {
  dimension: Dimension
  targetValue: number
  relevance: number
  onTargetChange: (value: number) => void
  onRelevanceChange: (value: number) => void
}

export function DimensionTargetEditor({
  dimension,
  targetValue,
  relevance,
  onTargetChange,
  onRelevanceChange,
}: DimensionTargetEditorProps) {
  const [targetInput, setTargetInput] = useState(String(targetValue))
  const [relevanceInput, setRelevanceInput] = useState(
    String((relevance * 100).toFixed(0)),
  )

  // Sync local inputs when parent updates
  useEffect(() => {
    setTargetInput(String(targetValue))
  }, [targetValue])

  useEffect(() => {
    setRelevanceInput(String((relevance * 100).toFixed(0)))
  }, [relevance])

  const handleTargetBlur = () => {
    const value = Math.min(
      100,
      Math.max(
        0,
        Number.isFinite(parseInt(targetInput)) ? parseInt(targetInput) : 50,
      ),
    )
    onTargetChange(value)
    setTargetInput(String(value))
  }

  const handleRelevanceBlur = () => {
    const value = Math.min(
      100,
      Math.max(
        0,
        Number.isFinite(parseInt(relevanceInput))
          ? parseInt(relevanceInput)
          : 50,
      ),
    )
    onRelevanceChange(value / 100)
    setRelevanceInput(String(value))
  }

  return (
    <div className="p-4 bg-muted-50 rounded-lg border border-muted-200">
      <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <DimensionTag
              name={dimension.name}
              emoji={dimension.emoji}
              color={dimension.color}
            />
            <DimensionTooltip dimension={dimension}>
              <Info className="w-3.5 h-3.5 text-muted-500 hover:text-muted-600 transition-colors cursor-help" />
            </DimensionTooltip>
          </div>

          {/* Slider and input aligned */}
          <div className="flex items-center gap-3">
            <div className="flex-1 space-y-1">
              {/* Min/Max labels anchored to slider */}
              <div className="flex items-center justify-between text-[11px] text-muted-600 px-0.5">
                <DimensionEndpointLabel
                  label={dimension.minLabel || '0'}
                  emoji={dimension.minEmoji}
                  end="low"
                />
                <DimensionEndpointLabel
                  label={dimension.maxLabel || '100'}
                  emoji={dimension.maxEmoji}
                  end="high"
                />
              </div>
              <Slider
                min={0}
                max={100}
                value={[targetValue]}
                onValueChange={(vals) => {
                  const value = vals[0] ?? 0
                  onTargetChange(value)
                  setTargetInput(String(value))
                }}
                color={dimension.color ?? undefined}
              />
            </div>
            <Input
              type="number"
              min="0"
              max="100"
              aria-label={`${dimension.name} target`}
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value)}
              onBlur={handleTargetBlur}
              className="w-16 px-2 py-1 text-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-700">
                Importance
              </label>
              <Tooltip
                content={
                  <p className="text-xs">
                    How important is this dimension for this archetype?
                  </p>
                }
              >
                <CircleQuestionMark className="w-3.5 h-3.5 text-muted-400 hover:text-muted-600 transition-colors cursor-help" />
              </Tooltip>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Slider
              min={0}
              max={100}
              value={[parseInt(relevanceInput) || 0]}
              onValueChange={(vals) => {
                const value = vals[0] ?? 0
                onRelevanceChange(value / 100)
                setRelevanceInput(String(value))
              }}
              className="flex-1"
            />
            <div className="flex items-center gap-1 text-sm text-muted-700">
              <Input
                type="number"
                min="0"
                max="100"
                aria-label={`${dimension.name} importance`}
                value={relevanceInput}
                onChange={(e) => setRelevanceInput(e.target.value)}
                onBlur={handleRelevanceBlur}
                className="w-16 px-2 py-1 text-sm"
              />
              <span className="text-xs font-medium">%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
