import type { SpaceMetric } from '@/lib/space-metrics'

export function SpaceMetrics({ label, metrics, note }: { label: string; metrics: SpaceMetric[]; note: string }) {
  return <div className="space-diagnostics" role="group" aria-label={label}>
    <div className="space-diagnostics-grid" data-count={metrics.length}>{metrics.map(metric => <details key={metric.label} className="space-diagnostic" data-status={metric.status}>
      <summary><span className="space-metric-label">{metric.label}<span aria-hidden="true">ⓘ</span></span>
        <span className="space-metric-result"><strong>{metric.value === null ? '—' : metric.value.toFixed(1)}<small>{metric.value === null ? '' : metric.unit === 'pts' ? ' pts' : metric.unit === 'dims' ? ` ${metric.suffix}` : '%'}</small></strong><span className="space-metric-verdict">{metric.verdict}</span></span>
        <span className="space-metric-scale" aria-hidden="true" data-direction={metric.direction} style={{ background: metric.status === 'neutral' ? '#ddd7ef' : `linear-gradient(to right, ${metric.direction === 'higher' ? '#eccbd1' : 'var(--pn-positive-border)'} 0% ${metric.thresholds[0] / (metric.scaleMax ?? 100) * 100}%, #eddfb9 ${metric.thresholds[0] / (metric.scaleMax ?? 100) * 100}% ${metric.thresholds[1] / (metric.scaleMax ?? 100) * 100}%, ${metric.direction === 'higher' ? 'var(--pn-positive-border)' : '#eccbd1'} ${metric.thresholds[1] / (metric.scaleMax ?? 100) * 100}% 100%)` }}>{metric.value !== null && <i style={{ left: `${Math.max(1, Math.min(99, metric.value / (metric.scaleMax ?? 100) * 100))}%` }} />}</span>
      </summary>
      <p>{metric.explanation}<a className="space-metric-reference" href={`/reference/space-metrics#${metric.referenceId}`} target="_blank" rel="noreferrer">Technical reference ↗</a></p>
    </details>)}</div>
    <p className="space-diagnostics-note">{note} Select a number to learn what it means.</p>
  </div>
}
