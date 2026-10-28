'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowLeft, Check, ChevronRight } from 'lucide-react'
import { EntityIcon, type EntityKind } from './entity-icon'
import { PageIntro } from './page-intro'
interface Step {
  number: number
  label: string
  active?: boolean
  completed?: boolean
}
export function StepProgress({
  title,
  description,
}: {
  steps: Step[]
  title: string
  description: string
}) {
  const path = usePathname()
  const id = path.split('/')[2]
  const stages = [
    ['name', 'Name', 'creation'],
    ['dimensions', 'Dimensions', 'science'],
    ['archetypes', 'Archetypes', 'islands'],
    ['questions', 'Questions', 'creation'],
    ['preview', 'Preview & publish', 'galaxy-expansion'],
  ]
  const active = Math.max(
    0,
    stages.findIndex(([slug]) => path.endsWith(slug)),
  )
  return (
    <>
      <Link href="/dashboard" className="back-link">
        <ArrowLeft size={14} strokeWidth={1.75} aria-hidden="true" />
        <span>Your quizzes</span>
      </Link>
      <nav className="builder-steps" aria-label="Quiz creation steps">
        {stages.map(([slug, label], i) => (
          <Link
            key={slug}
            href={`/create/${id}/${slug}`}
            aria-current={i === active ? 'step' : undefined}
          >
            <span>{i < active ? <Check size={14} /> : i + 1}</span>
            <span className="step-text">
              {i < 3 && (
                <EntityIcon
                  kind={(['quiz', 'dimension', 'archetype'] as EntityKind[])[i]}
                  size={13}
                />
              )}{' '}
              {label}
            </span>
            {i < stages.length - 1 && (
              <ChevronRight className="step-chevron" size={14} />
            )}
          </Link>
        ))}
      </nav>
      <PageIntro
        title={title}
        description={description}
        art={stages[active][2]}
      />
    </>
  )
}
