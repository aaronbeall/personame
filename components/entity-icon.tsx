import { Drama, BookOpen, SlidersHorizontal } from 'lucide-react'

export type EntityKind = 'quiz' | 'dimension' | 'archetype'
const icons = {
  quiz: BookOpen,
  dimension: SlidersHorizontal,
  archetype: Drama,
} as const

/** Category symbols, independent of the custom emoji/image chosen for an individual item. */
export function EntityIcon({
  kind,
  size = 16,
  className,
}: {
  kind: EntityKind
  size?: number
  className?: string
}) {
  const Icon = icons[kind]
  return (
    <Icon
      size={size}
      strokeWidth={1.75}
      className={className}
      aria-hidden="true"
    />
  )
}
