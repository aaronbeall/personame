import type { CSSProperties } from 'react'
import {
  getColorTheme,
  COLOR_THEME,
  getColorSurface,
  getBadgeAppearance,
} from '@/lib/colors'
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
  const surface = getColorSurface(theme.value)
  return (
    <span
      className="dimension-symbol"
      style={
        {
          '--dimension-color': theme.hex,
          '--dimension-surface': surface.background,
          color: surface.textColor,
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
  const surface = getColorSurface(theme.value)
  return (
    <span
      className="dimension-tag"
      style={{ background: surface.background, color: surface.textColor }}
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
  const badge = getBadgeAppearance(theme.value)
  return (
    <div
      className={`archetype-badge${badge.themed ? ' archetype-badge-themed' : ''}`}
      style={
        {
          '--badge-color': badge.primary,
          '--badge-accent': badge.accent,
          '--badge-shade': badge.shade,
          '--badge-texture': badge.texture,
          '--badge-frame': badge.border,
          '--badge-ring': badge.ring,
          '--badge-inner-ring': badge.innerRing,
          '--badge-ink': badge.textColor,
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
