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
import { PageIntro } from './page-intro'
import type { ResultSnapshot } from '@/lib/quiz-scoring'
export function ResultView({
  result,
  preview = false,
  onRetake,
}: {
  result: ResultSnapshot
  preview?: boolean
  onRetake?: () => void
}) {
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
      <PageIntro
        title={result.archetype.name}
        description={
          result.archetype.description ||
          'A little insight into what makes you, you.'
        }
        eyebrow={preview ? 'Your preview result — not saved' : result.quizTitle}
        art="party"
      />
      <div className="result-summary surface">
        <ArchetypeBadge
          name={result.archetype.name}
          emoji={result.archetype.emoji}
          color={result.archetype.color}
          size={88}
          label={false}
        />
        <div>
          <h2 className="entity-heading">
            <EntityIcon kind="archetype" size={18} />
            {result.alternatives?.some(a => a.tied) ? 'One of your closest archetypes' : 'Your closest archetype'}
          </h2>
          <p className="muted">
            A reflection of your answers, not a diagnosis or a box to fit into.
          </p>
        </div>
      </div>
      {!!result.alternatives?.length && <section className="surface result-alternatives" aria-labelledby="result-alternatives-title">
        <h2 id="result-alternatives-title">{result.ambiguous ? 'A little of both' : 'Other sides of you'}</h2>
        <p className="muted">{result.ambiguous ? 'Your closest results are less than 5 match points apart. The headline is a close call, rather than a clear separation.' : 'These archetypes also share something with your answers.'} Match points describe closeness, not probability or confidence.</p>
        <ul>{result.alternatives.map((a, index) => <li key={`${a.name}-${index}`}><ArchetypeBadge name={a.name} emoji={a.emoji} color={a.color} size={38} label={false} /><div><strong>{a.name}</strong><span>{a.tied ? 'Equally close · ' : ''}{a.matchScore.toFixed(1)} match points</span></div></li>)}</ul>
      </section>}
      <section className="surface result-dimensions">
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
      <div className="page-actions">
        {onRetake ? (
          <Button variant="outline" onClick={onRetake}>
            <RotateCcw size={16} />
            Try different answers
          </Button>
        ) : (
          <Link className="button-link secondary" href={`/quiz/${result.slug}`}>
            <RotateCcw size={16} />
            Retake quiz
          </Link>
        )}
        {!preview && (
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
