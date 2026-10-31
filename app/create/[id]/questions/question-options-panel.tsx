import { questionInfluence, questionInfluences } from '@/lib/question-influence'
import { Question, Answer, AnswerWeight, Dimension } from '@prisma/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { EmojiPicker } from '@/components/ui/emoji-picker'
import { Slider } from '@/components/ui/slider'
import {
  X,
  Plus,
  Trash2,
  CheckSquare,
  Sliders,
  BarChart3,
} from 'lucide-react'
import { getTempId, cn } from '@/lib/utils'
import { DimensionTag } from '@/components/entity-identity'
import { DimensionEndpointLabel } from '@/components/dimension-endpoint-label'
import { useState, type CSSProperties } from 'react'
import { getColorTheme } from '@/lib/colors'
import { createDefaultAnswers } from './question-defaults'

interface QuestionOptionsPanelProps {
  question: Question & {
    answers: (Answer & {
      weights: AnswerWeight[]
    })[]
  }
  dimensions: Dimension[]
  onUpdate: (
    question: Question & { answers: (Answer & { weights: AnswerWeight[] })[] },
  ) => void
  onClose: () => void
}

const QUESTION_TYPES = [
  { value: 'MULTIPLE_CHOICE', label: 'Multiple Choice', Icon: CheckSquare },
  { value: 'SLIDER', label: 'Slider', Icon: Sliders },
  { value: 'SCALE', label: 'Scale', Icon: BarChart3 },
] as const

export function QuestionOptionsPanel({
  question,
  dimensions,
  onUpdate,
  onClose,
}: QuestionOptionsPanelProps) {
  // Store answers by question type to restore when switching back
  const [rememberedAnswers, setRememberedAnswers] = useState<
    Record<string, (Answer & { weights: AnswerWeight[] })[]>
  >({
    [question.type]: question.answers,
  })

  const handleAddAnswer = () => {
    const answerId = getTempId()
    const newAnswer: Answer & { weights: AnswerWeight[] } = {
      id: answerId,
      text: `Option ${question.answers.length + 1}`,
      order: question.answers.length,
      emoji: null,
      color: null,
      style: null,
      icon: null,
      questionId: question.id,
      weights: dimensions.filter(m => question.answers.some(a => a.weights.some(w => w.dimensionId === m.id))).map((m) => ({
        id: getTempId(),
        dimensionId: m.id,
        value: 50,
        answerId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    onUpdate({ ...question, answers: [...question.answers, newAnswer] })
  }

  const handleDeleteAnswer = (answerId: string) => {
    onUpdate({
      ...question,
      answers: question.answers
        .filter((a) => a.id !== answerId)
        .map((a, idx) => ({ ...a, order: idx })),
    })
  }

  const handleUpdateAnswer = (answerId: string, updates: Partial<Answer>) => {
    onUpdate({
      ...question,
      answers: question.answers.map((a) =>
        a.id === answerId ? { ...a, ...updates } : a,
      ),
    })
  }

  const handleUpdateWeight = (
    answerId: string,
    dimensionId: string,
    value: number,
  ) => {
    onUpdate({
      ...question,
      answers: question.answers.map((a) =>
        a.id === answerId
          ? {
              ...a,
              weights: a.weights.map((w) =>
                w.dimensionId === dimensionId ? { ...w, value } : w,
              ),
            }
          : a,
      ),
    })
  }

  const mappedDimensions = dimensions.filter(d => question.answers.some(a => a.weights.some(w => w.dimensionId === d.id)))
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Question Settings</span>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Close question settings"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
        <div>
          <label className="text-sm font-medium text-muted-700 mb-1 block">
            Question Text
          </label>
          <Textarea
            value={question.text}
            onChange={(e) => onUpdate({ ...question, text: e.target.value })}
            placeholder="Enter your question"
            rows={3}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-muted-700 mb-1 block">
            Emoji
          </label>
          <EmojiPicker
            value={question.emoji || ''}
            onSelect={(emoji) => onUpdate({ ...question, emoji })}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-muted-700 mb-2 block">
            Question Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            {QUESTION_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => {
                  if (type.value !== question.type) {
                    // Store current answers for current type
                    setRememberedAnswers((prev) => ({
                      ...prev,
                      [question.type]: question.answers,
                    }))

                    // Check if we have remembered answers for the new type
                    let newAnswers: (Answer & { weights: AnswerWeight[] })[]
                    if (rememberedAnswers[type.value]) {
                      // Restore previously saved answers
                      newAnswers = rememberedAnswers[type.value]
                    } else {
                      // Generate default answers for the new type
                      const defaultAnswers = createDefaultAnswers(
                        type.value,
                        dimensions,
                      )
                      newAnswers = defaultAnswers.map((a) => ({
                        ...a,
                        questionId: question.id,
                      }))
                    }

                    // Update question with new type and answers
                    const updatedQuestion = {
                      ...question,
                      type: type.value,
                      answers: newAnswers,
                    }
                    onUpdate(updatedQuestion)
                  }
                }}
                className={cn(
                  'p-3 rounded-lg border-2 text-center transition-all',
                  question.type === type.value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-muted-200 hover:border-primary-300',
                )}
              >
                <type.Icon className="h-6 w-6 mx-auto mb-1 text-muted-600" />
                <div className="text-xs font-medium">{type.label}</div>
              </button>
            ))}
          </div>
        </div>

        <Checkbox
          id="required"
          label="Required question"
          checked={question.required}
          onChange={(e) =>
            onUpdate({ ...question, required: e.target.checked })
          }
        />

        <fieldset className="question-scoring-settings">
          <legend>What does this question measure?</legend>
          <div className="question-dimension-toggles" role="group" aria-label="Measured dimensions">{dimensions.map(d => {
            const active = mappedDimensions.some(m => m.id === d.id)
            return <div className="question-dimension-option" key={d.id} data-active={active} style={{ '--dimension-accent': getColorTheme(d.color).hex } as CSSProperties}><button type="button" className="question-dimension-toggle" aria-label={d.name} aria-pressed={active} onClick={() => onUpdate({ ...question,
              dimensionInfluences: active ? Object.fromEntries(Object.entries(questionInfluences(question)).filter(([key]) => key !== d.id)) : { ...questionInfluences(question), [d.id]: 1 },
              answers: question.answers.map((a, i) => ({ ...a, weights: active || (question.type === 'SCALE' && i >= 2) ? a.weights.filter(w => w.dimensionId !== d.id) : a.weights.some(w => w.dimensionId === d.id) ? a.weights : [...a.weights, { id: getTempId(), answerId: a.id, dimensionId: d.id, value: 50, createdAt: new Date(), updatedAt: new Date() }] })) })}>
              <DimensionTag name={d.name} emoji={d.emoji} color={d.color} />
            </button>{active && <label className="question-dimension-influence"><Input type="number" aria-label={`${d.name} influence`} min={0.1} max={100} step={0.1} value={questionInfluence(question, d.id)} onChange={event => { const value = event.target.valueAsNumber; if (Number.isFinite(value) && value > 0 && value <= 100) onUpdate({ ...question, dimensionInfluences: { ...questionInfluences(question), [d.id]: value } }) }} /><span aria-hidden="true">×</span></label>}</div>
          })}</div>
          <p>Influence controls how much this question affects the score. 2× counts twice as much as 1×.</p>
        </fieldset>

        {question.type === 'MULTIPLE_CHOICE' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-muted-700">
                Answer Options
              </label>
              <Button variant="outline" size="sm" onClick={handleAddAnswer}>
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>
            </div>

            <div className="space-y-3">
              {question.answers.map((answer) => (
                <div
                  key={answer.id}
                  className="border border-muted-200 rounded-lg p-3 space-y-2"
                >
                  <div className="flex items-start gap-2">
                    <EmojiPicker
                      value={answer.emoji || ''}
                      onSelect={(emoji) =>
                        handleUpdateAnswer(answer.id, { emoji })
                      }
                    />
                    <Input
                      value={answer.text}
                      onChange={(e) =>
                        handleUpdateAnswer(answer.id, { text: e.target.value })
                      }
                      placeholder="Answer text"
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAnswer(answer.id)}
                      className="text-red-500 hover:text-red-700"
                      disabled={question.answers.length <= 2}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <AnswerWeightsEditor
                    answer={answer}
                    dimensions={mappedDimensions}
                    onUpdateWeight={handleUpdateWeight}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddAnswer}
                className="w-full mt-2 border-2 border-dashed border-muted-200 rounded-lg p-3 flex items-center justify-center text-muted-600 hover:border-primary-300 hover:text-primary-600"
              >
                <Plus className="h-4 w-4 mr-1" /> Add option
              </button>
            </div>
          </div>
        )}

        {(question.type === 'SLIDER' || question.type === 'SCALE') && (
          <div>
            <label className="text-sm font-medium text-muted-700 mb-2 block">
              {question.type === 'SLIDER' ? 'Slider Range' : 'Scale Options'}
            </label>

            {question.type === 'SLIDER' && (
              <div className="space-y-3">
                <div className="text-xs text-muted-600 mb-3">
                  Define the minimum and maximum values for this slider. Users
                  will select a value between these endpoints.
                </div>
                {question.answers.map((answer, idx) => {
                  const isMin = idx === 0
                  const label = isMin ? 'Min' : 'Max'
                  return (
                    <div
                      key={answer.id}
                      className="border border-muted-200 rounded-lg p-3 space-y-2"
                    >
                      <label className="text-xs font-semibold text-muted-600 block">
                        {label} Label
                      </label>
                      <div className="flex items-center gap-2">
                        <EmojiPicker
                          value={answer.emoji || ''}
                          onSelect={(emoji) =>
                            handleUpdateAnswer(answer.id, { emoji })
                          }
                        />
                        <Input
                          value={answer.text}
                          onChange={(e) =>
                            handleUpdateAnswer(answer.id, {
                              text: e.target.value,
                            })
                          }
                          placeholder={`Enter ${label.toLowerCase()} label`}
                          className="flex-1"
                        />
                      </div>

                      <AnswerWeightsEditor
                        answer={answer}
                        dimensions={mappedDimensions}
                        onUpdateWeight={handleUpdateWeight}
                      />
                    </div>
                  )
                })}
              </div>
            )}

            {question.type === 'SCALE' && (
              <ScaleEditor
                question={question}
                dimensions={mappedDimensions}
                onUpdateAnswer={handleUpdateAnswer}
                onUpdateWeight={handleUpdateWeight}
                onUpdateAnswers={(answers) =>
                  onUpdate({ ...question, answers })
                }
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

const AnswerWeightsEditor = ({
  label = 'Answer positions', answer, dimensions, onUpdateWeight,
}: {
  label?: string
  answer: Answer & { weights: AnswerWeight[] }
  dimensions: Dimension[]
  onUpdateWeight: (answerId: string, dimensionId: string, value: number) => void
}) => {
  if (!dimensions.length) return null
  return <fieldset className="answer-positions"><legend>{label}</legend>
    {dimensions.map(dimension => {
      const value = answer.weights.find(w => w.dimensionId === dimension.id)?.value ?? 50
      return <div className="answer-position" key={dimension.id}>
        <div className="answer-position-heading"><DimensionTag name={dimension.name} emoji={dimension.emoji} color={dimension.color} />
          <Input type="number" aria-label={`${answer.text}: ${dimension.name} position`} min={0} max={100} step={1} value={value} onChange={event => { const next = event.target.valueAsNumber; if (Number.isFinite(next)) onUpdateWeight(answer.id, dimension.id, Math.max(0, Math.min(100, next))) }} />
        </div>
        <Slider className="answer-position-slider" color={dimension.color ?? undefined} min={0} max={100} step={1} value={[value]} aria-label={`${answer.text}: ${dimension.name} scale`} aria-valuetext={`${Math.round(value)} out of 100; ${dimension.minLabel || 'Low'} to ${dimension.maxLabel || 'High'}`} onValueChange={values => onUpdateWeight(answer.id, dimension.id, values[0])} />
        <div className="answer-position-endpoints"><DimensionEndpointLabel label={dimension.minLabel || 'Low'} emoji={dimension.minEmoji} end="low" /><DimensionEndpointLabel label={dimension.maxLabel || 'High'} emoji={dimension.maxEmoji} end="high" /></div>
      </div>
    })}
  </fieldset>
}

interface ScaleEditorProps {
  question: Question & {
    answers: (Answer & {
      weights: AnswerWeight[]
    })[]
  }
  dimensions: Dimension[]
  onUpdateAnswer: (answerId: string, updates: Partial<Answer>) => void
  onUpdateWeight: (answerId: string, dimensionId: string, value: number) => void
  onUpdateAnswers: (answers: (Answer & { weights: AnswerWeight[] })[]) => void
}

const SCALE_PRESETS = [
  { name: '1-5', values: ['1', '2', '3', '4', '5'] },
  {
    name: '1-5 Stars ⭐',
    values: ['⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐'],
  },
  {
    name: 'Importance',
    values: [
      'Not important',
      'Slightly important',
      'Important',
      'Very important',
      'Critical',
    ],
  },
  {
    name: 'Agreement',
    values: [
      'Strongly disagree',
      'Disagree',
      'Neutral',
      'Agree',
      'Strongly agree',
    ],
  },
  {
    name: 'Frequency',
    values: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
  },
  {
    name: 'Quality',
    values: ['Poor', 'Fair', 'Good', 'Very good', 'Excellent'],
  },
  {
    name: 'Likelihood',
    values: ['Very unlikely', 'Unlikely', 'Neutral', 'Likely', 'Very likely'],
  },
  {
    name: 'Positivity',
    values: [
      'Very negative',
      'Negative',
      'Neutral',
      'Positive',
      'Very positive',
    ],
  },
  { name: 'Emojis 😀', values: ['😞', '😐', '😊', '😀', '😍'] },
  {
    name: '1-5 Hearts ❤️',
    values: ['❤️', '❤️❤️', '❤️❤️❤️', '❤️❤️❤️❤️', '❤️❤️❤️❤️❤️'],
  },
  { name: 'Naughtiness 😈', values: ['😈', '😏', '😑', '🙂', '😇'] },
  { name: 'Reactions 👍', values: ['🤬', '👎', '🤷', '👍', '🥳'] },
  { name: 'Sunshine 🌦️', values: ['🌧️', '🌦️', '🌤️', '☀️', '🌈'] },
  { name: 'Sassiness 😼', values: ['🙄', '🤨', '😐', '😉', '😜'] },
  { name: 'Cuteness 🐾', values: ['🐍', '🐢', '🐱', '🐶', '🦄'] },
  { name: 'Hotness 🥵', values: ['🥶', '🤢', '😊', '🤤', '🥵'] },
]

function ScaleEditor({
  question,
  dimensions,
  onUpdateAnswer,
  onUpdateWeight,
  onUpdateAnswers,
}: ScaleEditorProps) {
  const [showPresets, setShowPresets] = useState(false)
  const scalePointAnswers = question.answers.slice(2)

  const handleApplyPreset = (preset: (typeof SCALE_PRESETS)[0]) => {
    const endpointAnswers = question.answers.slice(0, 2)
    const newScalePointAnswers = preset.values.map((label, idx) => {
      const existingAnswer = question.answers[2 + idx]
      if (existingAnswer) {
        return { ...existingAnswer, text: label }
      }
      const newAnswerId = getTempId()
      return {
        id: newAnswerId,
        text: label,
        order: 2 + idx,
        emoji: null,
        color: null,
        style: null,
        icon: null,
        questionId: question.id,
        weights: dimensions.filter(m => question.answers.some(a => a.weights.some(w => w.dimensionId === m.id))).map((m) => ({
          id: getTempId(),
          dimensionId: m.id,
          value: 50,
          answerId: newAnswerId,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    })
    onUpdateAnswers([...endpointAnswers, ...newScalePointAnswers])
    setShowPresets(false)
  }

  const handleAddLabel = () => {
    const newAnswerId = getTempId()
    const newAnswer: Answer & { weights: AnswerWeight[] } = {
      id: newAnswerId,
      text: `${scalePointAnswers.length + 1}`,
      order: question.answers.length,
      emoji: null,
      color: null,
      style: null,
      icon: null,
      questionId: question.id,
      weights: dimensions.filter(m => question.answers.some(a => a.weights.some(w => w.dimensionId === m.id))).map((m) => ({
        id: getTempId(),
        dimensionId: m.id,
        value: 50,
        answerId: newAnswerId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    onUpdateAnswers([...question.answers, newAnswer])
  }

  const handleDeleteLabel = (idx: number) => {
    const updatedAnswers = question.answers.filter((_, i) => i !== 2 + idx)
    onUpdateAnswers(updatedAnswers)
  }

  const handleUpdateLabel = (idx: number, value: string) => {
    const scalePointAnswer = question.answers[2 + idx]
    if (scalePointAnswer) {
      onUpdateAnswer(scalePointAnswer.id, { text: value })
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-600">
          Endpoints
        </label>
        <div className="grid grid-cols-2 gap-3">
          {question.answers.slice(0, 2).map((answer, idx) => {
            const isMin = idx === 0
            const label = isMin ? 'Min' : 'Max'
            return (
              <div key={answer.id} className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-600 block">
                  {label}
                </label>
                <div className="flex items-center gap-2">
                  <EmojiPicker
                    value={answer.emoji || ''}
                    onSelect={(emoji) => onUpdateAnswer(answer.id, { emoji })}
                  />
                  <Input
                    value={answer.text}
                    onChange={(e) =>
                      onUpdateAnswer(answer.id, { text: e.target.value })
                    }
                    placeholder={`${label} label`}
                    className="flex-1"
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="space-y-2">
        <AnswerWeightsEditor
          label="Low endpoint positions"
          answer={question.answers[0]}
          dimensions={dimensions}
          onUpdateWeight={onUpdateWeight}
        />
      </div>

      <div className="space-y-2">
        <AnswerWeightsEditor
          label="High endpoint positions"
          answer={question.answers[1]}
          dimensions={dimensions}
          onUpdateWeight={onUpdateWeight}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-muted-600">
            Scale Point Labels
          </label>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPresets(!showPresets)}
          >
            Presets
          </Button>
        </div>

        {showPresets && (
          <div className="grid grid-cols-2 gap-2 p-2 bg-muted-50 rounded-lg border border-muted-200 mb-2">
            {SCALE_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handleApplyPreset(preset)}
                className="text-left px-2 py-1.5 rounded border border-muted-200 hover:bg-primary-50 hover:border-primary-300 text-xs font-medium transition-colors"
              >
                {preset.name}
              </button>
            ))}
          </div>
        )}

        <div className="space-y-1.5">
          {scalePointAnswers.map((answer, idx) => (
            <div key={answer.id} className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-600 w-6 text-center">
                {idx + 1}
              </span>
              <Input
                value={answer.text}
                onChange={(e) => handleUpdateLabel(idx, e.target.value)}
                placeholder={`Scale point ${idx + 1}`}
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteLabel(idx)}
                className="text-red-500 hover:text-red-700"
                disabled={scalePointAnswers.length <= 2}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddLabel}
            className="w-full mt-2 border-2 border-dashed border-muted-200 rounded-lg p-2 flex items-center justify-center text-muted-600 hover:border-primary-300 hover:text-primary-600 text-sm"
          >
            <Plus className="h-4 w-4 mr-1" /> Add scale point
          </button>
        </div>
      </div>
    </div>
  )
}
