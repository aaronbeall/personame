import { DimensionValueLabel } from '@/components/dimension-value-label'
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
    <div className="dimension-target-editor">
      <div className="dimension-target-main">
        <div className="dimension-target-heading">
          <DimensionTag
            name={dimension.name}
            emoji={dimension.emoji}
            color={dimension.color}
          />
          <DimensionTooltip dimension={dimension}>
            <Info className="w-3.5 h-3.5 text-muted-500 cursor-help" />
          </DimensionTooltip>
        </div>
        <div className="dimension-target-meaning">
          <DimensionValueLabel
            value={targetValue}
            minLabel={dimension.minLabel || 'Low'}
            maxLabel={dimension.maxLabel || 'High'}
            minEmoji={dimension.minEmoji}
            maxEmoji={dimension.maxEmoji}
          />
        </div>
        <div className="dimension-target-controls">
          <Slider
            aria-label={`${dimension.name} target value`}
            min={0}
            max={100}
            value={[targetValue]}
            onValueChange={(values) => {
              const value = values[0] ?? 0
              onTargetChange(value)
              setTargetInput(String(value))
            }}
            color={dimension.color ?? undefined}
          />
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
        <div className="dimension-target-endpoints">
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
      </div>
      <div className="dimension-target-weight">
        <div className="dimension-target-heading">
          <span className="text-sm font-medium">Importance</span>
          <Tooltip
            content={
              <p className="text-xs">
                How much this dimension influences the archetype match. Zero
                means it is ignored.
              </p>
            }
          >
            <CircleQuestionMark className="w-3.5 h-3.5 text-muted-400 cursor-help" />
          </Tooltip>
        </div>
        <div className="dimension-target-meaning">
          {relevance === 0
            ? 'Not used in matching'
            : relevance <= 0.33
              ? 'Light influence'
              : relevance <= 0.66
                ? 'Moderate influence'
                : 'Strong influence'}
        </div>
        <div className="dimension-target-controls">
          <Slider
            aria-label={`${dimension.name} importance weight`}
            min={0}
            max={100}
            value={[Math.round(relevance * 100)]}
            onValueChange={(values) => {
              const value = values[0] ?? 0
              onRelevanceChange(value / 100)
              setRelevanceInput(String(value))
            }}
            className="importance-weight-slider"
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
            <span className="text-xs">%</span>
          </div>
        </div>
        <div className="dimension-target-endpoints">
          <span>Ignore</span>
          <span>Essential</span>
        </div>
      </div>
    </div>
  )
}
