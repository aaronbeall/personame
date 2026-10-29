'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { CircleStop, Copy, ExternalLink, Radio, Rocket } from 'lucide-react'
import type { FullQuiz } from '@/lib/personas'
import { Button } from './ui/button'
import { WhimsyButton } from './whimsy-button'
import { QuizCoverArt } from './quiz-cover-art'
import { EntityIcon } from './entity-icon'

export function PublishWorkspace({ quiz, todoCount, busy, copied, onPublish, onClose, onCopy, reviewHref, preview }: {
  quiz: FullQuiz; todoCount: number; busy: boolean; copied: boolean; onPublish: () => void; onClose: () => void; onCopy: () => void; reviewHref: string; preview: ReactNode
}) {
  const live = quiz.status === 'PUBLISHED'
  const closed = quiz.status === 'CLOSED'
  const released = live || closed
  const questionCount = quiz.pages.filter(page => !page.hidden).reduce((count, page) => count + page.questions.length, 0)
  return <section className="review-section publish-workspace" data-state={live ? 'live' : closed ? 'closed' : 'draft'} aria-labelledby="publish-title">
    <header className="publish-heading"><div><span className="review-eyebrow">{released ? 'OUT IN THE WORLD' : 'READY FOR YOUR PEOPLE?'}</span><h2 id="publish-title">{live ? 'Your quiz is live' : closed ? 'Your quiz is closed' : 'Publish your quiz'}</h2><p>{live ? 'Let the discoveries begin. Your quiz is accepting responses.' : closed ? 'Taking a breather. Past results are still available, and you can reopen anytime.' : 'Send a little self-discovery into the world. Publishing adds your quiz to Explore.'}</p></div>
      {released && <span className="publish-state">{live ? <Radio size={15} /> : <CircleStop size={15} />}{live ? 'Live' : 'Closed'}</span>}
    </header>
    <div className="publish-body">
      <div className="publish-quiz-preview">
        <QuizCoverArt emoji={quiz.emoji} color={quiz.color} />
        <h3>{quiz.title}</h3>
        {quiz.description && <p>{quiz.description}</p>}
        <div className="publish-quiz-stats"><span><EntityIcon kind="dimension" size={13} />{quiz.dimensions.length} dimensions</span><span><EntityIcon kind="archetype" size={13} />{quiz.archetypes.length} types</span><span>{questionCount} questions</span></div>
        {preview}
      </div>
      <section className="publish-settings" aria-labelledby="publish-settings-title"><header className="review-section-heading"><div><h2 id="publish-settings-title">Publish settings<span className="publish-future-label">Coming later</span></h2><p>A peek at what’s next. These settings aren’t saved or applied yet.</p></div></header>
        <fieldset disabled className="publish-settings-grid"><legend className="sr-only">Future publishing controls</legend>
          <label><span>Discoverability</span><select defaultValue="public"><option value="public">Public · Listed in Explore</option><option value="unlisted">Unlisted · Anyone with the link</option><option value="private">Private · Invite only</option></select><small>Choose who can find your quiz.</small></label>
          <label><span>Publish timing</span><select defaultValue="now"><option value="now">Publish immediately</option><option value="scheduled">Schedule a launch</option></select><small>Plan a launch date and time.</small></label>
          <label><span>Closing date</span><input type="datetime-local" /><small>Stop accepting new responses at a set time.</small></label>
          <label><span>Response limit</span><input type="number" min="1" placeholder="No limit" /><small>Close after a set number of responses.</small></label>
        </fieldset>
      </section>
    </div>
    {!released && todoCount > 0 && <div className="publish-readiness" role="status"><span>{todoCount} {todoCount === 1 ? 'item needs' : 'items need'} attention before publishing.</span><Link href={reviewHref}>Review checklist →</Link></div>}
    <footer className="publish-actions"><div className="publish-action-note">{released ? 'Closing pauses new responses. Existing results stay available.' : 'Your quiz will be public and ready to share.'}
      {released && <div className="publish-sharing">{live && <Link className="review-edit-link" href={`/quiz/${quiz.slug}`} target="_blank">Open quiz<ExternalLink size={13} /></Link>}<Button variant="ghost" size="sm" onClick={onCopy}><Copy size={13} />{copied ? 'Copied!' : 'Copy link'}</Button></div>}
      </div>
      {live ? <Button className="publish-close-action" variant="outline" loading={busy} onClick={onClose}><CircleStop size={16} />{busy ? 'Closing…' : 'Close quiz'}</Button> : <WhimsyButton className="publish-main-action" loading={busy} disabled={busy || todoCount > 0} onClick={onPublish}><Rocket size={17} />{busy ? closed ? 'Reopening…' : 'Publishing…' : closed ? 'Reopen quiz' : 'Publish quiz'}</WhimsyButton>}
    </footer>
  </section>
}
