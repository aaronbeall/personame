'use client'
import type { ResponseValue } from '@/lib/quiz-scoring'
export type PlayerQuestion = {
  id: string
  text: string
  type: 'MULTIPLE_CHOICE' | 'SLIDER' | 'SCALE'
  required: boolean
  emoji: string | null
  answers: { id: string; text: string; emoji: string | null }[]
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
          <span>
            {q.answers[0]?.emoji} {q.answers[0]?.text}
          </span>
          <span>
            {q.answers[1]?.emoji} {q.answers[1]?.text}
          </span>
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
      {answers.map((a) => (
        <button
          type="button"
          disabled={disabled}
          aria-pressed={value?.answerId === a.id}
          key={a.id}
          onClick={() => onChange({ answerId: a.id })}
        >
          <span className="answer-emoji" aria-hidden="true">
            {a.emoji ||
              (q.type === 'MULTIPLE_CHOICE'
                ? value?.answerId === a.id
                  ? '●'
                  : '○'
                : '')}
          </span>
          <span>{a.text}</span>
        </button>
      ))}
    </div>
  )
}
