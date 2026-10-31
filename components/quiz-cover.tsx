import Image from 'next/image'
import type { ReactNode } from 'react'
import { Clock3, ListChecks } from 'lucide-react'
import { pagePresentation, quizThemeStyle } from '@/lib/quiz-presentation'
import { QuizCoverMark } from './quiz-cover-mark'

export function QuizCover({ title, description, quizTitle, emoji, color, presentation, questionCount, action }: {
  title: string; description?: string | null; quizTitle?: string; emoji?: string | null; color?: string | null; presentation?: unknown; questionCount: number; action?: ReactNode
}) {
  const settings = pagePresentation(presentation)
  return <section className="quiz-cover" data-layout={settings.layout} style={quizThemeStyle(color)}>
    <div className="quiz-cover-visual" aria-hidden="true">{settings.artwork !== 'none' && <Image src={`/images/decor/${settings.artwork}.webp`} alt="" fill sizes="(max-width:700px) 100vw, 500px" />}<QuizCoverMark emoji={emoji} color={color} /></div>
    <div className="quiz-cover-content"><span className="quiz-kicker">{quizTitle || 'A little self-discovery'}</span><h1>{title}</h1>{settings.showDescription && description && <p className="quiz-cover-description">{description}</p>}
      <div className="quiz-cover-facts">{settings.showQuestionCount && <span><ListChecks size={14} />{questionCount} questions</span>}{settings.showTimeEstimate && <span><Clock3 size={14} />About {Math.max(1, Math.ceil(questionCount * 15 / 60))} min</span>}</div>
      {action && <div className="quiz-cover-action">{action}<span>There’s no right answer. Just your answer.</span></div>}
    </div>
  </section>
}
