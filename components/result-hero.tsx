import { ArchetypeBadge } from './entity-identity'
import { pagePresentation, quizThemeStyle } from '@/lib/quiz-presentation'
import { ArtworkCredit, ItemBackground } from './quiz-artwork'
import { readArtwork, type Artwork } from '@/lib/quiz-artwork'
import { ResultPreviewConfetti } from './result-preview-confetti'

export function ResultHero({ name, description, emoji, color, title, quizTitle, presentation, artwork, preview = false }: {
  name: string; description?: string | null; emoji?: string | null; color?: string | null; title?: string | null; quizTitle?: string; presentation?: unknown; preview?: boolean
  artwork?: Artwork | null
}) {
  const settings = pagePresentation(presentation)
  const background = readArtwork(artwork)
  return <section className="result-trophy archetype-heading-art item-style-surface" data-artwork={!!background} style={quizThemeStyle(color)}>
    <ItemBackground artwork={background} />
    <span className="quiz-kicker">{preview ? 'A glimpse of your result' : quizTitle}</span>
    <div className="result-medallion">
      <span className="result-medallion-rays" aria-hidden="true" />
      <ArchetypeBadge name={name} emoji={emoji} color={color} size={188} label={false} />
      <span className="result-medallion-ribbon" aria-hidden="true">A new side of you</span>
    </div>
    <div className="result-trophy-copy"><p className="result-trophy-caption">{title || 'Meet your newest self'}</p><h1>{name}</h1>{settings.showDescription && description && <p className="result-trophy-description">{description}</p>}</div>
    {background && <ArtworkCredit artwork={background} />}
    {preview && <ResultPreviewConfetti />}
  </section>
}
