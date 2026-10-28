'use client'
import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { saveProgress, removeProgress } from '@/lib/participant-progress'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react'
import { Button } from './ui/button'
import { QuizCoverMark } from './quiz-cover-mark'
import { PageIntro } from './page-intro'
import { QuestionInput } from './question-input'
import { ResultView } from './result-view'
import { requestJson, responseId } from '@/lib/client-api'
import type { publicQuiz } from '@/lib/personas'
import type { QuizResponses, ResultSnapshot } from '@/lib/quiz-scoring'
type PlayerQuiz = ReturnType<typeof publicQuiz>
export function QuizPlayer({
  quiz,
  preview = false,
}: {
  quiz: PlayerQuiz
  preview?: boolean
}) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const owner = session?.user?.email
  const root = useRef<HTMLDivElement>(null)
  const pages = quiz.pages.filter(
    (p) => p.style !== 'results' && (p.style === 'cover' || p.questions.length),
  )
  const [pageIndex, setPageIndex] = useState(0)
  const [responses, setResponses] = useState<QuizResponses>({})
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<ResultSnapshot>()
  const [submissionKey, setSubmissionKey] = useState('')
  const storageKey = `personame-response:${quiz.id}:${quiz.revision}`
  useEffect(() => {
    setSubmissionKey(responseId())
    if (!preview)
      try {
        const saved = JSON.parse(sessionStorage.getItem(storageKey) || 'null')
        if (saved?.responses) {
          setResponses(saved.responses)
          if (saved.submissionKey) setSubmissionKey(saved.submissionKey)
        }
      } catch {}
  }, [storageKey, preview])
  const update = (next: QuizResponses) => {
    rememberProgress(next)
    setResponses(next)
    setError('')
    if (!preview)
      try {
        sessionStorage.setItem(
          storageKey,
          JSON.stringify({ responses: next, submissionKey }),
        )
      } catch {}
  }
  useEffect(() => {
    if (pageIndex > 0)
      root.current?.scrollIntoView({
        block: 'start',
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'auto'
          : 'smooth',
      })
  }, [pageIndex])
  const page = pages[pageIndex]
  const allQuestions = pages.flatMap((p) =>
    p.style === 'cover' ? [] : p.questions,
  )
  const answered = allQuestions.filter((q) => responses[q.id]).length
  function rememberProgress(next: QuizResponses) {
    if (preview || !owner) return
    saveProgress(owner, {
      quizId: quiz.id,
      slug: quiz.slug,
      title: quiz.title,
      description: quiz.description,
      emoji: quiz.emoji,
      color: quiz.color,
      revision: quiz.revision,
      answered: allQuestions.filter((q) => next[q.id]).length,
      total: allQuestions.length,
      updatedAt: new Date().toISOString(),
    })
  }

  const next = async () => {
    if (page?.style !== 'cover') {
      const missing = page?.questions.find(
        (q) => q.required && !responses[q.id],
      )
      if (missing) {
        setError(`Answer “${missing.text}” before continuing.`)
        document.getElementById(`question-${missing.id}`)?.focus()
        return
      }
    }
    if (pageIndex < pages.length - 1) {
      rememberProgress(responses)
      setPageIndex((i) => i + 1)
      setError('')
      return
    }
    setBusy(true)
    setError('')
    try {
      if (preview) {
        const data = await requestJson<ResultSnapshot>(
          `/api/personames/${quiz.id}/preview`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ responses }),
          },
        )
        setResult(data)
      } else {
        const data = await requestJson<{ id: string }>(
          `/api/quiz/${quiz.slug}/submit`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              responses,
              revision: quiz.revision,
              submissionKey,
            }),
          },
        )
        try {
          sessionStorage.removeItem(storageKey)
          if (owner) removeProgress(owner, quiz.id)
        } catch {}
        void queryClient.invalidateQueries({ queryKey: ['personal'] })
        router.push(`/quiz/${quiz.slug}/results/${data.id}`)
      }
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Unable to submit. Please try again.',
      )
    } finally {
      setBusy(false)
    }
  }
  if (result)
    return (
      <ResultView
        preview
        result={result}
        onRetake={() => {
          setResult(undefined)
          setPageIndex(0)
          setResponses({})
        }}
      />
    )
  if (!page)
    return (
      <div className="notice">
        Add a visible question page to try this quiz.
      </div>
    )
  return (
    <div
      className={`quiz-player page-style-${page.style || 'default'}`}
      ref={root}
    >
      {preview && (
        <p className="preview-label">
          Participant preview — answers here are not saved
        </p>
      )}
      <PageIntro
        identity={
          <QuizCoverMark emoji={quiz.emoji} color={quiz.color} size="sm" />
        }
        title={page.style === 'cover' ? page.title || quiz.title : quiz.title}
        description={
          page.style === 'cover'
            ? page.description ||
              quiz.description ||
              'Discover a different side of yourself.'
            : page.description || 'Go with what feels most like you.'
        }
        art={page.style === 'cover' ? 'islands' : 'science'}
        eyebrow={
          page.style === 'cover'
            ? quiz.title
            : `${answered} of ${allQuestions.length} answered`
        }
      />
      {page.style !== 'cover' && (
        <>
          <progress
            className="quiz-progress"
            value={answered}
            max={allQuestions.length}
            aria-label="Questions answered"
          />
          {page.title && (
            <h2 className="quiz-page-title">
              {page.emoji} {page.title}
            </h2>
          )}
          <div className="question-list">
            {page.questions.map((q) => (
              <section
                className="surface player-question"
                key={q.id}
                id={`question-${q.id}`}
                tabIndex={-1}
              >
                <p className="eyebrow">
                  Question{' '}
                  {allQuestions.findIndex((item) => item.id === q.id) + 1}
                  {!q.required ? ' — optional' : ''}
                </p>
                <h3>
                  {q.emoji} {q.text}
                </h3>
                <QuestionInput
                  question={q}
                  value={responses[q.id]}
                  onChange={(value) => update({ ...responses, [q.id]: value })}
                />
              </section>
            ))}
          </div>
        </>
      )}
      {error && (
        <div className="notice error mt-5" role="alert">
          {error}
        </div>
      )}
      <div className="quiz-navigation">
        {pageIndex > 0 ? (
          <Button
            disabled={busy}
            variant="ghost"
            onClick={() => {
              setPageIndex((i) => i - 1)
              setError('')
            }}
          >
            <ArrowLeft size={16} />
            Back
          </Button>
        ) : (
          <span />
        )}
        <span className="muted">
          {pageIndex + 1} / {pages.length}
        </span>
        <Button onClick={next} loading={busy} disabled={busy || !submissionKey}>
          {busy
            ? 'Finding your match…'
            : page.style === 'cover'
              ? 'Let’s find out'
              : pageIndex === pages.length - 1
                ? 'See my results'
                : 'Continue'}
          {pageIndex === pages.length - 1 ? (
            <Sparkles size={16} />
          ) : (
            <ArrowRight size={16} />
          )}
        </Button>
      </div>
    </div>
  )
}
