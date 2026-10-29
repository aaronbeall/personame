'use client'

import type { FullQuiz } from '@/lib/personas'
import { atlasMarkerRadius, projectTarget } from '@/lib/archetype-map'
import { projectAtlasPreview } from '@/lib/atlas-camera'
import { getColorTheme } from '@/lib/colors'
import { getArchetypeTheme } from './entity-identity'

type Dimension = FullQuiz['dimensions'][number]
type Archetype = FullQuiz['archetypes'][number]
type ChartProps = { dimensions: Dimension[]; archetypes: Archetype[]; selectedId?: string; onSelect?: (id: string) => void; mini?: boolean }
const shortName = (name: string, max = 25) => name.length > max ? `${name.slice(0, max - 1)}…` : name
const endLabel = (dimension: Dimension, high: boolean) => `${(high ? dimension.maxEmoji : dimension.minEmoji) || ''} ${(high ? dimension.maxLabel : dimension.minLabel) || (high ? 'High' : 'Low')}`.trim()
const activate = (event: React.KeyboardEvent, callback: () => void) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); callback() } }
const cube = Array.from({ length: 8 }, (_, i) => [i & 1 ? 100 : 0, i & 2 ? 100 : 0, i & 4 ? 100 : 0])

export function AtlasScatter({ dimensions, archetypes, selectedId, onSelect, mini, threeD, sizeDimension }: ChartProps & { threeD: boolean; sizeDimension?: Dimension }) {
  const plotted = archetypes.flatMap(archetype => {
    const targets = dimensions.map(d => archetype.dimensions.find(t => t.dimensionId === d.id))
    if (targets.some(t => !t)) return []
    return [{ archetype, targets, point: threeD ? projectAtlasPreview(targets.map(t => t!.targetValue)) : projectTarget(targets.map(t => t!.targetValue)) }]
  }).sort((a, b) => Number(a.archetype.id === selectedId) - Number(b.archetype.id === selectedId) || b.point.depth - a.point.depth)
  return <svg viewBox="0 0 600 440" role={mini ? undefined : 'group'} aria-hidden={mini || undefined} aria-label={mini ? undefined : threeD ? 'Three-dimensional archetype target map' : 'Archetype target map'}>
    {threeD ? <g className="atlas-grid">{cube.flatMap((vertex, i) => cube.map((other, j) => {
      if (j <= i || vertex.filter((v, k) => v !== other[k]).length !== 1) return null
      const p = projectAtlasPreview(vertex), q = projectAtlasPreview(other)
      return <line key={`${i}-${j}`} x1={p.x} y1={p.y} x2={q.x} y2={q.y} />
    }))}</g> : <g className="atlas-grid">{[0, 25, 50, 75, 100].map(value => <g key={value}><line x1={90 + value * 4.2} x2={90 + value * 4.2} y1="75" y2="345" />{dimensions.length > 1 && <line x1="90" x2="510" y1={345 - value * 2.7} y2={345 - value * 2.7} />}</g>)}
      {!mini && <><text x="90" y="369"><title>{endLabel(dimensions[0], false)}</title>{shortName(endLabel(dimensions[0], false), 24)}</text><text x="510" y="369" textAnchor="end"><title>{endLabel(dimensions[0], true)}</title>{shortName(endLabel(dimensions[0], true), 24)}</text><text x="300" y="413" textAnchor="middle"><title>{dimensions[0]?.name}</title>{shortName(dimensions[0]?.name || '')}</text>{dimensions[1] && <><text x="76" y="82" textAnchor="end"><title>{endLabel(dimensions[1], true)}</title>{shortName(endLabel(dimensions[1], true), 11)}</text><text x="76" y="349" textAnchor="end"><title>{endLabel(dimensions[1], false)}</title>{shortName(endLabel(dimensions[1], false), 11)}</text><text transform="translate(22 210) rotate(-90)" textAnchor="middle"><title>{dimensions[1].name}</title>{shortName(dimensions[1].name)}</text></>}</>}

    </g>}
    {threeD && !mini && <g className="atlas-axis-labels">{[[100, 0, 0], [0, 100, 0], [0, 0, 100]].map((v, i) => { const p = projectAtlasPreview(v); return <text key={i} x={p.x} y={p.y - 12} textAnchor="middle">{shortName(dimensions[i]?.name || '')} · {dimensions[i]?.maxLabel || 'High'}</text> })}</g>}
    {plotted.map(({ archetype: a, point, targets }) => <g key={a.id} className={mini ? undefined : `atlas-point${selectedId === a.id ? ' atlas-point-selected' : ''}`} transform={`translate(${point.x} ${point.y})`} tabIndex={mini ? undefined : 0} role={mini ? undefined : 'button'} aria-label={mini ? undefined : `Select ${a.name}: ${dimensions.map((d, i) => `${d.name} ${targets[i]!.targetValue}`).join(', ')}${sizeDimension ? `; ${sizeDimension.name}: ${a.dimensions.some(t => t.dimensionId === sizeDimension.id) ? `${a.dimensions.find(t => t.dimensionId === sizeDimension.id)!.targetValue} out of 100` : 'No target set'}` : ''}`} data-missing={sizeDimension && !a.dimensions.some(t => t.dimensionId === sizeDimension.id) ? 'true' : undefined} aria-pressed={mini ? undefined : selectedId === a.id} onClick={mini ? undefined : () => onSelect?.(a.id)} onKeyDown={mini ? undefined : e => activate(e, () => onSelect?.(a.id))}>
      {!mini && <><title>{a.name}</title><circle className="atlas-point-halo" r={sizeDimension ? 38 : 23} /></>}
      <circle r={sizeDimension ? atlasMarkerRadius(a.dimensions.find(t => t.dimensionId === sizeDimension.id)?.targetValue) * 190 : mini ? 17 : 16} fill={sizeDimension && !a.dimensions.some(t => t.dimensionId === sizeDimension.id) ? 'white' : getArchetypeTheme(a.color, a.name).hex} stroke={sizeDimension && !a.dimensions.some(t => t.dimensionId === sizeDimension.id) ? getArchetypeTheme(a.color, a.name).hex : 'white'} strokeDasharray={sizeDimension && !a.dimensions.some(t => t.dimensionId === sizeDimension.id) ? '3 3' : undefined} strokeWidth="2" />
    </g>)}
  </svg>
}

/** Missing targets leave gaps instead of connecting a line through an invented score. */
export function AtlasParallel({ dimensions, archetypes, selectedId, onSelect }: ChartProps) {
  const width = Math.max(600, dimensions.length * 120)
  const xAt = (index: number) => 55 + index * (width - 110) / Math.max(1, dimensions.length - 1)
  const yAt = (value: number) => 330 - value * 2.5
  return <div className="atlas-wide-chart" role="region" aria-label="Scrollable parallel coordinates" tabIndex={0}>
    <svg viewBox={`0 0 ${width} 400`} style={{ minWidth: width }} role="group" aria-label="Parallel coordinates archetype target map">
      <g className="atlas-grid">{[0, 25, 50, 75, 100].map(value => <g key={value}><line x1="55" x2={width - 55} y1={yAt(value)} y2={yAt(value)} /></g>)}</g>
      {dimensions.map((d, i) => <g key={d.id} className="atlas-parallel-axis"><line x1={xAt(i)} x2={xAt(i)} y1="80" y2="330" /><circle cx={xAt(i)} cy="50" r="4" fill={getColorTheme(d.color).hex} /><text x={xAt(i)} y="32" textAnchor="middle"><title>{d.name}</title>{shortName(d.name, 14)}</text><text x={xAt(i)} y="68" textAnchor="middle"><title>{endLabel(d, true)}</title>{shortName(endLabel(d, true), 16)}</text><text x={xAt(i)} y="355" textAnchor="middle"><title>{endLabel(d, false)}</title>{shortName(endLabel(d, false), 16)}</text></g>)}
      {[...archetypes].sort((a, b) => Number(a.id === selectedId) - Number(b.id === selectedId)).map(a => {
        let path = ''
        let previous: { x: number; y: number } | null = null
        const points = dimensions.flatMap((d, i) => {
          const target = a.dimensions.find(t => t.dimensionId === d.id)
          if (!target) { previous = null; return [] }
          const point = { x: xAt(i), y: yAt(target.targetValue), value: target.targetValue }
          if (previous) {
            // Horizontal tangents meet smoothly at each axis, without overshooting either target.
            const middle = (previous.x + point.x) / 2
            path += `C${middle},${previous.y} ${middle},${point.y} ${point.x},${point.y} `
          } else path += `M${point.x},${point.y} `
          previous = point
          return [point]
        })
        return <g key={a.id} className="atlas-parallel-series" data-selected={a.id === selectedId} tabIndex={0} role="button" aria-label={`Select ${a.name} across all dimensions`} aria-pressed={a.id === selectedId} onClick={() => onSelect?.(a.id)} onKeyDown={e => activate(e, () => onSelect?.(a.id))} style={{ color: getArchetypeTheme(a.color, a.name).hex }}>
          <title>{a.name}</title><path className="atlas-series-hit" d={path} /><path className="atlas-series-line" d={path} />{points.map((p, i) => <g key={i}><circle cx={p.x} cy={p.y} r="5" />{a.id === selectedId && <text x={p.x + 9} y={Math.max(94, p.y - 9)}>{p.value}</text>}</g>)}
        </g>
      })}
    </svg>
  </div>
}

/** All profiles share fixed radial axes; incomplete profiles leave explicit gaps. */
export function AtlasRadar({ dimensions, archetypes, selectedId, onSelect }: ChartProps) {
  const point = (index: number, value: number) => {
    const angle = index / dimensions.length * Math.PI * 2 - Math.PI / 2
    return { x: 300 + Math.cos(angle) * value * 1.5, y: 205 + Math.sin(angle) * value * 1.5 }
  }
  const polygon = (value: number) => dimensions.map((_, i) => { const p = point(i, value); return `${p.x},${p.y}` }).join(' ')
  return <svg viewBox="0 0 600 420" role="group" aria-label="Radar of all archetypes and dimensions">
    <g className="atlas-radar-grid">{[25, 50, 75, 100].map(value => <polygon key={value} points={polygon(value)} />)}{dimensions.map((d, i) => {
      const end = point(i, 100), label = point(i, 117)
      return <g key={d.id}><line x1="300" y1="205" x2={end.x} y2={end.y} /><text x={label.x} y={label.y + 4} textAnchor="middle"><title>{d.name}</title>{shortName(d.name, 18)}<tspan x={label.x} dy="14" className="atlas-radar-endpoints"><title>{endLabel(d, false)} → {endLabel(d, true)}</title>{shortName(endLabel(d, false), 12)} → {shortName(endLabel(d, true), 12)}</tspan></text></g>
    })}</g>
    {[...archetypes].sort((a, b) => Number(a.id === selectedId) - Number(b.id === selectedId)).map(a => {
      const targets = dimensions.map(d => a.dimensions.find(t => t.dimensionId === d.id))
      let path = ''
      targets.forEach((target, i) => { if (!target) return; const p = point(i, target.targetValue); const next = targets[(i + 1) % targets.length]; path += `M${p.x},${p.y} `; if (next) { const q = point((i + 1) % targets.length, next.targetValue); path += `L${q.x},${q.y} ` } })
      const complete = targets.every(Boolean)
      return <g key={a.id} className="atlas-radar-series" data-selected={a.id === selectedId} tabIndex={0} role="button" aria-label={`Select ${a.name} on radar`} aria-pressed={a.id === selectedId} onClick={() => onSelect?.(a.id)} onKeyDown={e => activate(e, () => onSelect?.(a.id))} style={{ color: getArchetypeTheme(a.color, a.name).hex }}>
        <title>{a.name}</title>{complete && <polygon className="atlas-radar-fill" points={targets.map((t, i) => { const p = point(i, t!.targetValue); return `${p.x},${p.y}` }).join(' ')} />}<path className="atlas-series-hit" d={path} /><path className="atlas-series-line" d={path} />{targets.map((target, i) => { if (!target) return null; const p = point(i, target.targetValue); return <circle key={i} cx={p.x} cy={p.y} r="4"><title>{dimensions[i].name}: {target.targetValue}</title></circle> })}
      </g>
    })}
  </svg>
}
