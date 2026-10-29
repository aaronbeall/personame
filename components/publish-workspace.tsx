'use client'

import Link from 'next/link'
import { CheckCircle2, Copy, ExternalLink, Rocket } from 'lucide-react'
import type { FullQuiz } from '@/lib/personas'
import { Button } from './ui/button'
import { QuizCoverMark } from './quiz-cover-mark'

export function PublishWorkspace({ quiz, todoCount, busy, copied, onPublish, onUnpublish, onCopy, reviewHref }: {
  quiz: FullQuiz; todoCount: number; busy: boolean; copied: boolean; onPublish: () => void; onUnpublish: () => void; onCopy: () => void; reviewHref: string
}) {
  const live = quiz.status === 'PUBLISHED'
  return <div className="publish-workspace">
    <section className="review-section publish-launch" data-live={live} aria-labelledby="publish-title">
      <QuizCoverMark emoji={quiz.emoji} color={quiz.color} />
      <div className="publish-launch-copy"><span className="review-eyebrow">{live ? 'OUT IN THE WORLD' : 'READY FOR YOUR PEOPLE?'}</span><h2 id="publish-title">{live ? 'Your quiz is live' : 'Publish your quiz'}</h2><p>{live ? 'Anyone with the link can take it. Unpublishing returns it to a private draft.' : 'Publishing makes your quiz public and adds it to Explore.'}</p><strong className="publish-quiz-name">{quiz.title}</strong></div>
      <Button className="publish-main-action" size="lg" variant={live ? 'outline' : 'default'} loading={busy} disabled={busy || (!live && todoCount > 0)} onClick={live ? onUnpublish : onPublish}>{live ? <CheckCircle2 size={19} /> : <Rocket size={19} />}{busy ? live ? 'Unpublishing…' : 'Publishing…' : live ? 'Unpublish quiz' : 'Publish quiz'}</Button>
      {!live && todoCount > 0 && <div className="publish-readiness" role="status"><span>{todoCount} {todoCount === 1 ? 'item needs' : 'items need'} attention before publishing.</span><Link href={reviewHref}>Review checklist →</Link></div>}
      {live && <div className="publish-sharing"><Link className="button-link secondary" href={`/quiz/${quiz.slug}`} target="_blank">Open quiz<ExternalLink size={14} /></Link><Button variant="ghost" onClick={onCopy}><Copy size={14} />{copied ? 'Copied!' : 'Copy link'}</Button></div>}
    </section>
    <section className="review-section publish-settings" aria-labelledby="publish-settings-title"><header className="review-section-heading"><div><h2 id="publish-settings-title">Publish settings<span className="publish-future-label">Coming later</span></h2><p>These controls are a preview and are not saved or applied. Publishing currently makes a quiz public immediately.</p></div></header>
      <fieldset disabled className="publish-settings-grid"><legend className="sr-only">Future publishing controls</legend>
        <label><span>Discoverability</span><select defaultValue="public"><option value="public">Public · Listed in Explore</option><option value="unlisted">Unlisted · Anyone with the link</option><option value="private">Private · Invite only</option></select><small>Choose who can find and take your quiz.</small></label>
        <label><span>Publish timing</span><select defaultValue="now"><option value="now">Publish immediately</option><option value="scheduled">Schedule a launch</option></select><small>Set a launch date and time.</small></label>
        <label><span>Closing date</span><input type="datetime-local" /><small>Optionally stop accepting responses at a set time.</small></label>
        <label><span>Response limit</span><input type="number" min="1" placeholder="No limit" /><small>Optionally close the quiz after a response limit.</small></label>
      </fieldset>
    </section>
  </div>
}
