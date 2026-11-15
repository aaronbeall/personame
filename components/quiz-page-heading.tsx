import { QuizSymbol } from './quiz-symbol'

export function QuizPageHeading({ title, description, emoji, color, layout }: {
  title?: string | null
  description?: string | null
  emoji?: string | null
  color?: string | null
  layout: 'hero' | 'split' | 'card' | 'minimal'
}) {
  if (!title && !description && !emoji) return null
  return <header className="quiz-page-heading" data-layout={layout} data-custom-color={!!color}>
    {emoji && <span className="quiz-page-emblem" aria-hidden="true"><QuizSymbol value={emoji} /></span>}
    <div>
      {title && <h2 className="quiz-page-title">{title}</h2>}
      {description && <p className="player-page-description">{description}</p>}
    </div>
  </header>
}
