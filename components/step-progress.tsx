'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Check, ChevronRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { requestJson } from '@/lib/client-api'
import type { QuizComposition } from '@/lib/quiz-composition'
import { EntityIcon, type EntityKind } from './entity-icon'
import { PageIntro } from './page-intro'
export function StepProgress({
  title,
  description,
  compact = false,
}: {
  title: string
  description: string
  compact?: boolean
}) {
  const path = usePathname()
  const id = path.split('/')[2]
  const { status } = useSession()
  // Fetch only saved readiness, rather than transferring the full authoring model.
  const progressQuery = useQuery({
    queryKey: ['progress', id],
    queryFn: () => requestJson<QuizComposition>(`/api/personames/${id}/progress`),
    enabled: !!id && status === 'authenticated',
    retry: false,
  })
  const composition = progressQuery.data
  const stages = [
    ['name', 'Name', 'creation'],
    ['dimensions', 'Dimensions', 'science'],
    ['archetypes', 'Archetypes', 'islands'],
    ['questions', 'Questions', 'pirate-ship'],
    ['preview', 'Review & publish', 'galaxy-expansion'],
  ]
  const active = Math.max(
    0,
    stages.findIndex(([slug]) => path.endsWith(slug)),
  )
  return (
    <>
      <nav className="builder-steps" aria-label="Quiz creation steps">
        {stages.map(([slug, label], i) => {
          const stage = composition?.stages.find((stage) => stage.key === slug)
          const completion = !stage
            ? 'unknown'
            : stage.state === 'complete'
              ? 'complete'
              : slug === 'preview'
                ? 'pending'
                : 'incomplete'
          const showCount = stage && i > 0 && i < 4 && i <= active
          return (
            <Link
              key={slug}
              href={`/create/${id}/${slug}`}
              aria-current={i === active ? 'step' : undefined}
              data-completion={completion}
              data-position={i < active ? 'past' : i === active ? 'current' : 'future'}
              title={
                completion === 'unknown'
                  ? progressQuery.isError
                    ? 'Saved progress unavailable'
                    : 'Checking saved progress…'
                  : `${label}: ${completion === 'pending' ? 'not published' : completion} (saved)`
              }
            >
              <span className="step-marker" aria-hidden="true">
                {i >= active ? (
                  i + 1
                ) : completion === 'complete' ? (
                  <Check size={14} />
                ) : (
                  i + 1
                )}
              </span>
              <span className="step-text">
                {i < 3 && (
                  <EntityIcon
                    kind={(['quiz', 'dimension', 'archetype'] as EntityKind[])[i]}
                    size={13}
                  />
                )}{' '}
                {label}
                {showCount && (
                  <span className="step-count" aria-hidden="true">{stage.count}</span>
                )}
                <span className="sr-only">
                  {showCount ? `, ${stage.count} saved` : ''}
                  {completion !== 'unknown' ? `, ${completion === 'pending' ? 'not published' : completion}` : ''}
                </span>
              </span>
              {i < stages.length - 1 && (
                <ChevronRight className="step-chevron" size={14} />
              )}
            </Link>
          )
        })}
      </nav>
      {!compact && <PageIntro
        title={title}
        description={description}
        art={stages[active][2]}
      />}
    </>
  )
}
