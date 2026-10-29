'use client'

import Link from 'next/link'
import { ArrowUpRight, ChevronDown, ListChecks, X } from 'lucide-react'
import * as Popover from '@radix-ui/react-popover'
import type { ReactNode } from 'react'
import type { FullQuiz } from '@/lib/personas'
import { getColorSurface, getColorTheme } from '@/lib/colors'
import { QuizCoverMark } from './quiz-cover-mark'
import { ArchetypeBadge, DimensionTag } from './entity-identity'
import { DimensionEndpointLabel } from './dimension-endpoint-label'
import { EntityIcon } from './entity-icon'
import { DimensionTargetSummary } from './dimension-target-summary'

const questionLabels = { MULTIPLE_CHOICE: 'Multiple choice', SLIDER: 'Slider', SCALE: 'Scale' } as const
function ReviewDetail({ trigger, title, children }: { trigger: ReactNode; title: string; children: ReactNode }) {
  return <Popover.Root><Popover.Trigger asChild>{trigger}</Popover.Trigger><Popover.Portal>
    <Popover.Content className="review-detail-popover" sideOffset={8} collisionPadding={16} align="start" aria-label={title}>
      <header><h3>{title}</h3><Popover.Close className="review-detail-close" aria-label="Close details"><X size={16} /></Popover.Close></header>
      <div className="review-detail-body">{children}</div><Popover.Arrow className="review-detail-arrow" />
    </Popover.Content>
  </Popover.Portal></Popover.Root>
}
export function ReviewSummary({ quiz }: { quiz: FullQuiz }) {
  const pages = quiz.pages.filter(p => !p.hidden && p.style !== 'cover' && p.style !== 'results')
  const questions = pages.flatMap(p => p.questions)
  const hidden = quiz.pages.filter(p => p.hidden).length
  const edit = (stage: string, label: string) => <Link className="review-edit-link" href={`/create/${quiz.id}/${stage}`}>{label}<ArrowUpRight size={14} aria-hidden="true" /></Link>
  return <div className="review-summary">
    <section className="review-section review-identity" aria-label="Quiz summary">
      <QuizCoverMark emoji={quiz.emoji} color={quiz.color} />
      <div><span className="review-eyebrow">YOUR QUIZ, AT A GLANCE</span><h2>{quiz.title || 'Untitled quiz'}</h2><p>{quiz.description || 'Add a description to give people a little context.'}</p>
        <div className="review-metadata"><span><EntityIcon kind="dimension" size={14} />{quiz.dimensions.length} dimensions</span><span><EntityIcon kind="archetype" size={14} />{quiz.archetypes.length} archetypes</span><span><ListChecks size={14} />{questions.length} questions</span></div>
      </div>{edit('name', 'Edit name & style')}
    </section>
    <div className="review-section review-composition" role="group" aria-label="Quiz composition">
    <section className="review-summary-section" aria-labelledby="review-dimensions-title">
      <header className="review-section-heading"><div><h2 id="review-dimensions-title"><EntityIcon kind="dimension" size={19} />Dimensions<span className="review-section-count">{quiz.dimensions.length}</span></h2></div>{edit('dimensions', 'Edit dimensions')}</header>
      <div className="review-section-content">{quiz.dimensions.length ? <div className="review-identity-list">{quiz.dimensions.map(d => <ReviewDetail key={d.id} title={d.name} trigger={<button type="button" className="review-dimension-card review-identity-trigger" aria-label={`About dimension ${d.name}`}><DimensionTag name={d.name} emoji={d.emoji} color={d.color} /><ChevronDown size={13} aria-hidden="true" /></button>}>
        <p>{d.description || 'No description added.'}</p>
        <div className="review-dimension-endpoints"><DimensionEndpointLabel label={d.minLabel || 'Low'} emoji={d.minEmoji} end="low" /><DimensionEndpointLabel label={d.maxLabel || 'High'} emoji={d.maxEmoji} end="high" /></div>
        <div className="review-definition-track" style={{ background: getColorSurface(getColorTheme(d.color).value).background }} />
      </ReviewDetail>)}</div> : <p className="review-empty">No dimensions yet. Give your quiz its first facet.</p>}</div>
    </section>
    <section className="review-summary-section" aria-labelledby="review-archetypes-title">
      <header className="review-section-heading"><div><h2 id="review-archetypes-title"><EntityIcon kind="archetype" size={19} />Archetypes<span className="review-section-count">{quiz.archetypes.length}</span></h2></div>{edit('archetypes', 'Edit archetypes')}</header>
      <div className="review-section-content">{quiz.archetypes.length ? <div className="review-identity-list review-cast-list">{quiz.archetypes.map(a => <ReviewDetail key={a.id} title={a.name} trigger={<button type="button" className="review-archetype-card review-identity-trigger" aria-label={`About archetype ${a.name}`}>
        <ArchetypeBadge name={a.name} emoji={a.emoji} color={a.color} size={38} label={false} /><span>{a.name}</span><ChevronDown size={13} aria-hidden="true" />
      </button>}>
        <p>{a.description || 'No description added.'}</p>
        <dl className="review-detail-targets">{quiz.dimensions.map(d => { const target = a.dimensions.find(t => t.dimensionId === d.id); return <div key={d.id}><dt>{d.name}</dt><dd>{target ? <DimensionTargetSummary name={d.name} value={target.targetValue} minLabel={d.minLabel || 'Low'} maxLabel={d.maxLabel || 'High'} minEmoji={d.minEmoji} maxEmoji={d.maxEmoji} color={d.color} importance={target.relevance} /> : 'No target set'}</dd></div> })}</dl>
      </ReviewDetail>)}</div> : <p className="review-empty">No archetypes yet. Your cast is waiting to take shape.</p>}</div>
    </section>
    <section className="review-summary-section" aria-labelledby="review-questions-title">
      <header className="review-section-heading"><div><h2 id="review-questions-title"><ListChecks size={19} />Questions<span className="review-section-count">{questions.length}</span></h2><p>{pages.length} question {pages.length === 1 ? 'page' : 'pages'}{hidden ? ` · ${hidden} hidden ${hidden === 1 ? 'page excluded' : 'pages excluded'}` : ''}.</p></div>{edit('questions', 'Edit questions')}</header>
      <div className="review-section-content"><div className="review-question-overview">{Object.entries(questionLabels).map(([type, label]) => <ReviewDetail key={type} title={label} trigger={<button type="button" className="review-question-trigger" aria-label={`View ${label.toLowerCase()} questions`}><strong>{questions.filter(q => q.type === type).length}</strong>{label}<ChevronDown size={12} aria-hidden="true" /></button>}>
        {questions.some(q => q.type === type) ? <ol className="review-detail-questions">{questions.filter(q => q.type === type).map(q => <li key={q.id}>{q.text || 'Question text missing'}<small>{q.required ? 'Required' : 'Optional'}</small></li>)}</ol> : <p>No {label.toLowerCase()} questions yet.</p>}
      </ReviewDetail>)}
      {pages.length > 0 && <ReviewDetail title="Question pages" trigger={<button type="button" className="review-question-trigger review-pages-trigger">View pages<ChevronDown size={12} aria-hidden="true" /></button>}>
        <div className="review-question-pages">{pages.map((p, index) => <details key={p.id}>
          <summary><span className="review-page-number">{String(index + 1).padStart(2, '0')}</span><strong>{p.title || `Page ${index + 1}`}</strong><span>{p.questions.length} questions</span></summary>
          {p.questions.length ? <ol>{p.questions.map(q => <li key={q.id}><span>{q.text || 'Question text missing'}</span><small>{questionLabels[q.type]} · {q.required ? 'Required' : 'Optional'}</small></li>)}</ol> : <p>This page has no questions yet.</p>}
        </details>)}</div>
      </ReviewDetail>}
      </div></div>
    </section>
    </div>
  </div>
}
