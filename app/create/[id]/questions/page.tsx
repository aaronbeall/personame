'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useProtectedPage } from '@/hooks/use-protected-page'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowRight, ArrowLeft, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { ErrorBanner } from '@/components/ui/error-banner'
import { AppLayoutBackground } from '@/components/app-layout-background'
import { StepProgress } from '@/components/step-progress'
import { getTempId } from '@/lib/utils'
import { QuizPage, Question, Answer, AnswerWeight, Metric, Archetype } from '@prisma/client'
import { PageNavigator } from './page-navigator'
import { PagePreview } from './page-preview'
import { PageOptionsPanel } from './page-options-panel'
import { QuestionOptionsPanel } from './question-options-panel'
import { MetricsArchetypesSummary } from './metrics-archetypes-summary'

type QuizPageWithQuestions = QuizPage & {
  questions: (Question & {
    answers: (Answer & {
      weights: AnswerWeight[]
    })[]
  })[]
}

export default function QuestionsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  useProtectedPage()
  const { id } = use(params)

  const [pages, setPages] = useState<QuizPageWithQuestions[]>([])
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null)

  // Fetch metrics
  const metricsQuery = useQuery({
    queryKey: ['metrics', id],
    queryFn: async () => {
      const res = await fetch(`/api/personames/${id}/metrics`)
      if (!res.ok) throw new Error('Failed to fetch metrics')
      return res.json() as Promise<Metric[]>
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

  // Initialize pages with cover and results if empty
  useEffect(() => {
    if (pagesQuery.data) {
      if (pagesQuery.data.length === 0) {
        // Initialize with cover and results pages
        setPages([
          {
            id: getTempId(),
            title: 'Welcome',
            description: 'Start your quiz journey',
            order: 0,
            hidden: false,
            emoji: null,
            color: null,
            style: 'cover',
            icon: null,
            personaId: id,
            questions: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: getTempId(),
            title: 'Your Results',
            description: 'Discover your personality type',
            order: 1,
            hidden: false,
            emoji: null,
            color: null,
            style: 'results',
            icon: null,
            personaId: id,
            questions: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ])
      } else {
        setPages(pagesQuery.data)
      }
    }
  }, [pagesQuery.data, id])

  const savePagesMutation = useMutation({
    mutationFn: async (pagesToSave: QuizPageWithQuestions[]) => {
      const res = await fetch(`/api/personames/${id}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pages: pagesToSave }),
      })

      if (!res.ok) {
        throw new Error('Failed to save quiz pages')
      }

      return res.json()
    },
    onSuccess: () => {
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
    setPages(pages.map(p => p.id === updatedPage.id ? updatedPage : p))
  }

  const handleDeletePage = (pageId: string) => {
    const pageIndex = pages.findIndex(p => p.id === pageId)
    const updatedPages = pages.filter(p => p.id !== pageId).map((p, idx) => ({ ...p, order: idx }))
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

    const newQuestion: Question & { answers: (Answer & { weights: AnswerWeight[] })[] } = {
      id: getTempId(),
      text: 'New question',
      type: 'MULTIPLE_CHOICE',
      order: currentPage.questions.length,
      required: true,
      emoji: null,
      color: null,
      style: null,
      icon: null,
      pageId: currentPage.id,
      answers: [
        {
          id: getTempId(),
          text: 'Option 1',
          order: 0,
          emoji: null,
          color: null,
          style: null,
          icon: null,
          questionId: getTempId(),
          weights: (metricsQuery.data || []).map(m => ({
            id: getTempId(),
            metricId: m.id,
            value: 0,
            answerId: getTempId(),
            createdAt: new Date(),
            updatedAt: new Date(),
          })),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: getTempId(),
          text: 'Option 2',
          order: 1,
          emoji: null,
          color: null,
          style: null,
          icon: null,
          questionId: getTempId(),
          weights: (metricsQuery.data || []).map(m => ({
            id: getTempId(),
            metricId: m.id,
            value: 0,
            answerId: getTempId(),
            createdAt: new Date(),
            updatedAt: new Date(),
          })),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const updatedPage = {
      ...currentPage,
      questions: [...currentPage.questions, newQuestion],
    }

    handleUpdatePage(updatedPage)
    setSelectedQuestionId(newQuestion.id)
  }

  const handleAddQuestionOfType = (type: 'MULTIPLE_CHOICE' | 'SLIDER' | 'SCALE') => {
    if (currentPageIndex < 0 || currentPageIndex >= pages.length) return

    const currentPage = pages[currentPageIndex]
    if (currentPage.style === 'cover' || currentPage.style === 'results') return

    if (type === 'MULTIPLE_CHOICE') {
      return handleAddQuestion()
    }

    const newQuestion: Question & { answers: (Answer & { weights: AnswerWeight[] })[] } = {
      id: getTempId(),
      text: type === 'SLIDER' ? 'New slider question' : 'New scale question',
      type,
      order: currentPage.questions.length,
      required: true,
      emoji: null,
      color: null,
      style: null,
      icon: null,
      pageId: currentPage.id,
      answers: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const updatedPage = {
      ...currentPage,
      questions: [...currentPage.questions, newQuestion],
    }

    handleUpdatePage(updatedPage)
    setSelectedQuestionId(newQuestion.id)
  }

  const handleUpdateQuestion = (updatedQuestion: Question & { answers: (Answer & { weights: AnswerWeight[] })[] }) => {
    const currentPage = pages[currentPageIndex]
    const updatedPage = {
      ...currentPage,
      questions: currentPage.questions.map(q => q.id === updatedQuestion.id ? updatedQuestion : q),
    }
    handleUpdatePage(updatedPage)
  }

  const handleDeleteQuestion = (questionId: string) => {
    const currentPage = pages[currentPageIndex]
    const updatedPage = {
      ...currentPage,
      questions: currentPage.questions.filter(q => q.id !== questionId).map((q, idx) => ({ ...q, order: idx })),
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
  const selectedQuestion = currentPage?.questions.find(q => q.id === selectedQuestionId)
  const canAddQuestion = currentPage?.style !== 'cover' && currentPage?.style !== 'results'

  return (
    <AppLayoutBackground>
      <div className="max-w-7xl mx-auto">
        <StepProgress
          steps={[
            { number: 1, label: 'Metrics', completed: true },
            { number: 2, label: 'Archetypes', completed: true },
            { number: 3, label: 'Questions', active: true },
          ]}
          title="Build Your Quiz"
          description="Create pages and questions for your quiz"
        />

        <ErrorBanner error={savePagesMutation.error} />

        {/* Summary of metrics and archetypes */}
        <MetricsArchetypesSummary
          metrics={metricsQuery.data || []}
          archetypes={archetypesQuery.data || []}
        />

        <div className="grid grid-cols-12 gap-6 mb-6">
          {/* Page Navigator - Left sidebar */}
          <div className="col-span-2">
            <PageNavigator
              pages={pages}
              currentPageIndex={currentPageIndex}
              onSelectPage={setCurrentPageIndex}
              onAddPage={handleAddPage}
            />
          </div>

          {/* Page Preview - Center */}
          <div className="col-span-6">
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPageIndex(Math.max(0, currentPageIndex - 1))}
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
                    onClick={() => setCurrentPageIndex(Math.min(pages.length - 1, currentPageIndex + 1))}
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
                    style={{ width: `${((currentPageIndex + 1) / pages.length) * 100}%` }}
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
          <div className="col-span-4">
            {selectedQuestion ? (
              <QuestionOptionsPanel
                question={selectedQuestion}
                metrics={metricsQuery.data || []}
                onUpdate={handleUpdateQuestion}
                onClose={() => setSelectedQuestionId(null)}
              />
            ) : (
              currentPage && (
                <PageOptionsPanel
                  page={currentPage}
                  onUpdate={handleUpdatePage}
                  onDelete={currentPageIndex > 0 && currentPageIndex < pages.length - 1 ? () => handleDeletePage(currentPage.id) : undefined}
                />
              )
            )}
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => router.push(`/create/${id}/archetypes`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            onClick={handleSave}
            disabled={pages.length < 2 || savePagesMutation.isPending}
            className="bg-gradient-to-r from-primary to-secondary hover:from-primary-600 hover:to-secondary-600 text-white shadow-md"
          >
            {savePagesMutation.isPending ? 'Saving...' : 'Continue to Preview'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </AppLayoutBackground>
  )
}
