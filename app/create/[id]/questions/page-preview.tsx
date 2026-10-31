'use client'
import { QuizCover } from '@/components/quiz-cover'
import { ResultHero } from '@/components/result-hero'
import { pagePresentation } from '@/lib/quiz-presentation'
import type { Archetype } from '@prisma/client'


import { QuizPage, Question, Answer, AnswerWeight } from '@prisma/client'
import { cn } from '@/lib/utils'
import {
  Trash2,
  CheckSquare,
  Sliders,
  BarChart3,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useConfirmDialog } from '@/components/ui/confirm-dialog'
import { useState } from 'react'
import { QuestionInput } from '@/components/question-input'
import type { QuizResponses } from '@/lib/quiz-scoring'

interface PagePreviewProps {
  questionCount?: number
  sampleArchetype?: Archetype
  page: QuizPage & {
    questions: (Question & {
      answers: (Answer & {
        weights: AnswerWeight[]
      })[]
    })[]
  }
  selectedQuestionId: string | null
  onSelectQuestion: (id: string) => void
  onUpdateQuestion: (
    question: Question & { answers: (Answer & { weights: AnswerWeight[] })[] },
  ) => void
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
  questionCount = 0, sampleArchetype,
}: PagePreviewProps) {
  const isCover = page.style === 'cover'
  const isResults = page.style === 'results'
  const { confirm, dialog } = useConfirmDialog()

  // Local preview state - not stored in model
  const [previewAnswers, setPreviewAnswers] = useState<QuizResponses>({})

  const handleDeleteQuestion = (questionId: string, questionText: string) => {
    confirm({
      title: 'Delete Question?',
      description: `Are you sure you want to delete "${questionText}"? This action cannot be undone.`,
      confirmLabel: 'Delete Question',
      onConfirm: () => onDeleteQuestion(questionId),
    })
  }

  if (isCover) return <QuizCover title={page.title || 'Welcome'} description={page.description} emoji={page.emoji} color={page.color} presentation={page.presentation} questionCount={questionCount} action={<span className="quiz-themed-button">{pagePresentation(page.presentation).startLabel} →</span>} />
  if (isResults) return <div className="studio-result-preview"><h2>{page.title || 'Your Results'}</h2><ResultHero title={page.title} name={sampleArchetype?.name || 'Your Archetype'} description={page.description} emoji={sampleArchetype?.emoji} color={page.color || sampleArchetype?.color} presentation={page.presentation} preview /><p className="studio-setting-note">The matched archetype’s artwork and description appear here. Participant comparisons use real results once enough people complete the quiz.</p></div>

  return (
    <>
      {dialog}
      <div className="question-canvas flex flex-col">
        {/* Page Header */}
        <div className="text-center mb-6">
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
            <div className="text-muted-600 font-semibold mb-4">
              Add your first question
            </div>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() =>
                  onAddQuestionOfType
                    ? onAddQuestionOfType('MULTIPLE_CHOICE')
                    : onAddQuestion()
                }
                className="p-3 rounded-lg border-2 text-center transition-all border-muted-200 hover:border-primary-300 hover:bg-white"
              >
                <CheckSquare className="h-5 w-5 mx-auto mb-1 text-muted-600" />
                <div className="text-xs font-medium">Multiple Choice</div>
              </button>
              <button
                onClick={() =>
                  onAddQuestionOfType
                    ? onAddQuestionOfType('SLIDER')
                    : onAddQuestion()
                }
                className="p-3 rounded-lg border-2 text-center transition-all border-muted-200 hover:border-primary-300 hover:bg-white"
              >
                <Sliders className="h-5 w-5 mx-auto mb-1 text-muted-600" />
                <div className="text-xs font-medium">Slider</div>
              </button>
              <button
                onClick={() =>
                  onAddQuestionOfType
                    ? onAddQuestionOfType('SCALE')
                    : onAddQuestion()
                }
                className="p-3 rounded-lg border-2 text-center transition-all border-muted-200 hover:border-primary-300 hover:bg-white"
              >
                <BarChart3 className="h-5 w-5 mx-auto mb-1 text-muted-600" />
                <div className="text-xs font-medium">Scale</div>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5 flex-1">
            {page.questions.map((question) => {
              const isSelected = selectedQuestionId === question.id

              return (
                <div
                  key={question.id}
                  data-selected={isSelected}
                  onClick={() => onSelectQuestion(question.id)}
                  className={cn(
                    'question-preview-question p-5 rounded-xl border cursor-pointer transition-colors',
                    isSelected
                      ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                      : 'border-muted-200 bg-muted-50 hover:border-muted-300',
                  )}
                >
                  {/* Question Header */}
                  <div className="flex items-start justify-between mb-4 pb-4 border-b border-muted-200">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="shrink-0 text-muted-400 pt-1">
                        <span className="text-xs">{question.order + 1}</span>
                      </div>
                      <div className="flex items-center gap-2 min-w-0">
                        {question.emoji && (
                          <span className="text-2xl shrink-0">
                            {question.emoji}
                          </span>
                        )}
                        <h3 className="font-semibold text-primary-900 line-clamp-2">
                          <button type="button" className="text-left" onClick={() => onSelectQuestion(question.id)} title="Edit question">{question.text || '(Untitled question)'}</button>
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
                      aria-label={`Delete question: ${question.text}`}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0 ml-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div onClick={(e) => e.stopPropagation()}>
                    <QuestionInput
                      question={question}
                      value={previewAnswers[question.id]}
                      onChange={(value) =>
                        setPreviewAnswers((previous) => ({
                          ...previous,
                          [question.id]: value,
                        }))
                      }
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Progress Indicator */}
        {page.questions.length > 0 && (
          <div className="mt-8 pt-6 border-t border-muted-200">
            <div className="flex justify-between items-center text-sm text-muted-600">
              <span>
                {selectedQuestionId
                  ? `Editing question ${page.questions.findIndex((q) => q.id === selectedQuestionId) + 1} of ${page.questions.length}`
                  : `${page.questions.length} questions on this page`}
              </span>
              <div className="flex gap-1">
                {page.questions.map((q) => (
                  <div
                    key={q.id}
                    className={cn(
                      'h-2 rounded-full flex-1',
                      selectedQuestionId === q.id
                        ? 'bg-primary-500'
                        : 'bg-muted-200',
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
