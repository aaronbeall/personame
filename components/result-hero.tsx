import Image from 'next/image'
import { ArchetypeBadge } from './entity-identity'
import { pagePresentation, quizThemeStyle } from '@/lib/quiz-presentation'

export function ResultHero({ name, description, emoji, color, title, quizTitle, presentation, preview = false }: {
  name: string; description?: string | null; emoji?: string | null; color?: string | null; title?: string | null; quizTitle?: string; presentation?: unknown; preview?: boolean
}) {
  const settings = pagePresentation(presentation)
  return <section className="result-trophy" data-layout={settings.layout} style={quizThemeStyle(color)}>
    {settings.artwork !== 'none' && <Image className="result-trophy-art" src={`/images/decor/${settings.artwork}.webp`} fill sizes="900px" alt="" />}
    <span className="quiz-kicker">{preview ? 'A glimpse of your result' : quizTitle}</span>
    <div className="result-medallion"><span className="result-medallion-rays" aria-hidden="true" /><ArchetypeBadge name={name} emoji={emoji} color={color} size={188} label={false} /><span className="result-medallion-ribbon" aria-hidden="true">A new side of you</span></div>
    <div className="result-trophy-copy"><p className="result-trophy-caption">{title || 'Meet your newest self'}</p><h1>{name}</h1>{settings.showDescription && description && <p className="result-trophy-description">{description}</p>}</div>
  </section>
}
