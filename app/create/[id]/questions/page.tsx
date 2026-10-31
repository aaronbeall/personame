'use client'
import { LoadingState } from '@/components/ui/loading'

import { confirmLeave } from '@/hooks/use-unsaved-changes'
import { useBuilderDraft } from '@/hooks/use-builder-draft'
import { useState, useMemo, use } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useProtectedPage } from '@/hooks/use-protected-page'
import { Button } from '@/components/ui/button'
import { StudioPreview } from '@/components/studio-preview'
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

  const [mobilePanel, setMobilePanel] = useState('canvas')
  const [canvasSize, setCanvasSize] = useState('desktop')
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
      presentation: {},
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
    mutationFn: async ({ pages: pagesToSave }: {pages: QuizPageWithQuestions[]; advance: boolean}) => {
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
    onSuccess: (data, variables) => {
      draft.accept(data)
      queryClient.setQueryData(['questions', id], data)
      queryClient.invalidateQueries({ queryKey: ['review', id] })
      queryClient.invalidateQueries({ queryKey: ['progress', id] })
      queryClient.invalidateQueries({ queryKey: ['personal'] })
      queryClient.invalidateQueries({ queryKey: ['discover'] })
      if (variables.advance) router.push(`/create/${id}/preview`)
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
      presentation: {},
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
    savePagesMutation.mutate({pages, advance: true})
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
    <AppLayoutBackground className="quiz-studio">
      <div className="studio-shell">
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

        <header className="studio-toolbar"><div><span className="quiz-kicker">YOUR CREATIVE WORKSPACE</span><p role="status">{savePagesMutation.isPending ? 'Saving…' : dirty ? 'Unsaved changes' : 'All changes saved'}</p></div><div className="studio-toolbar-actions"><StudioPreview id={id} dirty={dirty || savePagesMutation.isPending} /><Button variant="outline" onClick={() => savePagesMutation.mutate({pages, advance: false})} disabled={savePagesMutation.isPending || !dirty}>Save changes</Button></div></header>
        <nav className="studio-mobile-nav" aria-label="Studio panels">{['outline','canvas','settings'].map(panel => <button key={panel} aria-pressed={mobilePanel === panel} onClick={() => setMobilePanel(panel)}>{panel}</button>)}</nav>
        <div className="studio-grid" data-panel={mobilePanel}>
          {/* Page Navigator - Left sidebar */}
          <div className="studio-outline">
            <PageNavigator
              pages={pages}
              currentPageIndex={currentPageIndex}
              onSelectPage={index => { setCurrentPageIndex(index); setSelectedQuestionId(null); setMobilePanel('canvas') }}
              onSelectQuestion={(index, qid) => { setCurrentPageIndex(index); setSelectedQuestionId(qid); setMobilePanel('settings') }}
              onAddPage={handleAddPage}
            />
          </div>

          {/* Page Preview - Center */}
          <div className="studio-canvas" data-size={canvasSize}>
            <Card className="question-preview-panel studio-canvas-card">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPageIndex(Math.max(0, currentPageIndex - 1))
                    }
                    aria-label="Previous page"
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
                    aria-label="Next page"
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

              <div className="studio-canvas-tools"><span>Editing {currentPage?.style === 'cover' ? 'cover' : currentPage?.style === 'results' ? 'results' : 'question page'}</span><div aria-label="Canvas width">{['desktop','mobile'].map(size => <button key={size} aria-pressed={canvasSize === size} onClick={() => setCanvasSize(size)}>{size}</button>)}</div></div>
              {currentPage && (
                <PagePreview
                  page={currentPage}
                  questionCount={pages.flatMap(p => p.questions).length}
                  sampleArchetype={archetypesQuery.data?.[0]}
                  selectedQuestionId={selectedQuestionId}
                  onSelectQuestion={qid => { setSelectedQuestionId(qid); setMobilePanel('settings') }}
                  onUpdateQuestion={handleUpdateQuestion}
                  onDeleteQuestion={handleDeleteQuestion}
                  onAddQuestion={handleAddQuestion}
                  onAddQuestionOfType={handleAddQuestionOfType}
                />
              )}
            </Card>
          </div>

          {/* Options Panel - Right sidebar */}
          <div className="question-inspector studio-inspector">
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
