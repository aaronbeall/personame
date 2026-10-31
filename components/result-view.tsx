'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Copy, RotateCcw, Check } from 'lucide-react'
import { Button } from './ui/button'
import { getColorTheme, getBarGradient } from '@/lib/colors'
import type { CSSProperties } from 'react'
import { DimensionEndpointLabel } from './dimension-endpoint-label'
import { EntityIcon } from './entity-icon'
import { ArchetypeBadge, DimensionTag } from './entity-identity'
import { ResultHero } from './result-hero'
import { pagePresentation } from '@/lib/quiz-presentation'
import type { ResultComparison } from '@/lib/result-comparison'
import type { ResultSnapshot } from '@/lib/quiz-scoring'
export function ResultView({
  result,
  preview = false,
  onRetake,
  comparison,
}: {
  result: ResultSnapshot
  preview?: boolean
  comparison?: ResultComparison
  onRetake?: () => void
}) {
  const settings = pagePresentation(result.resultPage?.presentation)
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    root.current?.scrollIntoView({
      block: 'start',
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
    })
  }, [])
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  return (
    <div className="result-view" ref={root}>
      <ResultHero name={result.archetype.name} description={result.archetype.description} emoji={result.archetype.emoji} color={result.resultPage?.color || result.archetype.color} title={result.resultPage?.title} quizTitle={result.quizTitle} presentation={result.resultPage?.presentation} preview={preview} />
      {settings.showDescription && result.resultPage?.description && <p className="result-introduction">{result.resultPage.description}</p>}
      <p className="result-reflection">A reflection of your answers, not a diagnosis or a box to fit into.</p>
      {settings.showComparison && !preview && comparison && comparison.status !== 'disabled' && <section className="surface result-comparison"><h2>Among your fellow quiz takers</h2>{comparison.status === 'ready' ? <><p>{comparison.archetypeShare === null ? 'There aren’t enough matches to your archetype to show a percentage yet.' : `${Math.round(comparison.archetypeShare * 100)}% of other completions shared your archetype.`} Based on {comparison.completions} other completions of this quiz version.</p>{comparison.dimensions.map(d => { const own = result.scores.find(score => score.dimensionId === d.dimensionId); return own && <div className="comparison-row" key={d.dimensionId}><strong>{own.dimensionName}</strong><div className="comparison-track"><span style={{width: `${own.score}%`}} /><i style={{left:`${d.average}%`}} aria-hidden="true" /></div><small>You {Math.round(own.score)} · Average {Math.round(d.average)}</small></div> })}</> : <p className="muted">{comparison.status === 'legacy' ? 'Comparisons aren’t available for this earlier quiz version.' : 'The picture is still taking shape. Comparisons appear after 10 other completions of this quiz version.'}</p>}</section>}
      {settings.showAlternatives && !!result.alternatives?.length && <section className="surface result-alternatives" aria-labelledby="result-alternatives-title">
        <h2 id="result-alternatives-title">{result.ambiguous ? 'A little of both' : 'Other sides of you'}</h2>
        <p className="muted">{result.ambiguous ? 'Your closest results are less than 5 match points apart. The headline is a close call, rather than a clear separation.' : 'These archetypes also share something with your answers.'} Match points describe closeness, not probability or confidence.</p>
        <ul>{result.alternatives.map((a, index) => <li key={`${a.name}-${index}`}><ArchetypeBadge name={a.name} emoji={a.emoji} color={a.color} size={38} label={false} /><div><strong>{a.name}</strong><span>{a.tied ? 'Equally close · ' : ''}{a.matchScore.toFixed(1)} match points</span></div></li>)}</ul>
      </section>}
      {settings.showDimensions && <section className="surface result-dimensions">
        <h2 className="entity-heading">
          <EntityIcon kind="dimension" size={18} />
          Your personality landscape
        </h2>
        <p className="muted">
          Every dimension tells a different part of your story.
        </p>
        {result.scores.map((m) => (
          <div
            className="result-dimension"
            key={m.dimensionId}
            style={
              {
                '--result-bar': getBarGradient(m.color),
                '--result-point': getColorTheme(m.color).colors.at(-1),
              } as CSSProperties
            }
          >
            <div>
              <strong>
                <DimensionTag name={m.dimensionName} color={m.color} />
              </strong>
              <span>{m.evidenceCount === 0 ? 'Not measured' : `${Math.round(m.score)} / 100`}</span>
            </div>
            {m.evidenceCount === 0 ? <p className="muted">You haven’t answered a question measuring this dimension. It wasn’t used to match your result.</p> : <div className="result-dimension-track">
              <meter
                min={0}
                max={100}
                value={m.score}
                aria-label={`${m.dimensionName}: ${Math.round(m.score)} out of 100`}
              />
              <span
                className="result-dimension-point"
                aria-hidden="true"
                style={{ left: `${Math.max(0, Math.min(100, m.score))}%` }}
              />
            </div>}
            {m.evidenceCount !== undefined && m.evidenceCount > 0 && <small className="result-evidence">{m.evidenceCount} {m.evidenceCount === 1 ? 'answer · limited evidence' : 'answers used'}</small>}
            <div className="range-labels">
              <DimensionEndpointLabel
                label={m.minLabel || 'Low'}
                emoji={m.minEmoji}
                end="low"
              />
              <DimensionEndpointLabel
                label={m.maxLabel || 'High'}
                emoji={m.maxEmoji}
                end="high"
              />
            </div>
          </div>
        ))}
      </section>
      }<div className="page-actions">
        {(settings.showRetake || preview) && (onRetake ? (
          <Button variant="outline" onClick={onRetake}>
            <RotateCcw size={16} />
            Try different answers
          </Button>
        ) : (
          <Link className="button-link secondary" href={`/quiz/${result.slug}`}>
            <RotateCcw size={16} />
            Retake quiz
          </Link>
        ))}
        {!preview && settings.showShare && (
          <Button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(location.href)
                setCopied(true)
              } catch {
                setError(
                  'Copy the address from your browser to share this result.',
                )
              }
            }}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}{' '}
            {copied ? 'Link copied' : 'Copy result link'}
          </Button>
        )}
      </div>
      {!preview && (
        <p className="muted mt-3">
          Anyone with your result link can view this result.
        </p>
      )}
      {error && (
        <p role="status" className="muted">
          {error}
        </p>
      )}
    </div>
  )
}
