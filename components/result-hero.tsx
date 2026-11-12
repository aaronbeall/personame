import { ArchetypeBadge } from './entity-identity'
import { pagePresentation, quizThemeStyle } from '@/lib/quiz-presentation'
import { QuizArtwork } from './quiz-artwork'
import { readArtwork, type Artwork } from '@/lib/quiz-artwork'
import { ResultPreviewConfetti } from './result-preview-confetti'

export function ResultHero({ name, description, emoji, color, title, quizTitle, presentation, artwork, preview = false }: {
  name: string; description?: string | null; emoji?: string | null; color?: string | null; title?: string | null; quizTitle?: string; presentation?: unknown; preview?: boolean
  artwork?: Artwork | null
}) {
  const settings = pagePresentation(presentation)
  return <section className="result-trophy" style={quizThemeStyle(color)}>
    <span className="quiz-kicker">{preview ? 'A glimpse of your result' : quizTitle}</span>
    <div className="result-medallion" data-portrait={!!artwork}>
      <span className="result-medallion-rays" aria-hidden="true" />
      <QuizArtwork artwork={readArtwork(artwork)} className="result-authored-portrait" width={640} />
      <ArchetypeBadge name={name} emoji={emoji} color={color} size={artwork ? 52 : 188} label={false} />
      <span className="result-medallion-ribbon" aria-hidden="true">A new side of you</span>
    </div>
    <div className="result-trophy-copy"><p className="result-trophy-caption">{title || 'Meet your newest self'}</p><h1>{name}</h1>{settings.showDescription && description && <p className="result-trophy-description">{description}</p>}</div>
    {preview && <ResultPreviewConfetti />}
  </section>
}
