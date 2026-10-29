'use client'
import { LoadingState } from '@/components/ui/loading'

import { confirmLeave } from '@/hooks/use-unsaved-changes'
import { useBuilderDraft } from '@/hooks/use-builder-draft'
import { useState, useMemo, use } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useProtectedPage } from '@/hooks/use-protected-page'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  ArrowRight,
  ArrowLeft,
  Plus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { ErrorBanner } from '@/components/ui/error-banner'
import { AppLayoutBackground } from '@/components/app-layout-background'
import { BuilderFooter } from '@/components/builder-footer'
import { StepProgress } from '@/components/step-progress'
import { getTempId } from '@/lib/utils'
import {
  QuizPage,
  Question,
  Answer,
  AnswerWeight,
  Dimension,
  Archetype,
} from '@prisma/client'
import { PageNavigator } from './page-navigator'
import { PagePreview } from './page-preview'
import { PageOptionsPanel } from './page-options-panel'
import { QuestionOptionsPanel } from './question-options-panel'
import { DimensionsArchetypesSummary } from './dimensions-archetypes-summary'
import { createDefaultAnswers } from './question-defaults'
import { withQuizBookends } from '@/lib/quiz-page-defaults'

type QuizPageWithQuestions = QuizPage & {
  questions: (Question & {
    answers: (Answer & {
      weights: AnswerWeight[]
    })[]
  })[]
}

export default function QuestionsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const queryClient = useQueryClient()
  useProtectedPage()
  const { id } = use(params)

  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    null,
  )

  // Fetch dimensions
  const dimensionsQuery = useQuery({
    queryKey: ['dimensions', id],
    queryFn: async () => {
      const res = await fetch(`/api/personames/${id}/dimensions`)
      if (!res.ok) throw new Error('Failed to fetch dimensions')
      return res.json() as Promise<Dimension[]>
    },
  })

  // Fetch archetypes
  const archetypesQuery = useQuery({
    queryKey: ['archetypes', id],
    queryFn: async () => {
      const res = await fetch(`/api/personames/${id}/archetypes`)
      if (!res.ok) throw new Error('Failed to fetch archetypes')
      return res.json() as Promise<Archetype[]>
    },
  })

  // Fetch quiz pages
  const pagesQuery = useQuery({
    queryKey: ['questions', id],
    queryFn: async () => {
      const res = await fetch(`/api/personames/${id}/questions`)
      if (!res.ok) throw new Error('Failed to fetch quiz pages')
      return res.json() as Promise<QuizPageWithQuestions[]>
    },
  })

  // Existing quizzes can have question pages but still lack one of the bookends.
  const sourcePages = useMemo(() => {
    if (!pagesQuery.data) return undefined
    return withQuizBookends(pagesQuery.data, style => ({
      id: getTempId(),
      title: style === 'cover' ? 'Welcome' : 'Your Results',
      description: style === 'cover' ? 'Start your quiz journey' : 'Discover your personality type',
      order: 0,
      hidden: false,
      emoji: null,
      color: null,
      style,
      icon: null,
      personaId: id,
      questions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }))
  }, [pagesQuery.data, id])

  const draft = useBuilderDraft(sourcePages, id)
  const pages = draft.value ?? []
  const setPages = draft.update
  const dirty = draft.dirty

  const savePagesMutation = useMutation({
    mutationFn: async (pagesToSave: QuizPageWithQuestions[]) => {
      const res = await fetch(`/api/personames/${id}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pages: pagesToSave }),
      })

      if (!res.ok) {
        throw new Error((await res.json()).error ?? 'Failed to save quiz pages')
      }

      return res.json()
    },
    onSuccess: (data) => {
      draft.accept(data)
      queryClient.setQueryData(['questions', id], data)
      queryClient.invalidateQueries({ queryKey: ['review', id] })
      queryClient.invalidateQueries({ queryKey: ['progress', id] })
      queryClient.invalidateQueries({ queryKey: ['personal'] })
      queryClient.invalidateQueries({ queryKey: ['discover'] })
      router.push(`/create/${id}/preview`)
    },
  })

  const handleAddPage = () => {
    const newPage: QuizPageWithQuestions = {
      id: getTempId(),
      title: 'New Page',
      description: null,
      order: pages.length - 1, // Insert before results page
      hidden: false,
      emoji: null,
      color: null,
      style: null,
      icon: null,
      personaId: id,
      questions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Insert before the last page (results)
    const updatedPages = [
      ...pages.slice(0, -1),
      newPage,
      pages[pages.length - 1],
    ].map((p, idx) => ({ ...p, order: idx }))

    setPages(updatedPages)
    setCurrentPageIndex(updatedPages.length - 2) // Select the new page
  }

  const handleUpdatePage = (updatedPage: QuizPageWithQuestions) => {
    setPages(pages.map((p) => (p.id === updatedPage.id ? updatedPage : p)))
  }

  const handleDeletePage = (pageId: string) => {
    const pageIndex = pages.findIndex((p) => p.id === pageId)
    const updatedPages = pages
      .filter((p) => p.id !== pageId)
      .map((p, idx) => ({ ...p, order: idx }))
    setPages(updatedPages)

    // Adjust current page index
    if (currentPageIndex >= updatedPages.length) {
      setCurrentPageIndex(Math.max(0, updatedPages.length - 1))
    } else if (currentPageIndex >= pageIndex) {
      setCurrentPageIndex(Math.max(0, currentPageIndex - 1))
    }
  }

  const handleAddQuestion = () => {
    if (currentPageIndex < 0 || currentPageIndex >= pages.length) return

    const currentPage = pages[currentPageIndex]
    if (currentPage.style === 'cover' || currentPage.style === 'results') return

    const newQuestion: Question & {
      answers: (Answer & { weights: AnswerWeight[] })[]
    } = {
      id: getTempId(),
      text: 'New question',
      type: 'MULTIPLE_CHOICE',
      order: currentPage.questions.length,
      required: true,
      dimensionInfluences: {},
      emoji: null,
      color: null,
      style: null,
      icon: null,
      pageId: currentPage.id,
      answers: createDefaultAnswers(
        'MULTIPLE_CHOICE',
        dimensionsQuery.data || [],
      ),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Update answer questionIds
    newQuestion.answers = newQuestion.answers.map((a) => ({
      ...a,
      questionId: newQuestion.id,
    }))

    const updatedPage = {
      ...currentPage,
      questions: [...currentPage.questions, newQuestion],
    }

    handleUpdatePage(updatedPage)
    setSelectedQuestionId(newQuestion.id)
  }

  const handleAddQuestionOfType = (
    type: 'MULTIPLE_CHOICE' | 'SLIDER' | 'SCALE',
  ) => {
    if (currentPageIndex < 0 || currentPageIndex >= pages.length) return

    const currentPage = pages[currentPageIndex]
    if (currentPage.style === 'cover' || currentPage.style === 'results') return

    if (type === 'MULTIPLE_CHOICE') {
      return handleAddQuestion()
    }

    const answers = createDefaultAnswers(type, dimensionsQuery.data || [])

    const newQuestion: Question & {
      answers: (Answer & { weights: AnswerWeight[] })[]
    } = {
      id: getTempId(),
      text: type === 'SLIDER' ? 'New slider question' : 'New scale question',
      type,
      order: currentPage.questions.length,
      required: true,
      dimensionInfluences: {},
      emoji: null,
      color: null,
      style: null,
      icon: null,
      pageId: currentPage.id,
      answers,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Update answer questionIds now that we have the question id
    newQuestion.answers = newQuestion.answers.map((a) => ({
      ...a,
      questionId: newQuestion.id,
    }))

    const updatedPage = {
      ...currentPage,
      questions: [...currentPage.questions, newQuestion],
    }

    handleUpdatePage(updatedPage)
    setSelectedQuestionId(newQuestion.id)
  }

  const handleUpdateQuestion = (
    updatedQuestion: Question & {
      answers: (Answer & { weights: AnswerWeight[] })[]
    },
  ) => {
    const currentPage = pages[currentPageIndex]
    const updatedPage = {
      ...currentPage,
      questions: currentPage.questions.map((q) =>
        q.id === updatedQuestion.id ? updatedQuestion : q,
      ),
    }
    handleUpdatePage(updatedPage)
  }

  const handleDeleteQuestion = (questionId: string) => {
    const currentPage = pages[currentPageIndex]
    const updatedPage = {
      ...currentPage,
      questions: currentPage.questions
        .filter((q) => q.id !== questionId)
        .map((q, idx) => ({ ...q, order: idx })),
    }
    handleUpdatePage(updatedPage)
    if (selectedQuestionId === questionId) {
      setSelectedQuestionId(null)
    }
  }

  const handleSave = () => {
    if (pages.length < 2) return
    savePagesMutation.mutate(pages)
  }

  const currentPage = pages[currentPageIndex]
  const selectedQuestion = currentPage?.questions.find(
    (q) => q.id === selectedQuestionId,
  )
  const canAddQuestion =
    currentPage?.style !== 'cover' && currentPage?.style !== 'results'

  if (
    (!draft.ready || dimensionsQuery.isPending || archetypesQuery.isPending) &&
    !pagesQuery.error &&
    !dimensionsQuery.error &&
    !archetypesQuery.error
  )
    return (
      <AppLayoutBackground>
        <div className="max-w-4xl mx-auto">
          <LoadingState label="Loading your questions…" />
        </div>
      </AppLayoutBackground>
    )

  return (
    <AppLayoutBackground>
      <div className="max-w-7xl mx-auto">
        <StepProgress
          title="Build your quiz"
          description="Bring your idea to life with questions. Choose a page, then add and fine-tune its questions."
        />

        <ErrorBanner
          error={
            savePagesMutation.error ||
            pagesQuery.error ||
            dimensionsQuery.error ||
            archetypesQuery.error
          }
        />

        {/* Summary of dimensions and archetypes */}
        <DimensionsArchetypesSummary
          dimensions={dimensionsQuery.data || []}
          archetypes={archetypesQuery.data || []}
        />

        <div className="question-editor-grid grid grid-cols-1 xl:grid-cols-12 gap-5 mb-6">
          {/* Page Navigator - Left sidebar */}
          <div className="xl:col-span-2">
            <PageNavigator
              pages={pages}
              currentPageIndex={currentPageIndex}
              onSelectPage={setCurrentPageIndex}
              onAddPage={handleAddPage}
            />
          </div>

          {/* Page Preview - Center */}
          <div className="xl:col-span-6">
            <Card className="question-preview-panel p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPageIndex(Math.max(0, currentPageIndex - 1))
                    }
                    disabled={currentPageIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-600">
                    Page {currentPageIndex + 1} of {pages.length}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPageIndex(
                        Math.min(pages.length - 1, currentPageIndex + 1),
                      )
                    }
                    disabled={currentPageIndex === pages.length - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {canAddQuestion && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddQuestion}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Question
                  </Button>
                )}
              </div>

              {/* Progress bar */}
              <div className="mb-6">
                <div className="h-2 bg-muted-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-secondary transition-all"
                    style={{
                      width: `${((currentPageIndex + 1) / pages.length) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {currentPage && (
                <PagePreview
                  page={currentPage}
                  selectedQuestionId={selectedQuestionId}
                  onSelectQuestion={setSelectedQuestionId}
                  onUpdateQuestion={handleUpdateQuestion}
                  onDeleteQuestion={handleDeleteQuestion}
                  onAddQuestion={handleAddQuestion}
                  onAddQuestionOfType={handleAddQuestionOfType}
                />
              )}
            </Card>
          </div>

          {/* Options Panel - Right sidebar */}
          <div className="question-inspector xl:col-span-4">
            {selectedQuestion ? (
              <QuestionOptionsPanel
                question={selectedQuestion}
                dimensions={dimensionsQuery.data || []}
                onUpdate={handleUpdateQuestion}
                onClose={() => setSelectedQuestionId(null)}
              />
            ) : (
              currentPage && (
                <PageOptionsPanel
                  page={currentPage}
                  onUpdate={(updated) =>
                    handleUpdatePage({ ...currentPage, ...updated })
                  }
                  onDelete={
                    currentPageIndex > 0 && currentPageIndex < pages.length - 1
                      ? () => handleDeletePage(currentPage.id)
                      : undefined
                  }
                />
              )
            )}
          </div>
        </div>

        <BuilderFooter
          note={
            pages.length < 2
              ? 'Add at least two pages to continue.'
              : 'Save your questions, then try the complete quiz before publishing.'
          }
          back={
            <Button
              variant="outline"
              onClick={() =>
                confirmLeave(dirty, () =>
                  router.push(`/create/${id}/archetypes`),
                )
              }
            >
              <ArrowLeft size={16} /> Back
            </Button>
          }
        >
          <Button
            onClick={handleSave}
            loading={savePagesMutation.isPending}
            disabled={pages.length < 2 || savePagesMutation.isPending}
            className="builder-primary-action"
          >
            {savePagesMutation.isPending ? 'Saving...' : 'Continue to Review'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </BuilderFooter>
      </div>
    </AppLayoutBackground>
  )
}
