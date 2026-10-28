'use client'

import { useState, type CSSProperties } from 'react'
import { getColorTheme } from '@/lib/colors'
import { EntityIcon } from '@/components/entity-icon'
import { QuizCoverMark } from '@/components/quiz-cover-mark'
import { LoadingIndicator, LoadingState } from '@/components/ui/loading'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import {
  Pencil,
  ExternalLink,
  Eye,
  LockKeyhole,
  Radio,
  Archive,
  ArrowRight,
  Search,
} from 'lucide-react'
import { useProtectedPage } from '@/hooks/use-protected-page'
import { AppLayoutBackground } from '@/components/app-layout-background'
import { PageIntro } from '@/components/page-intro'
import { requestJson } from '@/lib/client-api'
import type { OwnedQuizSummary } from '@/lib/quiz-composition'
import { DraftComposition } from '@/components/draft-composition'
import { CollectionPagination } from '@/components/collection-pagination'
import type { ListPage } from '@/lib/pagination'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
const tabs = [
  { key: 'DRAFT', label: 'Drafts', icon: LockKeyhole },
  { key: 'PUBLISHED', label: 'Published', icon: Radio },
] as const

export default function YourQuizzes() {
  const [activeTab, setActiveTab] = useState<string>('DRAFT')
  const [search, setSearch] = useState('')
  const status = useProtectedPage()
  const [page, setPage] = useState(1)
  const searchQuery = useDebouncedValue(search)
  const query = useQuery({
    queryKey: ['personal', 'quizzes', activeTab, searchQuery, page],
    queryFn: ({ signal }) => requestJson<ListPage<OwnedQuizSummary>>(`/api/me/quizzes?${new URLSearchParams({ status: activeTab, search: searchQuery, page: String(page) })}`, { signal }),
    enabled: status === 'authenticated',
    retry: false,
    placeholderData: keepPreviousData,
  })
  const counts = query.data?.counts ?? { DRAFT: 0, PUBLISHED: 0 }
  return (
    <AppLayoutBackground>
      <div className="dashboard-page">
        <PageIntro
          title="Your quizzes"
          description="A home for your curious ideas. Shape your next quiz, or see what’s finding its audience."
          art="tree-house"
          eyebrow="Your creator space"
          actions={
            <Link className="button-link" href="/create">
              <EntityIcon kind="quiz" size={16} />
              Create a quiz
            </Link>
          }
        />
        <div className="dashboard-toolbar">
          <div
            className="dashboard-tabs"
            role="tablist"
            aria-label="Quiz collections"
          >
            {tabs.map(({ key, label, icon: Icon }, index) => (
              <button
                key={key}
                id={`tab-${key}`}
                role="tab"
                type="button"
                aria-selected={activeTab === key}
                aria-controls={`panel-${key}`}
                tabIndex={activeTab === key ? 0 : -1}
                onClick={() => { setActiveTab(key); setPage(1) }}
                onKeyDown={(event) => {
                  let next = index
                  if (event.key === 'ArrowRight')
                    next = (index + 1) % tabs.length
                  else if (event.key === 'ArrowLeft')
                    next = (index + tabs.length - 1) % tabs.length
                  else if (event.key === 'Home') next = 0
                  else if (event.key === 'End') next = tabs.length - 1
                  else return
                  event.preventDefault()
                  setActiveTab(tabs[next].key)
                  setPage(1)
                  document.getElementById(`tab-${tabs[next].key}`)?.focus()
                }}
              >
                <Icon size={16} aria-hidden="true" />
                {label}
                <span className="dashboard-tab-count">
                  {query.isPending ? (
                    <LoadingIndicator
                      label={`Loading ${label.toLowerCase()} count…`}
                    />
                  ) : query.error ? (
                    '—'
                  ) : (
                    counts[key]
                  )}
                </span>
              </button>
            ))}
          </div>
          <label className="dashboard-search">
            <Search size={17} aria-hidden="true" />
            <span className="sr-only">Search quizzes</span>
            <input
              type="search"
              placeholder="Search quizzes…"
              value={search}
              onChange={(event) => { setSearch(event.target.value); setPage(1) }}
            />
          </label>
        </div>
        <div id="quiz-collection" className="collection-anchor">
        <div
          className="paginated-collection"
          aria-busy={query.isFetching}
          role="tabpanel"
          id={`panel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
          tabIndex={0}
        >
          {query.isPending ? (
            <LoadingState variant="cards" label="Loading your quizzes…" />
          ) : query.error ? (
            <p className="notice error" role="alert">
              {query.error.message}
            </p>
          ) : (
            <div className="dashboard-collections">
              {[
                {
                  status: 'DRAFT',
                  title: 'Drafts',
                  description: 'Your workshop. Private until you publish.',
                  icon: LockKeyhole,
                },
                {
                  status: 'PUBLISHED',
                  title: 'Published',
                  description: 'Released quizzes, live or closed.',
                  icon: Radio,
                },
              ]
                .filter((group) => group.status === activeTab)
                .map((group) => {
                  const quizzes = query.data.items
                    .filter((q) =>
                      group.status === 'DRAFT'
                        ? q.status === 'DRAFT'
                        : q.status === 'PUBLISHED' || q.status === 'CLOSED',
                    )
                  return (
                    <section
                      className={`dashboard-collection dashboard-collection-${group.status.toLowerCase()}`}
                      key={group.status}
                      aria-labelledby={`collection-${group.status}`}
                    >
                      <p
                        className="dashboard-tab-description"
                        id={`collection-${group.status}`}
                      >
                        {group.description}
                      </p>
                      {!quizzes.length ? (
                        <p className="dashboard-collection-empty">
                          {search.trim()
                            ? 'No quizzes match your search.'
                            : group.status === 'DRAFT'
                              ? 'A fresh idea? Create a quiz to start your next draft.'
                              : 'Your published quizzes will appear here when they’re ready to share.'}
                        </p>
                      ) : (
                        <div className="quiz-grid">
                          {quizzes.map((q) => (
                            <article
                              className={`surface quiz-tile dashboard-quiz dashboard-${q.status === 'DRAFT' ? 'draft' : q.status === 'CLOSED' ? 'closed' : 'live'}`}
                              style={
                                {
                                  '--dashboard-quiz-color': getColorTheme(
                                    q.color,
                                  ).hex,
                                } as CSSProperties
                              }
                              key={q.id}
                            >
                              <div className="dashboard-card-masthead">
                                <QuizCoverMark
                                  emoji={q.emoji}
                                  color={q.color}
                                  size="sm"
                                />
                                <span
                                  className={`status-tag ${q.status === 'PUBLISHED' ? 'published' : q.status === 'CLOSED' ? 'closed' : ''}`}
                                >
                                  {q.status === 'DRAFT' ? (
                                    <>
                                      <LockKeyhole size={11} /> Private draft
                                    </>
                                  ) : q.status === 'PUBLISHED' ? (
                                    <>
                                      <span className="dashboard-live-dot" />{' '}
                                      Live
                                    </>
                                  ) : (
                                    <>
                                      <Archive size={11} /> Closed
                                    </>
                                  )}
                                </span>
                              </div>
                              <h3>{q.title}</h3>
                              <p className="muted dashboard-description">
                                {q.description ||
                                  'A personality quiz in the making.'}
                              </p>
                              {q.status === 'DRAFT' ? (
                                <DraftComposition quiz={q} />
                              ) : (
                                <div className="dashboard-meta">
                                  <span>
                                    <strong>{q.completions}</strong>{' '}
                                    {q.completions === 1
                                      ? 'completion'
                                      : 'completions'}
                                  </span>
                                  <span>
                                    <strong>{q._count.dimensions}</strong>{' '}
                                    dimensions
                                  </span>
                                  <span>
                                    <strong>{q._count.archetypes}</strong>{' '}
                                    archetypes
                                  </span>
                                </div>
                              )}
                              <p className="dashboard-updated">
                                Updated{' '}
                                {new Date(q.updatedAt).toLocaleDateString(
                                  undefined,
                                  { month: 'short', day: 'numeric' },
                                )}
                              </p>
                              <div className="page-actions">
                                <Link
                                  className={`button-link ${q.status === 'DRAFT' ? '' : 'secondary'}`}
                                  href={`/create/${q.id}/${q.status === 'DRAFT' ? q.composition.next : 'name'}`}
                                >
                                  {q.status === 'DRAFT' ? (
                                    <ArrowRight size={14} />
                                  ) : (
                                    <Pencil size={14} />
                                  )}
                                  {q.status === 'DRAFT'
                                    ? q.composition.readyToPublish
                                      ? 'Review & publish'
                                      : `Continue: ${q.composition.stages.find((s) => s.key === q.composition.next)?.label}`
                                    : 'Edit'}
                                </Link>
                                {!(
                                  q.status === 'DRAFT' &&
                                  q.composition.readyToPublish
                                ) && (
                                  <Link
                                    className="button-link secondary"
                                    href={`/create/${q.id}/preview`}
                                  >
                                    <Eye size={14} />
                                    Review
                                  </Link>
                                )}
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
                    </section>
                  )
                })}
            </div>
          )}
        </div>
        </div>
        {query.data && <CollectionPagination page={query.data.page} total={query.data.total} onPage={setPage} loading={query.isFetching} itemLabel="quizzes" contentId="quiz-collection" />}
      </div>
    </AppLayoutBackground>
  )
}
