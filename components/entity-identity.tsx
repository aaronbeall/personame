import type { CSSProperties } from 'react'
import { getColorTheme, COLOR_THEME } from '@/lib/colors'
import { getInitials } from '@/lib/utils'

type Identity = { name: string; emoji?: string | null; color?: string | null }
export function getArchetypeTheme(
  color: string | null | undefined,
  name: string,
) {
  // Unstyled profiles still have a stable identity across builder and results.
  const index =
    Array.from(name).reduce(
      (hash, char) => (hash * 31 + char.codePointAt(0)!) >>> 0,
      0,
    ) % COLOR_THEME.length
  return getColorTheme(color, index)
}
function dimensionInk(color: string) {
  return ['amber', 'orange', 'green', 'teal', 'cyan', 'pink', 'rose'].includes(
    color,
  )
    ? '#241a35'
    : '#ffffff'
}
export function DimensionSymbol({
  name,
  emoji,
  color,
}: {
  name: string
  emoji?: string | null
  color?: string | null
}) {
  const theme = getColorTheme(color)
  return (
    <span
      className="dimension-symbol"
      style={
        {
          '--dimension-color': theme.hex,
          color: dimensionInk(theme.name),
        } as CSSProperties
      }
      aria-hidden="true"
    >
      <span>{emoji || getInitials(name) || '#'}</span>
    </span>
  )
}
export function DimensionTag({ name, emoji, color }: Identity) {
  const theme = getColorTheme(color)
  return (
    <span
      className="dimension-tag"
      style={{ background: theme.hex, color: dimensionInk(theme.name) }}
    >
      {emoji && <span aria-hidden="true">{emoji}</span>}
      {name}
    </span>
  )
}
export function ArchetypeBadge({
  name,
  emoji,
  color,
  size = 96,
  label = true,
}: { size?: number; label?: boolean } & Identity) {
  const theme = getArchetypeTheme(color, name)
  return (
    <div
      className="archetype-badge"
      style={
        {
          '--badge-color': theme.hex,
          '--badge-size': `${size}px`,
        } as CSSProperties
      }
    >
      <div className="archetype-badge-face" aria-hidden="true">
        {emoji || getInitials(name) || '?'}
      </div>
      {label && (
        <span className="archetype-badge-label" title={name}>
          {name}
        </span>
      )}
    </div>
  )
}
