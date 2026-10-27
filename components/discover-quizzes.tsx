'use client'
import { QuizCoverMark } from '@/components/quiz-cover-mark'
import { LoadingState } from '@/components/ui/loading'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { requestJson } from '@/lib/client-api'
import { ArrowUpRight, Search } from 'lucide-react'
type Listing = {
  id: string
  title: string
  description: string | null
  slug: string
  color: string | null
  emoji: string | null
  completions: number
  _count: { archetypes: number }
}
export function DiscoverQuizzes() {
  const [search, setSearch] = useState('')
  const query = useQuery({
    queryKey: ['discover'],
    queryFn: () => requestJson<Listing[]>('/api/personames'),
  })
  const quizzes = query.data?.filter((q) =>
    `${q.title} ${q.description || ''}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  )
  return (
    <section id="explore" className="discover-section">
      <div className="discover-heading">
        <div>
          <p className="eyebrow">Made by curious people</p>
          <h2>Find a little more of yourself</h2>
        </div>
        <label className="discover-search">
          <Search size={16} />
          <input
            aria-label="Search quizzes"
            placeholder="Find a quiz…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>
      {query.isPending ? (
        <LoadingState variant="cards" label="Finding quizzes…" />
      ) : query.error ? (
        <p className="notice error" role="alert">
          {query.error.message}
        </p>
      ) : !quizzes?.length ? (
        <div className="surface empty-state">
          <h3>{search ? 'No quizzes found' : 'A world of possibilities'}</h3>
          <p className="muted mt-2">
            {search
              ? 'Try a different search.'
              : 'Be one of the first to publish a personality quiz.'}
          </p>
        </div>
      ) : (
        <div className="quiz-grid">
          {quizzes.map((q) => (
            <Link
              className="surface quiz-tile discover-tile"
              key={q.id}
              href={`/quiz/${q.slug}`}
            >
              <QuizCoverMark emoji={q.emoji} color={q.color} size="sm" />
              <h3>{q.title}</h3>
              <p className="muted">
                {q.description || 'Discover a different side of yourself.'}
              </p>
              <span className="muted">
                {q._count.archetypes} archetypes · {q.completions} completions
              </span>
              <span className="discover-cta">
                Take quiz <ArrowUpRight size={16} />
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
