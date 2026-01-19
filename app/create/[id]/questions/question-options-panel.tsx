import { Question, Answer, AnswerWeight, Metric } from '@prisma/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { EmojiPicker } from '@/components/ui/emoji-picker'
import { X, Plus, Trash2, CheckSquare, Sliders, BarChart3 } from 'lucide-react'
import { getTempId, cn } from '@/lib/utils'
import { getColorTheme } from '@/lib/colors'

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
    const newAnswer: Answer & { weights: AnswerWeight[] } = {
      id: getTempId(),
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
        answerId: getTempId(),
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

                  <div className="text-xs font-semibold text-muted-600 mb-1">Metric Weights</div>
                  <div className="space-y-1">
                    {metrics.map((metric) => {
                      const weight = answer.weights.find(w => w.metricId === metric.id)
                      return (
                        <div key={metric.id} className="flex items-center gap-2">
                          <div
                            className={cn(
                              "w-2 h-2 rounded-full",
                              getColorTheme(metric.color).bgClass
                            )}
                          />
                          <span className="text-xs flex-1 truncate">{metric.name}</span>
                          <input
                            type="number"
                            value={weight?.value || 0}
                            onChange={(e) => handleUpdateWeight(answer.id, metric.id, parseFloat(e.target.value) || 0)}
                            className="w-16 px-2 py-1 text-xs border border-muted-300 rounded"
                            step="1"
                            min="-100"
                            max="100"
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
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
