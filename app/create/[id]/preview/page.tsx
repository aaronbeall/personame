'use client'
import { EntityIcon } from '@/components/entity-icon'
import { QuizCoverMark } from '@/components/quiz-cover-mark'
import { LoadingState } from '@/components/ui/loading'
import { use, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import {
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Eye,
  Rocket,
  Settings2,
} from 'lucide-react'
import { useProtectedPage } from '@/hooks/use-protected-page'
import { AppLayoutBackground } from '@/components/app-layout-background'
import { StepProgress } from '@/components/step-progress'
import { QuizPlayer } from '@/components/quiz-player'
import { Button } from '@/components/ui/button'
import { requestJson } from '@/lib/client-api'
import type { FullQuiz, publicQuiz } from '@/lib/personas'
type ReviewQuiz = FullQuiz & { issues: string[] }
export default function ReviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const status = useProtectedPage()
  const cache = useQueryClient()
  const query = useQuery({
    queryKey: ['review', id],
    queryFn: () => requestJson<ReviewQuiz>(`/api/personames/${id}`),
    enabled: status === 'authenticated',
    retry: false,
  })
  const [tab, setTab] = useState<'review' | 'try'>('review')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const quiz = query.data
  const refresh = () => cache.invalidateQueries({ queryKey: ['review', id] })
  const publish = async () => {
    setBusy(true)
    setError('')
    try {
      await requestJson(`/api/personames/${id}/publish`, { method: 'POST' })
      await refresh()
      cache.invalidateQueries({ queryKey: ['dashboard'] })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to publish.')
    } finally {
      setBusy(false)
    }
  }
  if (!quiz)
    return (
      <AppLayoutBackground>
        {query.error ? (
          <p role="alert" className="notice error">
            {query.error.message}
          </p>
        ) : (
          <div className="max-w-5xl mx-auto">
            <LoadingState label="Preparing your preview…" />
          </div>
        )}
      </AppLayoutBackground>
    )
  const playerQuiz = {
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    slug: quiz.slug,
    emoji: quiz.emoji,
    color: quiz.color,
    revision: new Date(quiz.updatedAt).toISOString(),
    pages: quiz.pages.filter((p) => !p.hidden),
  } satisfies ReturnType<typeof publicQuiz>
  return (
    <AppLayoutBackground>
      <div className="max-w-5xl mx-auto">
        <StepProgress
          steps={[]}
          title="Make sure it feels like you"
          description="Try your quiz from start to finish, then send it out into the world. You can always return to refine it."
        />
        {quiz.status === 'PUBLISHED' && (
          <div className="notice publish-success">
            <CheckCircle2 size={20} />
            <div>
              <strong>Your quiz is live</strong>
              <p>
                Anyone with the link can take it. Editing any step will return
                it to draft until you publish again.
              </p>
              <div className="page-actions">
                <Link
                  className="button-link"
                  href={`/quiz/${quiz.slug}`}
                  target="_blank"
                >
                  Open quiz <ExternalLink size={14} />
                </Link>
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(
                        `${location.origin}/quiz/${quiz.slug}`,
                      )
                      setCopied(true)
                    } catch {
                      setError('Copy the quiz address from your browser.')
                    }
                  }}
                >
                  <Copy size={14} />
                  {copied ? 'Copied!' : 'Copy link'}
                </Button>
                <Button
                  variant="ghost"
                  disabled={busy}
                  loading={busy}
                  onClick={async () => {
                    setBusy(true)
                    try {
                      await requestJson(`/api/personames/${id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: 'DRAFT' }),
                      })
                      await refresh()
                    } catch (e) {
                      setError((e as Error).message)
                    } finally {
                      setBusy(false)
                    }
                  }}
                >
                  Unpublish
                </Button>
              </div>
            </div>
          </div>
        )}
        <div className="review-tabs" role="tablist" aria-label="Quiz review">
          <button
            role="tab"
            aria-selected={tab === 'review'}
            onClick={() => setTab('review')}
          >
            <Settings2 size={16} />
            Review & publish
          </button>
          <button
            role="tab"
            aria-selected={tab === 'try'}
            onClick={() => setTab('try')}
          >
            <Eye size={16} />
            Try the quiz
          </button>
        </div>
        {tab === 'try' ? (
          <div className="max-w-3xl mx-auto">
            {quiz.issues.length > 0 && (
              <p className="notice mb-5">
                You can explore the questions now. Complete the checklist before
                publishing.
              </p>
            )}
            <QuizPlayer quiz={playerQuiz} preview />
          </div>
        ) : (
          <div className="review-layout">
            <div className="surface">
              <h2>Ready for the world?</h2>
              <p className="muted mt-2">
                A quick check of the pieces that make your quiz work.
              </p>
              <div className="review-counts">
                <span>
                  <b>{quiz.dimensions.length}</b> dimensions
                </span>
                <span>
                  <b>{quiz.archetypes.length}</b> archetypes
                </span>
                <span>
                  <b>
                    {
                      quiz.pages
                        .filter(
                          (p) =>
                            !p.hidden &&
                            p.style !== 'cover' &&
                            p.style !== 'results',
                        )
                        .flatMap((p) => p.questions).length
                    }
                  </b>{' '}
                  questions
                </span>
              </div>
              {quiz.issues.length ? (
                <ul className="readiness-list">
                  {quiz.issues.map((issue) => (
                    <li key={issue}>
                      <AlertCircle size={17} />
                      {issue}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="readiness-ready">
                  <CheckCircle2 size={20} />
                  All the essentials are in place.
                </p>
              )}
              <div className="page-actions">
                <Link
                  href={`/create/${id}/questions`}
                  className="button-link secondary"
                >
                  Edit questions
                </Link>
                <Button
                  onClick={publish}
                  loading={busy && quiz.status !== 'PUBLISHED'}
                  disabled={
                    busy ||
                    quiz.issues.length > 0 ||
                    quiz.status === 'PUBLISHED'
                  }
                >
                  <Rocket size={16} />
                  {busy
                    ? 'Publishing…'
                    : quiz.status === 'PUBLISHED'
                      ? 'Published'
                      : 'Publish quiz'}
                </Button>
              </div>
              <p className="muted mt-4">
                Publishing makes your quiz publicly accessible. Preview answers
                never count as completions.
              </p>
            </div>
            <aside className="surface quiz-details">
              <h2 className="entity-heading">
                <EntityIcon kind="quiz" size={18} />
                The first impression
              </h2>
              <div className="quiz-details-identity">
                <QuizCoverMark
                  emoji={quiz.emoji}
                  color={quiz.color}
                  size="sm"
                />
                <strong>{quiz.title}</strong>
              </div>
              <p className="muted mt-2">
                {quiz.description || 'No description yet.'}
              </p>
              <Link
                className="button-link secondary mt-5"
                href={`/create/${id}/name`}
              >
                Edit name & style
              </Link>
            </aside>
          </div>
        )}
        {error && (
          <div role="alert" className="notice error mt-5">
            {error}
          </div>
        )}
      </div>
    </AppLayoutBackground>
  )
}
