'use client'

import { QuizPage, Question, Answer, AnswerWeight } from '@prisma/client'
import { cn } from '@/lib/utils'
import { Trash2, GripVertical, CheckSquare, Sliders, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useConfirmDialog } from '@/components/ui/confirm-dialog'
import { useState } from 'react'

interface PagePreviewProps {
  page: QuizPage & {
    questions: (Question & {
      answers: (Answer & {
        weights: AnswerWeight[]
      })[]
    })[]
  }
  selectedQuestionId: string | null
  onSelectQuestion: (id: string) => void
  onUpdateQuestion: (question: Question & { answers: (Answer & { weights: AnswerWeight[] })[] }) => void
  onDeleteQuestion: (id: string) => void
  onAddQuestion: () => void
  onAddQuestionOfType?: (type: 'MULTIPLE_CHOICE' | 'SLIDER' | 'SCALE') => void
}

export function PagePreview({
  page,
  selectedQuestionId,
  onSelectQuestion,
  onDeleteQuestion,
  onAddQuestion,
  onAddQuestionOfType,
}: PagePreviewProps) {
  const isCover = page.style === 'cover'
  const isResults = page.style === 'results'
  const { confirm, dialog } = useConfirmDialog()

  // Local preview state - not stored in model
  const [previewAnswers, setPreviewAnswers] = useState<Record<string, string | number>>({})

  const handleDeleteQuestion = (questionId: string, questionText: string) => {
    confirm({
      title: 'Delete Question?',
      description: `Are you sure you want to delete "${questionText}"? This action cannot be undone.`,
      confirmLabel: 'Delete Question',
      onConfirm: () => onDeleteQuestion(questionId),
    })
  }

  if (isCover) {
    return (
      <>
        {dialog}
        <div className="min-h-125 flex flex-col items-center justify-center text-center p-12 bg-linear-to-br from-primary-50 to-secondary-50 rounded-xl border-2 border-primary-200">
          {page.emoji && <div className="text-6xl mb-4">{page.emoji}</div>}
          <h1 className="text-4xl font-bold mb-4 text-primary-900">
            {page.title || 'Welcome'}
          </h1>
          {page.description && (
            <p className="text-lg text-muted-600 max-w-md">
              {page.description}
            </p>
          )}
          <div className="mt-8">
            <div className="px-8 py-3 bg-linear-to-r from-primary to-secondary text-white rounded-lg font-medium">
              Start Quiz
            </div>
          </div>
        </div>
      </>

    )
  }

  if (isResults) {
    return (
      <>
        {dialog}
        <div className="min-h-125 flex flex-col items-center justify-center text-center p-12 bg-linear-to-br from-secondary-50 to-primary-50 rounded-xl border-2 border-secondary-200">
          <div className="text-6xl mb-4">🎭</div>
          <h1 className="text-4xl font-bold mb-4 text-primary-900">
            {page.title || 'Your Results'}
          </h1>
          {page.description && (
            <p className="text-lg text-muted-600 max-w-md mb-6">
              {page.description}
            </p>
          )}
          <div className="w-full max-w-md space-y-4">
            <div className="p-6 bg-white rounded-xl border-2 border-primary-200">
              <div className="text-3xl mb-2">🎭</div>
              <div className="font-bold text-xl mb-1">Your Archetype</div>
              <div className="text-sm text-muted-600">Based on your responses</div>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {dialog}
      <div className="min-h-150 bg-white rounded-xl border-2 border-muted-200 p-8 flex flex-col">
        {/* Page Header */}
        <div className="text-center mb-12">
          {page.emoji && <div className="text-5xl mb-3">{page.emoji}</div>}
          {page.title && (
            <h2 className="text-3xl font-bold text-primary-900 mb-2">
              {page.title}
            </h2>
          )}
          {page.description && (
            <p className="text-muted-600 max-w-2xl mx-auto">
              {page.description}
            </p>
          )}
        </div>

        {/* Questions Section */}
        {page.questions.length === 0 ? (
          <div className="flex-1 border-2 border-dashed border-muted-300 rounded-xl p-8 bg-muted-50 flex flex-col items-center justify-center">
            <div className="text-muted-600 font-semibold mb-4">Add your first question</div>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => (onAddQuestionOfType ? onAddQuestionOfType('MULTIPLE_CHOICE') : onAddQuestion())}
                className="p-3 rounded-lg border-2 text-center transition-all border-muted-200 hover:border-primary-300 hover:bg-white"
              >
                <CheckSquare className="h-5 w-5 mx-auto mb-1 text-muted-600" />
                <div className="text-xs font-medium">Multiple Choice</div>
              </button>
              <button
                onClick={() => (onAddQuestionOfType ? onAddQuestionOfType('SLIDER') : onAddQuestion())}
                className="p-3 rounded-lg border-2 text-center transition-all border-muted-200 hover:border-primary-300 hover:bg-white"
              >
                <Sliders className="h-5 w-5 mx-auto mb-1 text-muted-600" />
                <div className="text-xs font-medium">Slider</div>
              </button>
              <button
                onClick={() => (onAddQuestionOfType ? onAddQuestionOfType('SCALE') : onAddQuestion())}
                className="p-3 rounded-lg border-2 text-center transition-all border-muted-200 hover:border-primary-300 hover:bg-white"
              >
                <BarChart3 className="h-5 w-5 mx-auto mb-1 text-muted-600" />
                <div className="text-xs font-medium">Scale</div>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8 flex-1">
            {page.questions.map((question) => {
              const isSelected = selectedQuestionId === question.id
              
              return (
                <div
                  key={question.id}
                  onClick={() => onSelectQuestion(question.id)}
                  className={cn(
                    "p-6 rounded-xl border-2 cursor-pointer transition-all",
                    isSelected
                      ? "border-primary-500 bg-primary-50 ring-2 ring-primary-200"
                      : "border-muted-200 bg-muted-50 hover:border-muted-300"
                  )}
                >
                  {/* Question Header */}
                  <div className="flex items-start justify-between mb-4 pb-4 border-b border-muted-200">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="shrink-0 text-muted-400 pt-1">
                        <GripVertical className="h-4 w-4" />
                      </div>
                      <div className="flex items-center gap-2 min-w-0">
                        {question.emoji && <span className="text-2xl shrink-0">{question.emoji}</span>}
                        <h3 className="font-semibold text-primary-900 line-clamp-2">
                          {question.text || '(Untitled question)'}
                        </h3>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteQuestion(question.id, question.text)
                      }}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0 ml-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Multiple Choice Preview */}
                  {question.type === 'MULTIPLE_CHOICE' && (
                    <div className="space-y-3">
                      {question.answers.map((answer) => {
                        const isAnswerSelected = previewAnswers[question.id] === answer.id
                        return (
                          <button
                            key={answer.id}
                            onClick={(e) => {
                              e.stopPropagation()
                              setPreviewAnswers(prev => ({
                                ...prev,
                                [question.id]: answer.id,
                              }))
                            }}
                            className={cn(
                              "w-full p-4 rounded-lg border-2 text-left transition-all flex items-center gap-3",
                              isAnswerSelected
                                ? "border-primary-500 bg-primary-50"
                                : "border-muted-300 bg-white hover:border-muted-400 hover:bg-muted-50"
                            )}
                          >
                            <div
                              className={cn(
                                "w-5 h-5 rounded-full border-2 shrink-0",
                                isAnswerSelected
                                  ? "border-primary-500 bg-primary-500"
                                  : "border-muted-400"
                              )}
                            >
                              {isAnswerSelected && <div className="w-full h-full rounded-full bg-white opacity-0" />}
                            </div>
                            {answer.emoji && <span className="text-lg">{answer.emoji}</span>}
                            <span className="font-medium text-muted-900">{answer.text}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {/* Slider Preview */}
                  {question.type === 'SLIDER' && (
                    <div className="py-4">
                      <div className="flex justify-between items-center gap-3 mb-6">
                        <div className="text-center">
                          {question.answers[0]?.emoji && <div className="text-2xl mb-1">{question.answers[0].emoji}</div>}
                          <div className="text-sm font-medium text-muted-700">{question.answers[0]?.text || 'Min'}</div>
                        </div>
                        <div className="flex-1">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={previewAnswers[question.id] ?? 50}
                            onChange={(e) => {
                              e.stopPropagation()
                              setPreviewAnswers(prev => ({
                                ...prev,
                                [question.id]: parseInt(e.target.value),
                              }))
                            }}
                            className="w-full h-2 bg-muted-300 rounded-lg appearance-none cursor-pointer accent-primary-500"
                          />
                        </div>
                        <div className="text-center">
                          {question.answers[1]?.emoji && <div className="text-2xl mb-1">{question.answers[1].emoji}</div>}
                          <div className="text-sm font-medium text-muted-700">{question.answers[1]?.text || 'Max'}</div>
                        </div>
                      </div>
                      <div className="text-center">
                        <span className="text-lg font-bold text-primary-600">{previewAnswers[question.id] ?? 50}</span>
                      </div>
                    </div>
                  )}

                  {/* Scale Preview */}
                  {question.type === 'SCALE' && (
                    <div className="py-4">
                      {/* Min/Max Labels */}
                      <div className="flex justify-between items-center gap-3 mb-6">
                        <div className="text-center flex-1">
                          {question.answers[0]?.emoji && <div className="text-2xl mb-1">{question.answers[0].emoji}</div>}
                          <div className="text-xs font-medium text-muted-600">{question.answers[0]?.text || 'Low'}</div>
                        </div>
                        <div className="grow" />
                        <div className="text-center flex-1">
                          {question.answers[1]?.emoji && <div className="text-2xl mb-1">{question.answers[1].emoji}</div>}
                          <div className="text-xs font-medium text-muted-600">{question.answers[1]?.text || 'High'}</div>
                        </div>
                      </div>

                      {/* Scale Points */}
                      <div className="flex gap-3 justify-center">
                        {question.answers.slice(2).map((answer, scaleIdx) => {
                          const isScaleSelected = previewAnswers[question.id] === scaleIdx
                          return (
                            <button
                              key={answer.id}
                              onClick={(e) => {
                                e.stopPropagation()
                                setPreviewAnswers(prev => ({
                                  ...prev,
                                  [question.id]: scaleIdx,
                                }))
                              }}
                              className={cn(
                                "flex-1 aspect-square rounded-lg border-2 font-semibold transition-all flex flex-col items-center justify-center gap-1",
                                isScaleSelected
                                  ? "border-primary-500 bg-primary-100 text-primary-900"
                                  : "border-muted-300 bg-white hover:border-muted-400 hover:bg-muted-50 text-muted-700"
                              )}
                            >
                              {answer.emoji && <span className="text-xl">{answer.emoji}</span>}
                              <span className="text-sm">{answer.text}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Progress Indicator */}
        {page.questions.length > 0 && (
          <div className="mt-8 pt-6 border-t border-muted-200">
            <div className="flex justify-between items-center text-sm text-muted-600">
              <span>Question {page.questions.findIndex(q => q.id === selectedQuestionId) + 1} of {page.questions.length}</span>
              <div className="flex gap-1">
                {page.questions.map((q) => (
                  <div
                    key={q.id}
                    className={cn(
                      "h-2 rounded-full flex-1",
                      selectedQuestionId === q.id ? "bg-primary-500" : "bg-muted-200"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
