import type { CSSProperties } from 'react'
import { getColorTheme } from '@/lib/colors'

/** Quizzes are authored collections: a cover, spine, and page edge rather than a portrait or tag. */
export function QuizCoverMark({
  emoji,
  color,
  size = 'md',
}: {
  emoji?: string | null
  color?: string | null
  size?: 'sm' | 'md'
}) {
  const theme = getColorTheme(color || '#8b5cf6')
  return (
    <span
      className={`quiz-cover-mark quiz-cover-mark-${size}`}
      style={
        {
          '--quiz-color': theme.hex,
          '--quiz-accent': theme.colors.at(-1),
        } as CSSProperties
      }
      aria-hidden="true"
    >
      <span className="quiz-cover-kicker">Quiz</span>
      <span className="quiz-cover-symbol">{emoji || '✨'}</span>
      <span className="quiz-cover-rule" />
    </span>
  )
}
