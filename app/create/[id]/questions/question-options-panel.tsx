import { Question, Answer, AnswerWeight, Metric } from '@prisma/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { EmojiPicker } from '@/components/ui/emoji-picker'
import { Slider } from '@/components/ui/slider'
import { X, Plus, Trash2, CheckSquare, Sliders, BarChart3, ChevronDown } from 'lucide-react'
import { getTempId, cn } from '@/lib/utils'
import { getColorTheme } from '@/lib/colors'
import { useState } from 'react'

interface QuestionOptionsPanelProps {
  question: Question & {
    answers: (Answer & {
      weights: AnswerWeight[]
    })[]
  }
  metrics: Metric[]
  onUpdate: (question: Question & { answers: (Answer & { weights: AnswerWeight[] })[] }) => void
  onClose: () => void
}

const QUESTION_TYPES = [
  { value: 'MULTIPLE_CHOICE', label: 'Multiple Choice', Icon: CheckSquare },
  { value: 'SLIDER', label: 'Slider', Icon: Sliders },
  { value: 'SCALE', label: 'Scale', Icon: BarChart3 },
] as const

export function QuestionOptionsPanel({ question, metrics, onUpdate, onClose }: QuestionOptionsPanelProps) {
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
      weights: metrics.map(m => ({
        id: getTempId(),
        metricId: m.id,
        value: 0,
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
      answers: question.answers.filter(a => a.id !== answerId).map((a, idx) => ({ ...a, order: idx })),
    })
  }

  const handleUpdateAnswer = (answerId: string, updates: Partial<Answer>) => {
    onUpdate({
      ...question,
      answers: question.answers.map(a => a.id === answerId ? { ...a, ...updates } : a),
    })
  }

  const handleUpdateWeight = (answerId: string, metricId: string, value: number) => {
    onUpdate({
      ...question,
      answers: question.answers.map(a =>
        a.id === answerId
          ? {
            ...a,
            weights: a.weights.map(w =>
              w.metricId === metricId ? { ...w, value } : w
            ),
          }
          : a
      ),
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Question Settings</span>
          <Button
            variant="ghost"
            size="sm"
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
                onClick={() => onUpdate({ ...question, type: type.value })}
                className={cn(
                  "p-3 rounded-lg border-2 text-center transition-all",
                  question.type === type.value
                    ? "border-primary-500 bg-primary-50"
                    : "border-muted-200 hover:border-primary-300"
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
          onChange={(e) => onUpdate({ ...question, required: e.target.checked })}
        />

        {question.type === 'MULTIPLE_CHOICE' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-muted-700">
                Answer Options
              </label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddAnswer}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>
            </div>

            <div className="space-y-3">
              {question.answers.map((answer) => (
                <div key={answer.id} className="border border-muted-200 rounded-lg p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <EmojiPicker
                      value={answer.emoji || ''}
                      onSelect={(emoji) => handleUpdateAnswer(answer.id, { emoji })}
                    />
                    <Input
                      value={answer.text}
                      onChange={(e) => handleUpdateAnswer(answer.id, { text: e.target.value })}
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
                    metrics={metrics}
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
          <div className="p-3 bg-muted-50 rounded-lg border border-muted-200">
            <p className="text-xs text-muted-600">
              {question.type === 'SLIDER' && 'Slider questions allow users to select a value on a continuous scale.'}
              {question.type === 'SCALE' && 'Scale questions let users rate from 1 to 5.'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}


const AnswerWeightsEditor = ({
  answer,
  metrics,
  onUpdateWeight,
}: {
  answer: Answer & { weights: AnswerWeight[] }
  metrics: Metric[]
  onUpdateWeight: (answerId: string, metricId: string, value: number) => void
}) => {
  const [expanded, setExpanded] = useState(true)

  return (
    <fieldset className="rounded-lg border border-muted-200 bg-white/70 shadow-sm">
      <legend className="px-2 text-[11px] font-semibold uppercase tracking-wide text-muted-600">
        <button className='hover:text-primary-600' onClick={() => setExpanded(prev => !prev)}><ChevronDown className={cn("inline-block mr-1 h-4 w-4 transition-transform", expanded ? "rotate-0" : "-rotate-90")} /> Metric Weights</button>
      </legend>
      {expanded ? (
        <div className="divide-y divide-muted-100">
          {metrics.map((metric) => {
            const weight = answer.weights.find(w => w.metricId === metric.id)
            const weightValue = weight?.value ?? 0
            return (
              <div
                key={metric.id}
                className={cn(
                  "flex items-center gap-2 px-2 py-2",
                  weightValue === 0 ? "opacity-60" : ""
                )}
              >
                <div
                  className={cn(
                    "w-2 h-2 rounded-full",
                    getColorTheme(metric.color).bgClass
                  )}
                />
                <span className="text-xs w-28 truncate">{metric.name}</span>
                <Slider
                  color={metric.color ?? undefined}
                  center={0}
                  min={-100}
                  max={100}
                  step={1}
                  value={[weightValue]}
                  onValueChange={(vals) => onUpdateWeight(answer.id, metric.id, (vals?.[0] ?? 0))}
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={weightValue}
                  onChange={(e) => onUpdateWeight(answer.id, metric.id, parseFloat(e.target.value) || 0)}
                  min={-100}
                  max={100}
                  step={1}
                  className="w-16 h-8 px-1.5 py-1 text-xs"
                />
              </div>
            )
          })}
        </div>
      ) : (
        <div className="px-2 py-2 flex flex-wrap gap-2">
          {(() => {
            const nonZeroWeights = answer.weights.filter(w => w.value !== 0)
            const maxAbsValue = Math.max(...nonZeroWeights.map(w => Math.abs(w.value)), 1)
            return nonZeroWeights.map(w => {
              const metric = metrics.find(m => m.id === w.metricId)
              if (!metric) return null
              const { bgClass, bgLightClass, hex } = getColorTheme(metric.color)
              const scale = Math.max(0.85, Math.abs(w.value) / maxAbsValue) // Min scale 0.85
              return (
                <div key={w.metricId} className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-transform origin-left",
                  bgLightClass
                )} style={{ color: hex, transform: `scale(${scale})` }}>
                  <div
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      bgClass
                    )}
                  />
                  <span className="whitespace-nowrap">{metric.name} {w.value >= 0 ? '+' : ''}{w.value}</span>
                </div>
              )
            })
          })()}
          {answer.weights.every(w => w.value === 0) && (
            <span className="text-xs text-muted-400 italic">No weights set</span>
          )}
        </div>
      )}
    </fieldset>
  )
}