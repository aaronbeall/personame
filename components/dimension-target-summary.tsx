import { describeDimensionValue } from '@/lib/dimension-value'
import { getColorSurface, getColorTheme } from '@/lib/colors'
import type { DimensionValueLabelProps } from './dimension-value-label'

/** Compact, read-only target and matching weight for profiles and popovers. */
export function DimensionTargetSummary({ value, minLabel, maxLabel, minEmoji, maxEmoji, color, importance, name }: DimensionValueLabelProps & { color: string | null; importance: number; name: string }) {
  const result = describeDimensionValue(value, minLabel, maxLabel)
  const emoji = result.end === 'low' ? minEmoji : result.end === 'high' ? maxEmoji : null
  const surface = getColorSurface(getColorTheme(color).value)
  const position = Math.max(0, Math.min(100, value))
  return <div className="dimension-target-summary">
    <div className="dimension-target-reading"><span>{emoji && <span aria-hidden="true">{emoji} </span>}{result.description}</span><span className="dimension-target-number">{result.score}<small>/100</small></span></div>
    <div className="dimension-target-rail" role="meter" aria-label={`${name} target`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={position} aria-valuetext={`${result.description}, ${result.score} out of 100`}>
      <span className="dimension-target-fill" style={{ width: `${position}%`, background: surface.background }} />
      <span className="dimension-target-point" aria-hidden="true" style={{ left: `clamp(5px, ${position}%, calc(100% - 5px))`, background: surface.background }} />
    </div>
    <div className="dimension-target-importance">{importance === 0 ? 'Ignored in matching' : <>{Math.round(importance * 100)}% importance</>}</div>
  </div>
}
