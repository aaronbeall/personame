'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { useParticipantProgress } from '@/hooks/use-participant-progress'
import { removeProgress } from '@/lib/participant-progress'
import { ArrowRight, Eye, Search, Compass, Drama } from 'lucide-react'
import { EntityIcon } from '@/components/entity-icon'
import { QuizCoverMark } from '@/components/quiz-cover-mark'
import { ArchetypeBadge } from '@/components/entity-identity'
import { LoadingState } from '@/components/ui/loading'
import { AppLayoutBackground } from '@/components/app-layout-background'
import { PageIntro } from '@/components/page-intro'
import { useProtectedPage } from '@/hooks/use-protected-page'
import { requestJson } from '@/lib/client-api'
import type { ResultSnapshot } from '@/lib/quiz-scoring'
import type { OwnedQuizSummary } from '@/lib/quiz-composition'
type CompletedQuiz = {
  id: string
  completedAt: string
  archetype: ResultSnapshot['archetype'] | null
  canViewResult: boolean
  persona: Pick<
    OwnedQuizSummary,
    'id' | 'title' | 'description' | 'slug' | 'color' | 'emoji'
  >
}

export default function Selves() {
  const status = useProtectedPage()
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState('discovered')
  const progress = useParticipantProgress(session?.user?.email)

  const [search, setSearch] = useState('')
  const completed = useQuery({
    queryKey: ['personal', 'completed'],
    queryFn: () => requestJson<CompletedQuiz[]>('/api/me/discoveries'),
    enabled: status === 'authenticated',
    retry: false,
  })
  const matches = (q: { title: string; description: string | null }) =>
    `${q.title} ${q.description ?? ''}`
      .toLocaleLowerCase()
      .includes(search.trim().toLocaleLowerCase())

  return (
    <AppLayoutBackground>
      <div className="dashboard-page selves-page">
        <PageIntro
          title="Your many selves"
          eyebrow="Your archetype collection"
          description="A little of this, a little of that. Meet the archetypes you’ve discovered in yourself."
          art="islands"
          actions={
            <Link href="/explore" className="button-link">
              <EntityIcon kind="archetype" size={16} />
              Discover another self
            </Link>
          }
        />
        <div className="selves-toolbar">
          <div
            className="dashboard-tabs"
            role="tablist"
            aria-label="Your selves"
          >
            {[
              {
                key: 'discovered',
                label: 'Discovered',
                count: completed.data?.length,
                icon: Drama,
              },
              {
                key: 'exploring',
                label: 'Still exploring',
                count: progress.length,
                icon: Compass,
              },
            ].map(({ key, label, count, icon: Icon }, index) => (
              <button
                type="button"
                key={key}
                id={`selves-tab-${key}`}
                role="tab"
                aria-selected={activeTab === key}
                aria-controls="selves-panel"
                tabIndex={activeTab === key ? 0 : -1}
                onClick={() => setActiveTab(key)}
                onKeyDown={(event) => {
                  if (
                    !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(
                      event.key,
                    )
                  )
                    return
                  event.preventDefault()
                  const next =
                    event.key === 'Home'
                      ? 'discovered'
                      : event.key === 'End'
                        ? 'exploring'
                        : index === 0
                          ? 'exploring'
                          : 'discovered'
                  setActiveTab(next)
                  document.getElementById(`selves-tab-${next}`)?.focus()
                }}
              >
                <Icon size={16} aria-hidden="true" />
                {label}
                <span className="dashboard-tab-count">{count ?? '—'}</span>
              </button>
            ))}
          </div>
          <label className="dashboard-search">
            <Search size={17} aria-hidden="true" />
            <span className="sr-only">Search your selves</span>
            <input
              type="search"
              placeholder="Find a self or quiz…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
        </div>
        <section aria-label="Your discoveries">
          <div
            role="tabpanel"
            id="selves-panel"
            aria-labelledby={`selves-tab-${activeTab}`}
            tabIndex={0}
          >
            {activeTab === 'exploring' ? (
              <>
                <p className="dashboard-tab-description">
                  A few answers away from another side of you. These attempts
                  are saved in this browser tab.
                </p>
                <div className="quiz-grid">
                  {progress.filter(matches).map((attempt) => (
                    <article
                      className="surface quiz-tile dashboard-quiz selves-exploring"
                      key={attempt.quizId}
                    >
                      <QuizCoverMark
                        color={attempt.color}
                        emoji={attempt.emoji}
                        size="sm"
                      />
                      <h3>{attempt.title}</h3>
                      <p className="muted dashboard-description">
                        {attempt.description}
                      </p>
                      <div className="selves-progress">
                        <span>
                          {attempt.answered} of {attempt.total} answered
                        </span>
                        <progress
                          value={attempt.answered}
                          max={attempt.total}
                          aria-label={`${attempt.title} progress`}
                        />
                      </div>
                      <div className="page-actions">
                        <Link
                          className="button-link"
                          href={`/quiz/${attempt.slug}`}
                        >
                          <ArrowRight size={14} />
                          Resume discovery
                        </Link>
                        <button
                          type="button"
                          className="selves-dismiss"
                          onClick={() => {
                            if (session?.user?.email)
                              removeProgress(session.user.email, attempt.quizId)
                          }}
                        >
                          Dismiss
                        </button>
                      </div>
                    </article>
                  ))}
                  {!progress.some(matches) && (
                    <div className="dashboard-collection-empty selves-empty">
                      <p>
                        {search.trim()
                          ? 'No unfinished discoveries match your search.'
                          : 'No unfinished discoveries. Start a quiz and come back whenever curiosity calls.'}
                      </p>
                      {!search.trim() && (
                        <Link
                          href="/explore"
                          className="button-link secondary"
                        >
                          Explore quizzes
                          <ArrowRight size={14} />
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : completed.isPending ? (
              <LoadingState
                variant="cards"
                label="Gathering your many selves…"
              />
            ) : completed.error ? (
              <p className="notice error" role="alert">
                {completed.error.message}
              </p>
            ) : (
              <>
                <div className="quiz-grid">
                  {completed.data
                    .filter((result) =>
                      matches({
                        title: `${result.persona.title} ${result.archetype?.name ?? ''}`,
                        description:
                          result.archetype?.description ??
                          result.persona.description,
                      }),
                    )
                    .map((result) => (
                      <article
                        key={result.id}
                        className="surface quiz-tile dashboard-quiz dashboard-completed"
                      >
                        <div className="dashboard-card-masthead">
                          {result.archetype ? (
                            <ArchetypeBadge
                              name={result.archetype.name}
                              emoji={result.archetype.emoji}
                              color={result.archetype.color}
                              size={80}
                              label={false}
                            />
                          ) : (
                            <EntityIcon kind="archetype" size={32} />
                          )}
                        </div>
                        <h3>{result.archetype?.name ?? 'A past discovery'}</h3>
                        <p className="muted dashboard-description">
                          {result.archetype?.description}
                        </p>
                        <Link
                          className="dashboard-discovery-source"
                          href={`/quiz/${result.persona.slug}`}
                          aria-label={`Take ${result.persona.title} again`}
                        >
                          <QuizCoverMark
                            emoji={result.persona.emoji}
                            color={result.persona.color}
                            size="sm"
                          />
                          <span className="dashboard-source-copy">
                            <span className="dashboard-source-caption">
                              From the quiz
                            </span>
                            <span className="dashboard-source-title">
                              {result.persona.title}
                            </span>
                          </span>
                          <ArrowRight size={14} aria-hidden="true" />
                        </Link>
                        <p className="dashboard-updated">
                          Discovered{' '}
                          {new Date(result.completedAt).toLocaleDateString(
                            undefined,
                            { month: 'short', day: 'numeric', year: 'numeric' },
                          )}
                        </p>
                        <div className="page-actions">
                          {result.canViewResult ? (
                            <Link
                              className="button-link secondary"
                              href={`/quiz/${result.persona.slug}/results/${result.id}`}
                            >
                              <Eye size={14} />
                              Revisit this self
                            </Link>
                          ) : (
                            <span className="muted">
                              This result is no longer available.
                            </span>
                          )}
                        </div>
                      </article>
                    ))}
                  {!completed.data.some((result) =>
                    matches({
                      title: `${result.persona.title} ${result.archetype?.name ?? ''}`,
                      description:
                        result.archetype?.description ??
                        result.persona.description,
                    }),
                  ) && (
                    <div className="dashboard-collection-empty selves-empty">
                      <p>
                        {search.trim()
                          ? 'No selves match your search.'
                          : 'There’s more than one way to be you. Take a quiz to discover your first archetype.'}
                      </p>
                      {!search.trim() && (
                        <Link
                          href="/explore"
                          className="button-link secondary"
                        >
                          Explore quizzes
                          <ArrowRight size={14} />
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </AppLayoutBackground>
  )
}
