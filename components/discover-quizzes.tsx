'use client'
import { EntityIcon } from '@/components/entity-icon'
import { QuizCoverMark } from '@/components/quiz-cover-mark'
import { LoadingState } from '@/components/ui/loading'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import Link from 'next/link'
import { requestJson } from '@/lib/client-api'
import { getColorTheme } from '@/lib/colors'
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Search,
} from 'lucide-react'

const completionFormat = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

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

// Editorial shelves for now. A recommendation service can supply these item lists later.
const shelves = [
  {
    id: 'adventure',
    title: 'Follow your curiosity',
    description: 'A small detour into who you could be.',
    art: 'galaxy-expansion',
    terms: /adventure|space|explor|wander|fantasy|city/i,
  },
  {
    id: 'everyday',
    title: 'The wonderfully everyday you',
    description: 'Little habits, familiar comforts, unexpected discoveries.',
    art: 'tree-house',
    terms: /rain|dinner|weekend|creativ|home/i,
  },
  {
    id: 'together',
    title: 'Better with your people',
    description: 'Find your part in the group. Compare notes afterward.',
    art: 'party',
    terms: /team|crew|party|friend|together|social/i,
  },
  {
    id: 'discover',
    title: 'One more discovery',
    description: 'There’s always another side to the story.',
    art: 'islands',
    terms: /./,
  },
]

function QuizShelf({
  id,
  title,
  description,
  art,
  quizzes,
}: {
  id: string
  title: string
  description: string
  art: string
  quizzes: Listing[]
}) {
  const rail = useRef<HTMLUListElement>(null)
  const [bounds, setBounds] = useState({ start: true, end: false })
  useEffect(() => {
    const element = rail.current
    if (!element) return
    const update = () =>
      setBounds({
        start: element.scrollLeft <= 2,
        end:
          element.scrollLeft + element.clientWidth >= element.scrollWidth - 2,
      })
    element.scrollLeft = 0
    update()
    element.addEventListener('scroll', update, { passive: true })
    const observer = new ResizeObserver(update)
    observer.observe(element)
    return () => {
      observer.disconnect()
      element.removeEventListener('scroll', update)
    }
  }, [quizzes])
  const scroll = (direction: number) => {
    const element = rail.current
    if (!element) return
    element.scrollBy({
      left: direction * element.clientWidth * 0.85,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
    })
  }
  return (
    <section className="quiz-shelf" aria-labelledby={`shelf-${id}`}>
      <header className="quiz-shelf-heading" data-reveal="slide">
        <div>
          <h3 id={`shelf-${id}`}>{title}</h3>
          <p>{description}</p>
        </div>
        <div className="quiz-shelf-controls">
          <button
            type="button"
            aria-label={`Previous quizzes in ${title}`}
            aria-controls={`rail-${id}`}
            disabled={bounds.start}
            onClick={() => scroll(-1)}
          >
            <ChevronLeft size={17} />
          </button>
          <button
            type="button"
            aria-label={`Next quizzes in ${title}`}
            aria-controls={`rail-${id}`}
            disabled={bounds.end}
            onClick={() => scroll(1)}
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </header>
      <ul
        ref={rail}
        id={`rail-${id}`}
        className="quiz-shelf-rail"
        tabIndex={0}
        aria-label={title}
      >
        {quizzes.map((quiz, index) => {
          const theme = getColorTheme(quiz.color)
          return (
            <li
              key={`${quiz.id}-${index}`}
              data-reveal="slide"
              style={{ animationDelay: `${(index % 5) * 85 + 90}ms` }}
            >
              <Link className="shelf-quiz" href={`/quiz/${quiz.slug}`}>
                <div
                  className="shelf-quiz-art"
                  aria-hidden="true"
                  style={
                    {
                      '--shelf-color': theme.hex,
                      '--shelf-accent': theme.colors.at(-1),
                    } as CSSProperties
                  }
                >
                  <Image
                    src={`/images/decor/${art}.webp`}
                    fill
                    sizes="280px"
                    alt=""
                    className="shelf-quiz-scene"
                  />
                  <span className="shelf-quiz-category">Personality quiz</span>
                  <QuizCoverMark emoji={quiz.emoji} color={quiz.color} />
                  <span className="shelf-quiz-open">
                    <ArrowUpRight size={17} />
                  </span>
                </div>
                <div className="shelf-quiz-copy">
                  <div className="shelf-quiz-meta">
                    <span className="shelf-type-tag">
                      <EntityIcon kind="archetype" size={12} />
                      {quiz._count.archetypes} personality types
                    </span>
                    <span
                      className="shelf-completions"
                      aria-label={`${quiz.completions.toLocaleString('en')} completions`}
                      title={`${quiz.completions.toLocaleString('en')} completions`}
                    >
                      <CircleCheck size={12} aria-hidden="true" />
                      <span aria-hidden="true">
                        {completionFormat.format(quiz.completions)} completions
                      </span>
                    </span>
                  </div>
                  <h4>{quiz.title}</h4>
                  <p>
                    {quiz.description ||
                      'Discover a different side of yourself.'}
                  </p>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export function DiscoverQuizzes({
  variant = 'home',
}: {
  variant?: 'home' | 'page'
}) {
  const [search, setSearch] = useState('')
  const query = useQuery({
    queryKey: ['discover'],
    queryFn: () => requestJson<Listing[]>('/api/personames'),
  })
  const term = search.trim().toLowerCase()
  const quizzes =
    query.data?.filter((q) =>
      `${q.title} ${q.description || ''}`.toLowerCase().includes(term),
    ) ?? []
  return (
    <section
      id="explore"
      className={`discover-section discover-${variant}`}
      aria-label="Explore quizzes"
      tabIndex={-1}
    >
      <div className="discover-heading" data-reveal>
        {variant === 'home' ? (
          <div>
            <p className="eyebrow">Made by curious people</p>
            <h2>Find a little more of yourself</h2>
            <p className="discover-intro">
              Pick a world to wander into. See who you find.
            </p>
            <Link href="/explore" className="discover-view-all">
              Explore all quizzes <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <div>
            <h2 className="discover-browse-title">Browse quizzes</h2>
            <p className="discover-intro" role="status">
              {query.data
                ? `${quizzes.length} ${quizzes.length === 1 ? 'quiz' : 'quizzes'}${term ? ' found' : ' to discover'}`
                : 'Find your next discovery'}
            </p>
          </div>
        )}
        <label className="discover-search">
          <Search size={16} aria-hidden="true" />
          <input
            type="search"
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
        <div className="notice error" role="alert">
          <p>{query.error.message}</p>
          <button type="button" onClick={() => query.refetch()}>
            Try again
          </button>
        </div>
      ) : !quizzes.length ? (
        <div className="surface empty-state">
          <h3>{term ? 'No quizzes found' : 'A world of possibilities'}</h3>
          <p className="muted mt-2">
            {term
              ? 'Try a different search.'
              : 'Be one of the first to publish a personality quiz.'}
          </p>
        </div>
      ) : term ? (
        <QuizShelf
          id="search"
          title="Your discoveries"
          description={`${quizzes.length} ${quizzes.length === 1 ? 'quiz' : 'quizzes'} found`}
          art="creation"
          quizzes={quizzes}
        />
      ) : (
        shelves.map((shelf, shelfIndex) => {
          const matching = quizzes.filter((q) =>
            shelf.terms.test(`${q.title} ${q.description || ''}`),
          )
          const rest = quizzes.filter((q) => !matching.includes(q))
          const ordered = [...matching, ...rest]
          // Repeat only presentation slots, never quiz records or completion counts.
          const filled = Array.from(
            { length: Math.max(8, ordered.length) },
            (_, i) => ordered[(i + shelfIndex) % ordered.length],
          )
          return <QuizShelf key={shelf.id} {...shelf} quizzes={filled} />
        })
      )}
    </section>
  )
}
