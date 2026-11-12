import { QuizSymbol } from '@/components/quiz-symbol'
import { ItemBackground } from './quiz-artwork'
import type { Artwork } from '@/lib/quiz-artwork'
import type { CSSProperties } from 'react'
import {
  getColorTheme,
  COLOR_THEME,
  getColorSurface,
  getBadgeAppearance,
} from '@/lib/colors'
import { getInitials } from '@/lib/utils'

type Identity = { name: string; emoji?: string | null; color?: string | null; background?: Artwork | null }
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
  background,
}: {
  name: string
  emoji?: string | null
  color?: string | null
  background?: Artwork | null
}) {
  const theme = getColorTheme(color)
  const surface = getColorSurface(theme.value)
  return (
    <span
      className="dimension-symbol item-style-surface"
      style={
        {
          '--dimension-color': theme.hex,
          '--dimension-surface': surface.background,
          color: surface.textColor,
        } as CSSProperties
      }
      aria-hidden="true"
    >
      <ItemBackground artwork={background} />
      <span><QuizSymbol value={emoji} fallback={getInitials(name) || '#'} /></span>
    </span>
  )
}
export function DimensionTag({ name, emoji, color, background }: Identity) {
  const theme = getColorTheme(color)
  const surface = getColorSurface(theme.value)
  return (
    <span
      className="dimension-tag item-style-surface"
      style={{ background: surface.background, color: surface.textColor }}
    >
      <ItemBackground artwork={background} />
      {emoji && <span aria-hidden="true"><QuizSymbol value={emoji} /></span>}
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
}: { size?: number; label?: boolean } & Omit<Identity, 'background'>) {
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
        <QuizSymbol value={emoji} fallback={getInitials(name) || '?'} />
      </div>
      {label && (
        <span className="archetype-badge-label" title={name}>
          {name}
        </span>
      )}
    </div>
  )
}
