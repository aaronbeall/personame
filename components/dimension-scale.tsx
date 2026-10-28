import { DimensionEndpointLabel } from './dimension-endpoint-label'
import { getColorTheme, getBarGradient } from '@/lib/colors'
import type { CSSProperties } from 'react'

/** A dimension defines a spectrum, so no score or selected position is implied. */
export function DimensionScale({
  minLabel,
  maxLabel,
  minEmoji,
  maxEmoji,
  color,
}: {
  minLabel: string
  maxLabel: string
  minEmoji?: string | null
  maxEmoji?: string | null
  color: string
}) {
  return (
    <div
      className="dimension-scale"
      style={
        {
          '--dimension-color': getColorTheme(color).hex,
          '--dimension-end-color': getColorTheme(color).colors.at(-1),
          '--dimension-bar': getBarGradient(color),
        } as CSSProperties
      }
      role="img"
      aria-label={`Scale from ${minLabel} at 0 to ${maxLabel} at 100`}
    >
      <div className="dimension-scale-labels">
        <DimensionEndpointLabel label={minLabel} emoji={minEmoji} end="low" />
        <DimensionEndpointLabel label={maxLabel} emoji={maxEmoji} end="high" />
      </div>
      <div className="dimension-scale-track">
        <div className="dimension-scale-ticks">
          {[0, 25, 50, 75, 100].map((value) => (
            <span key={value} style={{ left: `${value}%` }} />
          ))}
        </div>
      </div>
    </div>
  )
}
