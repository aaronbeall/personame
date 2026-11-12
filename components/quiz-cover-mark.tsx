import { QuizSymbol } from '@/components/quiz-symbol'
import type { CSSProperties } from 'react'
import { getColorTheme } from '@/lib/colors'
import type { QuizBooklet } from '@/lib/quiz-presentation'

export function BookletPattern({ pattern }: { pattern: NonNullable<QuizBooklet['pattern']> }) {
  return <span
    aria-hidden="true"
    className="quiz-booklet-pattern"
    data-pattern={pattern}
    style={{ maskImage: `url(/images/booklet-patterns/${pattern}.webp)` }}
  />
}

/** Quizzes are authored collections: a cover, spine, and page edge rather than a portrait or tag. */
export function QuizCoverMark({
  emoji,
  color,
  size = 'md',
  booklet,
}: {
  emoji?: string | null
  color?: string | null
  size?: 'sm' | 'md'
  booklet?: QuizBooklet
}) {
  const theme = getColorTheme(color || '#8b5cf6')
  const label = booklet?.title?.trim() || 'Quiz'
  const subLabel = booklet?.subtitle?.trim()
  return (
    <span
      className={`quiz-cover-mark quiz-cover-mark-${size} item-style-surface`}
      style={
        {
          '--quiz-color': theme.hex,
          '--emblem-color': theme.hex,
          '--quiz-accent': theme.colors.at(-1),
        } as CSSProperties
      }
      aria-hidden="true"
    >
      {booklet?.pattern && <BookletPattern pattern={booklet.pattern} />}
      <span className="quiz-cover-kicker quiz-booklet-text"
        style={{ '--booklet-characters': Array.from(label).length } as CSSProperties}>{label}</span>
      <span className="quiz-cover-symbol"><QuizSymbol value={emoji} fallback="✨" /></span>
      {subLabel
        ? <span className="quiz-cover-subtitle quiz-booklet-text"
            style={{ '--booklet-characters': Array.from(subLabel).length } as CSSProperties}>{subLabel}</span>
        : <span className="quiz-cover-rule" />}
    </span>
  )
}
