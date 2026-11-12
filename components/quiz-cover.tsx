import Image from 'next/image'
import type { ReactNode } from 'react'
import { Clock3, ListChecks } from 'lucide-react'
import { curatedArtworkSrc } from '@/lib/quiz-artwork'
import { pagePresentation, quizThemeStyle, type QuizBooklet } from '@/lib/quiz-presentation'
import { QuizCoverMark } from './quiz-cover-mark'
import { ArtworkCredit, ArtworkImage, QuizBackground } from './quiz-artwork'

export function QuizCover({ title, description, quizTitle, emoji, color, booklet, presentation, questionCount, action }: {
  title: string; description?: string | null; quizTitle?: string; emoji?: string | null; color?: string | null; booklet?: QuizBooklet; presentation?: unknown; questionCount: number; action?: ReactNode
}) {
  const settings = pagePresentation(presentation)
  return <section className="quiz-cover" data-layout={settings.layout} data-cover-image={!!settings.coverImage} style={quizThemeStyle(color)}>
    {settings.backgroundImage && <QuizBackground artwork={settings.backgroundImage} />}
    <div className="quiz-cover-visual">
      {settings.coverImage ? <ArtworkImage artwork={settings.coverImage} /> : settings.coverImage === undefined && settings.artwork !== 'none' && <Image src={curatedArtworkSrc(settings.artwork)} alt="" fill sizes="(max-width:700px) 100vw, 500px" />}
    </div>
    <div className="quiz-cover-content">
      <div className="quiz-cover-intro">
        <QuizCoverMark emoji={emoji} color={color} booklet={booklet} />
        <div>
          <span className="quiz-kicker">{quizTitle || 'A little self-discovery'}</span>
          <h1>{title}</h1>
        </div>
      </div>
      {settings.showDescription && description && <p className="quiz-cover-description">{description}</p>}
      <div className="quiz-cover-facts">{settings.showQuestionCount && <span><ListChecks size={14} />{questionCount} questions</span>}{settings.showTimeEstimate && <span><Clock3 size={14} />About {Math.max(1, Math.ceil(questionCount * 15 / 60))} min</span>}</div>
      {action && <div className="quiz-cover-action">{action}<span>There’s no right answer. Just your answer.</span></div>}
      {settings.coverImage && <ArtworkCredit artwork={settings.coverImage} />}
      {settings.backgroundImage && <ArtworkCredit artwork={settings.backgroundImage} />}
    </div>
  </section>
}
