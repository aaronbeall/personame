import { describeDimensionValue } from '@/lib/dimension-value'

export type DimensionValueLabelProps = {
  value: number
  minLabel: string
  maxLabel: string
  minEmoji?: string | null
  maxEmoji?: string | null
}

/** Shared score-and-meaning label for tooltips, summaries, and future value displays. */
export function DimensionValueLabel({
  value,
  minLabel,
  maxLabel,
  minEmoji,
  maxEmoji,
}: DimensionValueLabelProps) {
  const result = describeDimensionValue(value, minLabel, maxLabel)
  const emoji =
    result.end === 'low' ? minEmoji : result.end === 'high' ? maxEmoji : null
  return (
    <span className="dimension-value-label">
      <span className="dimension-value-description">
        {emoji && (
          <span aria-hidden="true" className="dimension-value-emoji">
            {emoji}
          </span>
        )}
        <span>{result.description}</span>
      </span>
      <span className="dimension-value-score">
        {result.score}
        <small>/100</small>
      </span>
    </span>
  )
}
