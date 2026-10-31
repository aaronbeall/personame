'use client'
import { use, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { ChevronDown, Check, ArrowRight, CheckCircle2, Rocket, Radio, CircleStop, ScanEye, ListChecks, ChartNoAxesCombined } from 'lucide-react'
import { useProtectedPage } from '@/hooks/use-protected-page'
import { AppLayoutBackground } from '@/components/app-layout-background'
import { StepProgress } from '@/components/step-progress'
import { QuizPreviewDialog } from '@/components/quiz-preview-dialog'
import { PublishCelebration } from '@/components/publish-celebration'
import { PublishWorkspace } from '@/components/publish-workspace'
import { UrlTabs } from '@/components/ui/url-tabs'
import { useUrlTab } from '@/hooks/use-url-tab'
import { REVIEW_TABS } from '@/lib/review-workspace'
import { ReviewSummary } from '@/components/review-summary'
import { QuestionSpace } from '@/components/question-space'
import { TargetsImportance } from '@/components/targets-importance'
import { ArchetypeSpace } from '@/components/archetype-space'
import { LoadingState } from '@/components/ui/loading'
import { EntityIcon, type EntityKind } from '@/components/entity-icon'
import { requestJson } from '@/lib/client-api'
import { readinessByStage } from '@/lib/quiz-validation'
import type { FullQuiz, publicQuiz } from '@/lib/personas'
type ReviewQuiz = FullQuiz & { issues: string[] }
const stages = [
  { key: 'name', label: 'Name', icon: 'quiz' },
  { key: 'dimensions', label: 'Dimensions', icon: 'dimension' },
  { key: 'archetypes', label: 'Archetypes', icon: 'archetype' },
  { key: 'questions', label: 'Questions', icon: null },
] as const
export default function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const status = useProtectedPage()
  const cache = useQueryClient()
  const query = useQuery({ queryKey: ['review', id], queryFn: () => requestJson<ReviewQuiz>(`/api/personames/${id}`), enabled: status === 'authenticated', retry: false })
  const { tab, setTab, hrefFor } = useUrlTab(REVIEW_TABS, 'review')
  const [celebrating, setCelebrating] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [checklistExpanded, setChecklistExpanded] = useState(false)
  const quiz = query.data
  const refresh = () => Promise.all(['review', 'progress', 'personal', 'discover'].map(key => cache.invalidateQueries({ queryKey: key === 'review' || key === 'progress' ? [key, id] : [key] })))
  const mutate = async (action: 'publish' | 'close') => {
    setBusy(true); setError('')
    try {
      if (action === 'publish') await requestJson(`/api/personames/${id}/publish`, { method: 'POST' })
      else await requestJson(`/api/personames/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'CLOSED' }) })
      await refresh()
      if (action === 'publish' && quiz?.status === 'DRAFT') setCelebrating(true)
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to update your quiz.') }
    finally { setBusy(false) }
  }
  if (!quiz) return <AppLayoutBackground><div className="review-page">{query.error ? <p role="alert" className="notice error">{query.error.message}</p> : <LoadingState label="Preparing your review…" />}</div></AppLayoutBackground>
  const issues = readinessByStage(quiz)
  const todoCount = Object.values(issues).reduce((count, list) => count + new Set(list).size, 0)
  const publishState = quiz.status === 'PUBLISHED' ? 'live' : quiz.status === 'CLOSED' ? 'closed' : todoCount === 0 ? 'ready' : 'incomplete'
  const publishDescription = { live: 'Live · accepting responses', closed: 'Closed · not accepting responses', ready: 'Ready to publish', incomplete: 'Finish the publishing checklist first' }[publishState]
  const playerQuiz = { id: quiz.id, title: quiz.title, description: quiz.description, slug: quiz.slug, emoji: quiz.emoji, color: quiz.color, revision: new Date(quiz.updatedAt).toISOString(), pages: quiz.pages.filter(p => !p.hidden) } satisfies ReturnType<typeof publicQuiz>
  return <AppLayoutBackground><div className="review-page">
    <PublishCelebration key={celebrating ? 'celebrating' : 'idle'} open={celebrating} onOpenChange={setCelebrating} title={quiz.title} slug={quiz.slug} emoji={quiz.emoji} color={quiz.color} />
    <StepProgress title="Review & publish" description="Check your quiz, explore your model, and share it with your people." />
    {error && <div role="alert" className="notice error">{error}</div>}
    <UrlTabs id="review-workspace" label="Quiz workspace" value={tab} onValueChange={value => { void setTab(value) }} items={[
      { value: 'review', label: 'Review', icon: <ScanEye size={16} /> },
      { value: 'analyze', label: 'Analyze', icon: <ChartNoAxesCombined size={16} /> },
      { value: 'publish', label: 'Publish', className: `publish-tab publish-tab-${publishState}`, description: publishDescription, icon: <Rocket size={16} aria-hidden="true" />, badge: (publishState === 'live' || publishState === 'closed') ? <span className="publish-tab-badge" aria-hidden="true">{publishState === 'live' ? <Radio size={11} /> : <CircleStop size={11} />}</span> : undefined },
    ]} />
    <div role="tabpanel" id={`review-workspace-panel-${tab}`} aria-labelledby={`review-workspace-tab-${tab}`} tabIndex={0}>
    {tab === 'review' && <>
    {quiz.status === 'DRAFT' && <section className="review-todos" data-ready={todoCount === 0} aria-labelledby="review-todos-title">
      {todoCount === 0 ? <header className="review-ready-header">
        <CheckCircle2 className="review-ready-icon" size={24} aria-hidden="true" />
        <div><h2 id="review-todos-title">Ready to publish</h2><p>All {stages.length} checks complete.</p></div>
        <div className="review-ready-actions"><button type="button" className="review-checklist-toggle" aria-expanded={checklistExpanded} aria-controls="review-checklist-items" onClick={() => setChecklistExpanded(expanded => !expanded)}>{checklistExpanded ? 'Hide checklist' : 'Show checklist'}<ChevronDown size={15} aria-hidden="true" /></button>
          <Link className="button-link review-ready-publish" href={hrefFor('publish')}><Rocket size={16} />Continue to Publish</Link>
        </div>
      </header> : <header><span className="review-task-heading-icon"><ListChecks size={21} /></span><div><h2 id="review-todos-title">Your publishing checklist</h2><p>{todoCount} {todoCount === 1 ? 'item left' : 'items left'} to finish before publishing.</p></div><span className="review-checklist-progress">{stages.filter(stage => !issues[stage.key].length).length}<span> / {stages.length} ready</span></span></header>}
      <ul className="review-checklist" id="review-checklist-items" hidden={todoCount === 0 && !checklistExpanded}>
      {stages.map(stage => {
        const unique = [...new Set(issues[stage.key])]
        const complete = unique.length === 0
        return <li key={stage.key} className="review-task" data-complete={complete} aria-label={`${stage.label}: ${complete ? 'complete' : 'incomplete'}`}>
          <span className="review-task-check" aria-hidden="true">{complete ? <Check size={14} strokeWidth={2.5} /> : '!'}</span>
          <div><h3><span className="review-task-category" aria-hidden="true">{stage.icon ? <EntityIcon kind={stage.icon as EntityKind} size={16} /> : <ListChecks size={16} />}</span>{stage.label}<span className="review-task-status">{complete ? 'Done' : `${unique.length} to do`}</span></h3>
            {complete ? <p className="review-task-done">{({ name: 'Your quiz has a name.', dimensions: 'Your dimensions are defined.', archetypes: 'Your archetypes and targets are set.', questions: 'Your questions and scoring are ready.' })[stage.key]}</p> : <><ul>{unique.slice(0, 3).map(issue => <li key={issue}>{issue}</li>)}</ul>
            {unique.length > 3 && <details><summary>{unique.length - 3} more to finish</summary><ul>{unique.slice(3).map(issue => <li key={issue}>{issue}</li>)}</ul></details>}</>}
          </div><Link href={`/create/${id}/${stage.key}`} className="review-task-action">{complete ? 'Edit' : 'Finish'} {stage.label.toLowerCase()}<ArrowRight size={15} /></Link>
        </li>
      })}
      </ul>
    </section>}
    {quiz.status !== 'DRAFT' && <div className="review-live" role="status"><CheckCircle2 size={20} /><div><strong>{quiz.status === 'CLOSED' ? 'Your quiz is closed' : 'Your quiz is live'}</strong><p>{quiz.status === 'CLOSED' ? 'Past results are still available.' : 'Ready for your people.'}</p></div><Link href={hrefFor('publish')} className="review-edit-link">Manage publishing →</Link></div>}
    <ReviewSummary quiz={quiz} preview={<QuizPreviewDialog quiz={playerQuiz} />} />
    {todoCount > 0 && quiz.status === 'DRAFT' && <p className="review-publish-guidance">Finish the to-do items above to unlock publishing. <Link href={hrefFor('publish')}>Publish settings →</Link></p>}
    </>}
    {tab === 'analyze' && <div className="review-analysis-stack" key={quiz.updatedAt.toString()}><ArchetypeSpace dimensions={quiz.dimensions} archetypes={quiz.archetypes} /><TargetsImportance dimensions={quiz.dimensions} archetypes={quiz.archetypes} /><QuestionSpace quiz={quiz} /></div>}
    {tab === 'publish' && <PublishWorkspace quiz={quiz} todoCount={todoCount} busy={busy} copied={copied} reviewHref={hrefFor('review')} onPublish={() => { void mutate('publish') }} preview={<QuizPreviewDialog quiz={playerQuiz} />} onClose={() => { void mutate('close') }} onCopy={async () => { try { await navigator.clipboard.writeText(`${location.origin}/quiz/${quiz.slug}`); setCopied(true) } catch { setError('Copy the quiz address from your browser.') } }} />}
    </div>
  </div></AppLayoutBackground>
}
