'use client'
import { Fragment } from 'react'
import { QuizSymbol } from '@/components/quiz-symbol'
import { readArtwork } from '@/lib/quiz-artwork'
import { ArtworkCredit, ItemBackground } from './quiz-artwork'
import { quizThemeStyle } from '@/lib/quiz-presentation'
import type { ResponseValue } from '@/lib/quiz-scoring'
export type PlayerQuestion = {
  id: string
  text: string
  type: 'MULTIPLE_CHOICE' | 'SLIDER' | 'SCALE'
  required: boolean
  emoji: string | null
  answers: { id: string; text: string; emoji: string | null; style?: string | null; color?: string | null }[]
}
export function QuestionInput({
  question: q,
  value,
  onChange,
  disabled = false,
}: {
  disabled?: boolean
  question: PlayerQuestion
  value?: ResponseValue
  onChange: (value: ResponseValue) => void
}) {
  const answers = q.type === 'SCALE' ? q.answers.slice(2) : q.answers
  if (q.type === 'SLIDER')
    return (
      <div className="question-slider">
        <div className="range-labels">
          {q.answers.slice(0, 2).map(answer => {
            const artwork = readArtwork(answer.style)
            return <div key={answer.id} className="slider-end-style">
              <div className="item-style-surface" data-artwork={!!artwork} data-custom-color={!!answer.color} style={answer.color ? quizThemeStyle(answer.color) : undefined}>
                <ItemBackground artwork={artwork} />
                <span className="answer-option-label"><QuizSymbol value={answer.emoji} /> {answer.text}</span>
              </div>
              {artwork && <ArtworkCredit artwork={artwork} />}
            </div>
          })}
        </div>
        <input
          disabled={disabled}
          aria-label={q.text}
          type="range"
          min={0}
          max={100}
          value={value?.value ?? 50}
          onChange={(e) => onChange({ value: Number(e.target.value) })}
        />
        <div className="range-value">
          <output>{value?.value ?? 50}</output>
          {!value && (
            <button type="button" disabled={disabled} onClick={() => onChange({ value: 50 })}>
              Use midpoint
            </button>
          )}
        </div>
      </div>
    )
  return (
    <div
      className={q.type === 'SCALE' ? 'answer-scale' : 'answer-choices'}
      role="group"
      aria-label={q.text}
    >
      {answers.map((answer) => {
        const artwork = readArtwork(answer.style)
        const selected = value?.answerId === answer.id
        const button = <button
          type="button"
          className="item-style-surface"
          disabled={disabled}
          aria-pressed={selected}
          data-artwork={!!artwork}
          data-custom-color={!!answer.color}
          style={answer.color ? quizThemeStyle(answer.color) : undefined}
          onClick={() => onChange({ answerId: answer.id })}
        >
          <ItemBackground artwork={artwork} />
          <span className="answer-option-label">
            <span className="answer-emoji" aria-hidden="true">
              <QuizSymbol value={answer.emoji} fallback={q.type === 'MULTIPLE_CHOICE' ? selected ? '●' : '○' : ''} />
            </span>
            <span>{answer.text}</span>
          </span>
        </button>
        return artwork ? (
          <div className="answer-with-artwork" key={answer.id}>
            {button}
            <ArtworkCredit artwork={artwork} />
          </div>
        ) : <Fragment key={answer.id}>{button}</Fragment>
      })}
    </div>
  )
}
