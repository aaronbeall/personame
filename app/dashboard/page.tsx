'use client'
import { EntityIcon } from '@/components/entity-icon'
import { QuizCoverMark } from '@/components/quiz-cover-mark'
import { LoadingState } from '@/components/ui/loading'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import Image from 'next/image'
import { Pencil, ExternalLink, Eye } from 'lucide-react'
import { useProtectedPage } from '@/hooks/use-protected-page'
import { AppLayoutBackground } from '@/components/app-layout-background'
import { PageIntro } from '@/components/page-intro'
import { requestJson } from '@/lib/client-api'
type Summary = {
  id: string
  title: string
  description: string | null
  slug: string
  status: string
  color: string | null
  emoji: string | null
  completions: number
  updatedAt: string
  _count: { dimensions: number; archetypes: number; pages: number }
}
export default function Dashboard() {
  const status = useProtectedPage()
  const query = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => requestJson<Summary[]>('/api/dashboard'),
    enabled: status === 'authenticated',
    retry: false,
  })
  return (
    <AppLayoutBackground>
      <div className="dashboard-page">
        <PageIntro
          title="Your little universe of quizzes"
          description="Pick up where you left off, polish an idea, or see what’s finding its audience."
          art="tree-house"
          eyebrow="Creator workspace"
          actions={
            <Link className="button-link" href="/create">
              <EntityIcon kind="quiz" size={16} />
              Create a quiz
            </Link>
          }
        />
        {query.isPending ? (
          <LoadingState variant="cards" label="Loading your quizzes…" />
        ) : query.error ? (
          <p className="notice error" role="alert">
            {query.error.message}
          </p>
        ) : query.data.length === 0 ? (
          <div className="surface empty-state">
            <Image
              src="/images/decor/creation.webp"
              alt=""
              width={200}
              height={150}
            />
            <h2>Your next curious idea starts here</h2>
            <p className="muted mt-2 mb-5">
              Choose your dimensions, invent a few archetypes, and make
              something people can discover about themselves.
            </p>
            <Link href="/create" className="button-link">
              Create your first quiz
            </Link>
          </div>
        ) : (
          <div className="quiz-grid">
            {query.data.map((q) => (
              <article className="surface quiz-tile dashboard-quiz" key={q.id}>
                <div className="flex justify-between items-center">
                  <QuizCoverMark emoji={q.emoji} color={q.color} size="sm" />
                  <span
                    className={`status-tag ${q.status === 'PUBLISHED' ? 'published' : ''}`}
                  >
                    {q.status === 'PUBLISHED'
                      ? 'Live'
                      : q.status === 'CLOSED'
                        ? 'Closed'
                        : 'Draft'}
                  </span>
                </div>
                <h2>{q.title}</h2>
                <p className="muted dashboard-description">
                  {q.description || 'A personality quiz in the making.'}
                </p>
                <div className="dashboard-meta">
                  <span>
                    <strong>{q.completions}</strong>{' '}
                    {q.completions === 1 ? 'completion' : 'completions'}
                  </span>
                  <span>
                    <strong>{q._count.dimensions}</strong>{' '}
                    {q._count.dimensions === 1 ? 'dimension' : 'dimensions'}
                  </span>
                  <span>
                    <strong>{q._count.archetypes}</strong>{' '}
                    {q._count.archetypes === 1 ? 'archetype' : 'archetypes'}
                  </span>
                </div>
                <p className="dashboard-updated">
                  Updated{' '}
                  {new Date(q.updatedAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
                <div className="page-actions">
                  <Link
                    className="button-link secondary"
                    href={`/create/${q.id}/${!q._count.dimensions ? 'dimensions' : !q._count.archetypes ? 'archetypes' : 'questions'}`}
                  >
                    <Pencil size={14} />
                    Edit
                  </Link>
                  <Link
                    className="button-link secondary"
                    href={`/create/${q.id}/preview`}
                  >
                    <Eye size={14} />
                    Review
                  </Link>
                  {q.status === 'PUBLISHED' && (
                    <Link
                      href={`/quiz/${q.slug}`}
                      className="dashboard-open"
                      target="_blank"
                      aria-label={`Open ${q.title}`}
                      title="Open public quiz"
                    >
                      <ExternalLink size={17} />
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </AppLayoutBackground>
  )
}
