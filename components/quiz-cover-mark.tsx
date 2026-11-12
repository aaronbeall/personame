import { QuizSymbol } from '@/components/quiz-symbol'
import type { CSSProperties } from 'react'
import { getColorTheme } from '@/lib/colors'
import { ItemBackground } from './quiz-artwork'
import type { Artwork } from '@/lib/quiz-artwork'

/** Quizzes are authored collections: a cover, spine, and page edge rather than a portrait or tag. */
export function QuizCoverMark({
  emoji,
  color,
  size = 'md',
  background,
}: {
  emoji?: string | null
  color?: string | null
  size?: 'sm' | 'md'
  background?: Artwork | null
}) {
  const theme = getColorTheme(color || '#8b5cf6')
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
      <ItemBackground artwork={background} />
      <span className="quiz-cover-kicker">Quiz</span>
      <span className="quiz-cover-symbol"><QuizSymbol value={emoji} fallback="✨" /></span>
      <span className="quiz-cover-rule" />
    </span>
  )
}
