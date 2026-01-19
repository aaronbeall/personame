'use client'

import { QuizPage, Question, Answer, AnswerWeight } from '@prisma/client'
import { cn } from '@/lib/utils'
import { Trash2, GripVertical, CheckSquare, Sliders, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useConfirmDialog } from '@/components/ui/confirm-dialog'

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
        <div className="min-h-[500px] flex flex-col items-center justify-center text-center p-12 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl">
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
            <div className="px-8 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-medium">
              Start Quiz
            </div>
          </div>
        </div>
      </>
    )
  }

  if (isResults) {
    return (<>      <div className="min-h-[500px] flex flex-col items-center justify-center text-center p-12 bg-gradient-to-br from-secondary-50 to-primary-50 rounded-xl">
      <div className="text-6xl mb-4">👻</div>
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
      <div className="min-h-[500px] space-y-6">
        <div className="text-center mb-8">
          {page.emoji && <div className="text-4xl mb-2">{page.emoji}</div>}
          {page.title && (
            <h2 className="text-2xl font-bold text-primary-900 mb-2">
              {page.title}
            </h2>
          )}
          {page.description && (
            <p className="text-muted-600">
              {page.description}
            </p>
          )}
        </div>

        {page.questions.length === 0 ? (
          <div className="border-2 border-dashed border-muted-300 rounded-xl p-6 bg-white/60">
            <div className="text-muted-800 font-semibold mb-3">Add your first question</div>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => (onAddQuestionOfType ? onAddQuestionOfType('MULTIPLE_CHOICE') : onAddQuestion())}
                className="p-4 rounded-lg border-2 text-center transition-all border-muted-200 hover:border-primary-300 hover:bg-muted-50"
              >
                <CheckSquare className="h-6 w-6 mx-auto mb-1 text-muted-600" />
                <div className="text-xs font-medium">Multiple Choice</div>
              </button>
              <button
                onClick={() => (onAddQuestionOfType ? onAddQuestionOfType('SLIDER') : onAddQuestion())}
                className="p-4 rounded-lg border-2 text-center transition-all border-muted-200 hover:border-primary-300 hover:bg-muted-50"
              >
                <Sliders className="h-6 w-6 mx-auto mb-1 text-muted-600" />
                <div className="text-xs font-medium">Slider</div>
              </button>
              <button
                onClick={() => (onAddQuestionOfType ? onAddQuestionOfType('SCALE') : onAddQuestion())}
                className="p-4 rounded-lg border-2 text-center transition-all border-muted-200 hover:border-primary-300 hover:bg-muted-50"
              >
                <BarChart3 className="h-6 w-6 mx-auto mb-1 text-muted-600" />
                <div className="text-xs font-medium">Scale</div>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {page.questions.map((question, index) => (
              <div
                key={question.id}
                onClick={() => onSelectQuestion(question.id)}
                className={cn(
                  "p-6 rounded-xl border-2 cursor-pointer transition-all",
                  selectedQuestionId === question.id
                    ? "border-primary-500 bg-primary-50"
                    : "border-muted-200 bg-white hover:border-primary-300"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 text-muted-400">
                    <GripVertical className="h-5 w-5" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {question.emoji && <span className="text-xl flex-shrink-0">{question.emoji}</span>}
                        <span className="font-semibold text-muted-700 line-clamp-2">
                          {question.text}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteQuestion(question.id, question.text)
                        }}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0 ml-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <p className="text-sm mb-4 text-muted-600">
                      {question.type === 'MULTIPLE_CHOICE' && `${question.answers.length} options`}
                      {question.type === 'SLIDER' && 'Slider question'}
                      {question.type === 'SCALE' && '5-point scale'}
                    </p>

                    {question.type === 'MULTIPLE_CHOICE' && (
                      <div className="space-y-2">
                        {question.answers.map((answer) => (
                          <div
                            key={answer.id}
                            className="p-3 border border-muted-300 rounded-lg bg-white hover:bg-muted-50 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              {answer.emoji && <span>{answer.emoji}</span>}
                              <span className="text-sm">{answer.text}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {question.type === 'SLIDER' && (
                      <div className="py-4">
                        <input
                          type="range"
                          className="w-full"
                          disabled
                        />
                        <div className="flex justify-between text-xs text-muted-500 mt-2">
                          <span>Min</span>
                          <span>Max</span>
                        </div>
                      </div>
                    )}

                    {question.type === 'SCALE' && (
                      <div className="flex gap-2 justify-center">
                        {[1, 2, 3, 4, 5].map((num) => (
                          <div
                            key={num}
                            className="w-12 h-12 border-2 border-muted-300 rounded-lg flex items-center justify-center font-semibold text-muted-600"
                          >
                            {num}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
