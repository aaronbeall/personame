'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, LoaderCircle } from 'lucide-react'
import type { FullQuiz } from '@/lib/personas'
import { questionSpaceMetrics } from '@/lib/space-metrics'
import { SpaceMetrics } from './space-metrics'
import type { QuestionSpaceAnalysis } from '@/lib/question-space'
import { getColorTheme } from '@/lib/colors'
import { ArchetypeBadge, getArchetypeTheme } from './entity-identity'

type Quiz = Pick<FullQuiz, 'id' | 'updatedAt' | 'dimensions' | 'archetypes' | 'pages'>
const percent = (value: number) => `${(value * 100).toFixed(1)}%`
const short = (text: string, length = 27) => text.length > length ? `${text.slice(0, length - 1)}…` : text

function QuestionFlow({ quiz, analysis }: { quiz: Quiz; analysis: QuestionSpaceAnalysis }) {
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState<string>()
  const questions = analysis.questions.slice(page * 8, page * 8 + 8)
  const active = questions.find(q => q.id === selected) ?? questions[0]
  const height = Math.max(questions.length, quiz.dimensions.length, quiz.archetypes.length, 2) * 36 + 50
  const y = (index: number, count: number) => 52 + index * (height - 78) / Math.max(1, count - 1)
  const maxSpan = Math.max(1, ...questions.flatMap(q => q.axes.map(d => d.span)))
  return <div className="question-flow">
    <div className="question-space-subheading"><div><h3>Follow the questions</h3><p>Select a question to trace its scoring links.</p></div>{analysis.questions.length > 8 && <div className="atlas-preview-paging"><button type="button" aria-label="Previous questions" disabled={!page} onClick={() => setPage(p => p - 1)}><ChevronLeft size={14} /></button><span>{page + 1} / {Math.ceil(analysis.questions.length / 8)}</span><button type="button" aria-label="Next questions" disabled={(page + 1) * 8 >= analysis.questions.length} onClick={() => setPage(p => p + 1)}><ChevronRight size={14} /></button></div>}</div>
    <div className="question-flow-scroll" role="region" aria-label="Question influence map" tabIndex={0}>
      <svg viewBox={`0 0 880 ${height}`} style={{ height }} role="group" aria-label="Questions connect to dimensions and archetype priorities">
        <text x={12} y={18} className="question-flow-heading">QUESTIONS</text><text x={355} y={18} className="question-flow-heading">DIMENSIONS</text><text x={645} y={18} className="question-flow-heading">ARCHETYPE PRIORITIES</text>
        {questions.flatMap((q, qi) => q.axes.flatMap((axis, di) => axis.span > 0 ? <path key={`${q.id}-${axis.id}`} d={`M 260 ${y(qi, questions.length)} C 305 ${y(qi, questions.length)}, 305 ${y(di, quiz.dimensions.length)}, 345 ${y(di, quiz.dimensions.length)}`} fill="none" stroke={getColorTheme(quiz.dimensions[di].color).hex} strokeWidth={1 + 5 * axis.span / maxSpan} opacity={q.id === active?.id ? .8 : .09}><title>{q.text} → {quiz.dimensions[di].name}: {axis.span.toFixed(1)} points of answer swing</title></path> : []))}
        {quiz.archetypes.flatMap((a, ai) => a.dimensions.flatMap(t => {
          const di = quiz.dimensions.findIndex(d => d.id === t.dimensionId)
          if (di < 0 || t.relevance <= 0) return []
          const highlighted = (active?.axes[di].span ?? 0) > 0
          return <path key={`${a.id}-${t.dimensionId}`} d={`M 525 ${y(di, quiz.dimensions.length)} C 580 ${y(di, quiz.dimensions.length)}, 580 ${y(ai, quiz.archetypes.length)}, 630 ${y(ai, quiz.archetypes.length)}`} fill="none" stroke={getColorTheme(quiz.dimensions[di].color).hex} strokeWidth={1 + t.relevance * 3} opacity={highlighted ? .55 : .08}><title>{quiz.dimensions[di].name} → {a.name}: {Math.round(t.relevance * 100)}% importance</title></path>
        }))}
        {questions.map((q, index) => <g key={q.id} role="button" tabIndex={0} aria-label={`Trace question ${page * 8 + index + 1}: ${q.text}`} aria-pressed={active?.id === q.id} className="question-flow-question" onClick={() => setSelected(q.id)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelected(q.id) } }}>
          <title>{q.text}</title><rect x={8} y={y(index, questions.length) - 13} width={252} height={27} rx={7} /><text x={17} y={y(index, questions.length) + 4}>{String(page * 8 + index + 1).padStart(2, '0')} · {short(q.text, 32)}</text>
        </g>)}
        {quiz.dimensions.map((d, index) => <g key={d.id}><title>{d.name}</title><rect x={345} y={y(index, quiz.dimensions.length) - 13} width={180} height={27} rx={7} fill="white" stroke={getColorTheme(d.color).hex} /><circle cx={357} cy={y(index, quiz.dimensions.length)} r={3} fill={getColorTheme(d.color).hex} /><text x={368} y={y(index, quiz.dimensions.length) + 4}>{short(d.name, 23)}</text></g>)}
        {quiz.archetypes.map((a, index) => <g key={a.id}><title>{a.name}</title><rect x={630} y={y(index, quiz.archetypes.length) - 13} width={240} height={27} rx={7} fill="white" stroke="#e2deec" /><circle cx={642} cy={y(index, quiz.archetypes.length)} r={4} fill={getArchetypeTheme(a.color, a.name).hex} /><text x={653} y={y(index, quiz.archetypes.length) + 4}>{short(a.name, 31)}</text></g>)}
      </svg>
    </div>
    {active && <div className="question-trace-detail"><strong>{active.text}</strong><span>{active.type === 'MULTIPLE_CHOICE' ? `${active.options} choices` : active.type === 'SLIDER' ? '101 slider positions' : `${active.options} scale points`} · {active.axes.filter(a => a.span > 0).length} dimensions vary</span><div>{active.axes.filter(a => a.span > 0 || a.mean !== 0).map(a => <span key={a.id}>{quiz.dimensions.find(d => d.id === a.id)?.name}: <b>{a.min > 0 ? '+' : ''}{a.min.toFixed(0)} → {a.max > 0 ? '+' : ''}{a.max.toFixed(0)}</b></span>)}</div></div>}
    <p className="question-space-note">Left: how much answers can change a score. Right: how much each dimension matters to an archetype. Thicker lines mean a stronger link on that side.</p>
  </div>
}

function AnalysisContent({ quiz, analysis: a }: { quiz: Quiz; analysis: QuestionSpaceAnalysis }) {
  const unmapped = a.questions.filter(q => !q.axes.some(axis => axis.span > 0))
  const unmeasured = a.axes.filter(d => !d.questions)
  const outside = a.outcomes.filter(o => o.outside.length)
  const inactive = a.outcomes.filter(o => !o.active)
  return <>
    <SpaceMetrics label="Question space metrics" metrics={questionSpaceMetrics(a)} note={`${a.questions.length} questions · ${a.axes.filter(d => d.questions).length}/${quiz.dimensions.length} dimensions change with the answers. These checks assume every answer has an equal chance, not that real people choose at random.`} />
    {!!(unmapped.length || unmeasured.length || outside.length || inactive.length || a.invalid.length) && <details className="question-space-findings"><summary>{[a.invalid.length && `${a.invalid.length} invalid questions`, unmapped.length && `${unmapped.length} constant questions`, unmeasured.length && `${unmeasured.length} fixed dimensions`, outside.length && `${outside.length} targets outside axis ranges`, inactive.length && `${inactive.length} archetypes without active targets`].filter(Boolean).join(' · ')}</summary><ul>
      {a.invalid.length > 0 && <li>Fix questions without valid answer options before outcome estimates can run.</li>}
      {unmapped.map(q => <li key={q.id}>“{q.text}” gives the same scores for every answer. It won’t help tell people apart, though it can shift everyone’s scores.</li>)}
      {unmeasured.map(axis => <li key={axis.id}>{quiz.dimensions.find(d => d.id === axis.id)?.name} stays at {axis.min.toFixed(0)} across all answers.</li>)}
      {outside.map(o => <li key={o.id}>{quiz.archetypes.find(ar => ar.id === o.id)?.name}: {o.outside.map(id => quiz.dimensions.find(d => d.id === id)?.name).join(', ')} setting is outside the scores your questions can reach. People can still get this result if it is the closest match.</li>)}
      {inactive.map(o => <li key={o.id}>{quiz.archetypes.find(ar => ar.id === o.id)?.name} has no dimensions with importance above zero. Add one so it can be matched properly.</li>)}
    </ul><Link href={`/create/${quiz.id}/questions`}>Edit question scoring →</Link></details>}
    {a.questions.length > 0 && quiz.dimensions.length > 0 ? <QuestionFlow quiz={quiz} analysis={a} /> : <p className="review-empty">Add visible questions and dimensions to map your question space.</p>}
    <div className="question-space-results">
      <section aria-labelledby="question-reach-title"><div className="question-space-subheading"><div><h3 id="question-reach-title">Where answers can take you</h3><p>The scores your questions can produce, and where results tend to gather.</p></div></div>
        {a.axes.map((axis, i) => { const d = quiz.dimensions[i], color = getColorTheme(d.color).hex, peak = Math.max(1, ...axis.bins)
          return <div className="question-reach" key={axis.id}><div><strong>{d.emoji} {d.name}</strong><span>{axis.questions} varying questions · {axis.min.toFixed(0)}–{axis.max.toFixed(0)}</span></div>
            <svg viewBox="0 0 400 58" role="img" aria-label={`${d.name}: reachable from ${axis.min.toFixed(1)} to ${axis.max.toFixed(1)}; ${a.count ? `${percent(axis.clipped / a.count)} of answer paths clipped beyond 0 or 100` : 'outcome distribution unavailable'}`}>
              <rect x={10} y={38} width={380} height={4} rx={2} fill="#eeebf4" />
              {a.count > 0 && axis.bins.map((count, bin) => <rect key={bin} x={10 + bin * 38} y={35 - count / peak * 25} width={35} height={count / peak * 25} rx={2} fill={color} opacity={.38}><title>{bin * 10} ≤ score {bin === 9 ? '≤ 100' : `< ${(bin + 1) * 10}`}: {percent(count / a.count)} of paths</title></rect>)}
              <line x1={10 + axis.min * 3.8} x2={10 + axis.max * 3.8} y1={40} y2={40} stroke={color} strokeWidth={4} strokeLinecap="round" />
              {quiz.archetypes.map(ar => { const t = ar.dimensions.find(t => t.dimensionId === d.id && t.relevance > 0); return t ? <path key={ar.id} d={`M ${10 + t.targetValue * 3.8} 34 l 5 6 l -5 6 l -5 -6 Z`} fill={getArchetypeTheme(ar.color, ar.name).hex} stroke="white" strokeWidth={1}><title>{ar.name}: {t.targetValue} target</title></path> : null })}
              <text x={10} y={57}>0</text><text x={390} y={57} textAnchor="end">100</text>
            </svg><div className="question-reach-ends"><span>{d.minEmoji} {d.minLabel || 'Low'}</span><span>{d.maxEmoji} {d.maxLabel || 'High'}</span></div>
            {a.count > 0 && <small>Mean {axis.mean.toFixed(1)} · {percent(axis.clipped / a.count)} of scores stopped at the limit</small>}
          </div>
        })}
        <p className="question-space-note">Diamonds mark your archetype settings. The bars show where scores gather when every answer gets an equal chance. Reaching one end of a dimension may rule out reaching another.</p>
      </section>
      <section aria-labelledby="question-outcomes-title"><div className="question-space-subheading"><div><h3 id="question-outcomes-title">Who might you become?</h3><p>{a.count ? `${a.exact ? 'All' : 'A sample of'} ${a.count.toLocaleString()} answer combinations, with every answer given an equal chance.` : 'Add valid questions, dimensions and archetypes to estimate outcomes.'}</p></div></div>
        {a.outcomes.slice().sort((left, right) => right.probability - left.probability).map(o => { const ar = quiz.archetypes.find(archetype => archetype.id === o.id)!, theme = getArchetypeTheme(ar.color, ar.name)
          return <div className="question-outcome" key={o.id}><div className="question-outcome-identity"><ArchetypeBadge name={ar.name} emoji={ar.emoji} color={ar.color} size={30} label={false} /><strong>{ar.name}</strong><b>{a.count ? percent(o.probability) : '—'}</b></div>
            <div className="question-probability" role="img" aria-label={`${ar.name}: ${a.count ? `${percent(o.probability)} outcome share${!a.exact ? `; 95% Monte Carlo interval ${percent(o.interval[0])} to ${percent(o.interval[1])}` : '; exact'}` : 'not calculated'}`}><span style={{ width: percent(o.probability), background: theme.hex }} /></div>
            <div className="question-outcome-meta"><span>{a.count && !a.exact ? `Estimate range ${percent(o.interval[0])}–${percent(o.interval[1])}` : a.count ? `${o.wins.toLocaleString()} paths` : 'Not calculated'}</span><span>{o.coverage === null ? 'No active targets' : `${Math.round(o.coverage * 100)}% targets in range`}</span></div>
            {a.count > 0 && !o.wins && <p className="question-space-note">{a.exact ? 'No answer combination produces this result.' : 'Not seen in this sample; rare outcomes may still be possible.'}</p>}
          </div>
        })}
        <p className="question-space-note">“Targets in range” checks how much of each archetype’s settings your questions can reach, giving more important settings more weight. It checks one dimension at a time; all the settings might not be reachable together.</p>
      </section>
    </div>
    <details className="question-space-method"><summary>How to read these numbers</summary><div>
      <p>Think of this as trying lots of ways to answer your quiz. We give each answer an equal chance and answer every question, including optional ones. Your real audience may choose very differently.</p>
      <p>For small quizzes we try every combination. For larger ones we try a repeatable sample. The ranges beside the results show how much those estimates could shift with more combinations. A result that never appears in a sample may still be possible.</p>
      <p>Use these checks to spot surprises, not to chase a perfect score. A rare archetype or a quiz focused on one part of the map can be exactly what you want.</p>
      <a href="/reference/space-metrics#question-model" target="_blank" rel="noreferrer">Technical reference: calculations, assumptions &amp; sources ↗</a>
    </div></details>
  </>
}

export function QuestionSpace({ quiz }: { quiz: Quiz }) {
  const [result, setResult] = useState<{ analysis?: QuestionSpaceAnalysis; error?: string }>()
  useEffect(() => {
    const worker = new Worker(new URL('../lib/question-space.worker.ts', import.meta.url))
    worker.onmessage = (event: MessageEvent<NonNullable<typeof result>>) => setResult(event.data)
    worker.onerror = () => setResult({ error: 'Analysis could not load. Reload this page to try again.' })
    worker.postMessage({ dimensions: quiz.dimensions, archetypes: quiz.archetypes, pages: quiz.pages })
    return () => worker.terminate()
  }, [quiz])
  return <section className="review-section question-space" aria-labelledby="question-space-title"><header className="review-section-heading"><div><span className="review-eyebrow">BEHIND THE ANSWERS</span><h2 id="question-space-title">Your question space</h2><p>See what your questions measure, where they lead, and which selves they make possible.</p></div></header>
    {result?.analysis ? <AnalysisContent quiz={quiz} analysis={result.analysis} /> : result?.error ? <p role="alert">{result.error}</p> : <p className="question-space-loading" role="status"><LoaderCircle size={15} className="animate-spin" />Mapping questions and scoring answer paths…</p>}
  </section>
}
