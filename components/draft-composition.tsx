import Link from 'next/link'
import { Check, X, ListChecks } from 'lucide-react'
import { EntityIcon } from './entity-icon'
import type { OwnedQuizSummary } from '@/lib/quiz-composition'

export function DraftComposition({ quiz }: { quiz: OwnedQuizSummary }) {
  const stages = quiz.composition.stages.filter((stage) =>
    ['dimensions', 'archetypes', 'questions'].includes(stage.key),
  )

  return (
    <div className="draft-composition">
      <ul aria-label={`${quiz.title} composition`}>
        {stages.map((stage) => {
          const complete = stage.state === 'complete'
          const status = complete ? 'complete' : 'incomplete'
          return (
            <li key={stage.key} data-state={status}>
              <Link
                href={`/create/${quiz.id}/${stage.key}`}
                aria-label={`${stage.label}: ${stage.count}, ${status}`}
                title={`${stage.label} — ${complete ? 'Complete' : 'Needs attention'}`}
              >
                <span className="draft-counter-value">
                  <span className="draft-counter-icon" aria-hidden="true">
                    {stage.key === 'dimensions' ? (
                      <EntityIcon kind="dimension" size={15} />
                    ) : stage.key === 'archetypes' ? (
                      <EntityIcon kind="archetype" size={15} />
                    ) : (
                      <ListChecks size={15} strokeWidth={1.75} />
                    )}
                  </span>
                  {stage.count}
                  <span className="draft-counter-status" aria-hidden="true">
                    {complete ? (
                      <Check size={11} strokeWidth={2.5} />
                    ) : (
                      <X size={11} strokeWidth={2.5} />
                    )}
                  </span>
                </span>
                <span className="draft-counter-label">{stage.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
