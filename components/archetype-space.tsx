'use client'

import { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { ChevronDown } from 'lucide-react'
import type { FullQuiz } from '@/lib/personas'
import { combinationAt, combinationCount, rankDimensions } from '@/lib/archetype-map'
import { getColorTheme } from '@/lib/colors'
import { ArchetypeBadge, getArchetypeTheme } from './entity-identity'
import { DimensionTargetSummary } from './dimension-target-summary'
import { archetypeSpaceMetrics } from '@/lib/space-metrics'
import { SpaceMetrics } from './space-metrics'
import { AtlasSizeKey } from './atlas-size-key'
import { AtlasRadar, AtlasParallel, AtlasScatter } from './atlas-charts'
const AtlasSpace3D = dynamic(() => import('./atlas-space-3d'), { ssr: false, loading: () => <div className="atlas-3d-loading" role="status">Preparing 3D space…</div> })

type Props = Pick<FullQuiz, 'dimensions' | 'archetypes'>
type Mode = '2d' | '3d' | 'parallel' | 'radar'
const previewPageSize = 8
export function ArchetypeSpace({ dimensions, archetypes }: Props) {
  const [mode, setMode] = useState<Mode>(dimensions.length >= 4 ? 'radar' : dimensions.length === 3 ? '3d' : '2d')
  const [combination, setCombination] = useState(0)
  const [customAxes, setCustomAxes] = useState<string[]>()
  const [previewPage, setPreviewPage] = useState(0)
  const [showSizeDimension, setShowSizeDimension] = useState(false)
  const [preferredSizeId, setPreferredSizeId] = useState<string>()
  const [selection, setSelection] = useState(archetypes[0]?.id)
  const selected = archetypes.find(a => a.id === selection) ?? archetypes[0]
  const ranked = useMemo(() => rankDimensions(dimensions, archetypes), [dimensions, archetypes])
  const threeD = mode === '3d' && dimensions.length >= 3
  const spatial = mode === '2d' || mode === '3d'
  const capacity = threeD ? 3 : Math.min(2, dimensions.length)
  const total = combinationCount(dimensions.length, capacity)
  const chosen = useMemo(() => customAxes
    ? customAxes.flatMap(id => dimensions.find(d => d.id === id) ?? [])
    : combinationAt(ranked, capacity, combination), [customAxes, dimensions, ranked, capacity, combination])
  const sizeOptions = spatial && capacity >= 2 ? dimensions.filter(d => !chosen.some(axis => axis.id === d.id)) : []
  const sizeChoice = sizeOptions.find(d => d.id === preferredSizeId) ?? sizeOptions[0]
  const sizeDimension = showSizeDimension ? sizeChoice : undefined
  const missing = archetypes.filter(a => (spatial ? chosen : dimensions).some(d => !a.dimensions.some(t => t.dimensionId === d.id))).length
  const pages = Math.ceil(total / previewPageSize)
  const diagnostics = useMemo(() => archetypeSpaceMetrics({ dimensions, archetypes }), [dimensions, archetypes])
  const modes: { key: Mode; label: string }[] = [
    { key: '2d', label: dimensions.length === 1 ? '1D map' : '2D map' },
    ...(dimensions.length >= 3 ? [{ key: '3d' as const, label: '3D space' }] : []),
    ...(dimensions.length >= 2 ? [{ key: 'parallel' as const, label: 'Parallel' }, ...(dimensions.length >= 3 ? [{ key: 'radar' as const, label: 'Radar' }] : [])] : []),
  ]
  return (
    <section className="review-section archetype-space" aria-labelledby="archetype-space-title">
      <header className="review-section-heading"><div><span className="review-eyebrow">THE SHAPE OF YOUR QUIZ</span><h2 id="archetype-space-title">Your archetype atlas</h2><p>Different ways to see your cast. Select a character to follow it across every view.</p></div></header>
      <SpaceMetrics label="Archetype space metrics" metrics={diagnostics.metrics} note={`A quick check of how your archetypes fill the map. ${diagnostics.complete < diagnostics.total ? `${diagnostics.complete}/${diagnostics.total} have all their dimension settings; fill in the rest to see these checks.` : 'These are pointers, not a grade. A focused quiz can leave parts of the map empty.'}`} />
      {!dimensions.length || !archetypes.length ? <p className="review-empty">Add dimensions and archetypes to start mapping your world.</p> : <>
        <div className="atlas-view-bar"><div className="atlas-mode" role="group" aria-label="Map view">{modes.map(view => <button type="button" key={view.key} aria-pressed={mode === view.key} onClick={() => { setMode(view.key); setCombination(0); setCustomAxes(undefined); setPreviewPage(0) }}>{view.label}</button>)}</div>
        </div>
        {spatial && total > 1 && <section className="atlas-combinations" aria-label="Dimension combinations">
          <header><h3>{total} {threeD ? 'triples' : 'pairs'}<span> · Select a view</span></h3>{pages > 1 && <div className="atlas-preview-paging"><button type="button" aria-label="Previous combinations" disabled={previewPage === 0} onClick={() => setPreviewPage(page => page - 1)}>←</button><span>{previewPage + 1} / {pages}</span><button type="button" aria-label="Next combinations" disabled={previewPage >= pages - 1} onClick={() => setPreviewPage(page => page + 1)}>→</button></div>}</header>
          <div className="atlas-mini-grid">{Array.from({ length: Math.min(previewPageSize, total - previewPage * previewPageSize) }, (_, offset) => {
            const index = previewPage * previewPageSize + offset
            const subset = combinationAt(ranked, capacity, index)
            const name = subset.map(d => d.name).join(' × ')
            const remaining = dimensions.filter(d => !subset.some(axis => axis.id === d.id))
            const previewSize = sizeDimension ? remaining.find(d => d.id === sizeChoice?.id) ?? remaining[0] : undefined
            return <button type="button" key={index} className="atlas-mini-chart" aria-label={`View ${name}`} aria-pressed={subset.every(d => chosen.some(axis => axis.id === d.id))} onClick={() => { setCombination(index); setCustomAxes(undefined) }}><AtlasScatter dimensions={subset} archetypes={archetypes} mini threeD={threeD} sizeDimension={previewSize} /><span>{name}</span></button>
          })}</div>
        </section>}
        <div className="atlas-layout">
          <div className="atlas-canvas">
            {spatial ? <><div className="atlas-chart-heading"><div className="atlas-axis-key" aria-label="Chart dimensions">{chosen.map((d, axisIndex) => {
              const available = dimensions.filter(option => !chosen.some(axis => axis.id === option.id) && option.id !== sizeDimension?.id)
              return <span key={axisIndex} className="atlas-axis-choice"><i aria-hidden="true" style={{ background: getColorTheme(d.color).hex }} /><select aria-label={`${['X', 'Y', 'Z'][axisIndex]} axis dimension`} value={d.id} disabled={!available.length} onChange={event => setCustomAxes(chosen.map((axis, index) => index === axisIndex ? event.target.value : axis.id))}><option value={d.id} hidden>{d.name}</option>{available.map(option => <option key={option.id} value={option.id}>{option.name}</option>)}</select><ChevronDown size={11} aria-hidden="true" /></span>
            })}</div>{sizeChoice && <div className="atlas-size-control"><button type="button" role="switch" aria-label={`Size by ${sizeChoice.name}`} aria-checked={showSizeDimension} className="atlas-fourth-toggle" onClick={() => setShowSizeDimension(value => !value)}><span className="atlas-switch-track" aria-hidden="true"><span /></span>{sizeOptions.length > 1 ? 'Size' : <>Size: <strong>{sizeChoice.name}</strong></>}</button>{sizeOptions.length > 1 && <span className="atlas-axis-choice atlas-size-choice"><select aria-label="Size dimension" value={sizeChoice.id} onChange={event => setPreferredSizeId(event.target.value)}>{sizeOptions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select><ChevronDown size={11} aria-hidden="true" /></span>}</div>}</div>{threeD ? <AtlasSpace3D dimensions={chosen} archetypes={archetypes} sizeDimension={sizeDimension} selectedId={selected?.id} onSelect={setSelection} /> : <AtlasScatter dimensions={chosen} archetypes={archetypes} selectedId={selected?.id} onSelect={setSelection} threeD={false} sizeDimension={sizeDimension} />}<p className="atlas-caption">{sizeDimension ? `${dimensions.length === capacity + 1 ? `All ${capacity + 1}` : `${capacity + 1} of ${dimensions.length}`} dimensions · position + size · ` : dimensions.length > capacity ? `${capacity} of ${dimensions.length} dimensions · ` : ''}Target positions · {customAxes ? 'Custom axes.' : 'Axes ordered by target spread.'}</p>{!threeD && sizeDimension && <AtlasSizeKey dimension={sizeDimension} />}</> : mode === 'parallel' ? <><AtlasParallel dimensions={dimensions} archetypes={archetypes} selectedId={selected?.id} onSelect={setSelection} /><p className="atlas-caption">All archetypes · Low ends at bottom, high ends at top. Gaps mean missing targets.</p></> : <><AtlasRadar dimensions={dimensions} archetypes={archetypes} selectedId={selected?.id} onSelect={setSelection} /><p className="atlas-caption">All archetypes · Center: low end, outer ring: high end. Select a profile to highlight it. Gaps mean missing targets.</p></>}
            {!spatial && <ol className="atlas-dimension-key">{dimensions.map((d, i) => <li key={d.id}><span style={{ background: getColorTheme(d.color).hex }} /><b>{i + 1}</b>{d.name}</li>)}</ol>}
            {missing > 0 && <p className="atlas-note">{spatial ? `${missing} archetype(s) need targets on these axes before they can appear.` : `${missing} archetype(s) have missing targets. Gaps are left blank, never filled with a default score.`}</p>}
          </div>
          <aside className="atlas-selection" aria-label="Selected archetype">
            <div className="atlas-legend" aria-label="Choose an archetype">{archetypes.map(a => <button type="button" key={a.id} aria-pressed={selected?.id === a.id} onClick={() => setSelection(a.id)}>
              <span aria-hidden="true" style={{ background: getArchetypeTheme(a.color, a.name).hex }} />{a.name}
            </button>)}</div>
            {selected && <div className="atlas-profile"><ArchetypeBadge name={selected.name} emoji={selected.emoji} color={selected.color} size={40} label={false} />
              <h3>{selected.name}</h3><p>{selected.description || 'No description added.'}</p>
              <dl>{dimensions.map(d => { const target = selected.dimensions.find(t => t.dimensionId === d.id)
                return <div key={d.id}><dt>{d.name}</dt><dd>{target ? <DimensionTargetSummary name={d.name} value={target.targetValue} minLabel={d.minLabel || 'Low'} maxLabel={d.maxLabel || 'High'} minEmoji={d.minEmoji} maxEmoji={d.maxEmoji} color={d.color} importance={target.relevance} /> : 'No target set'}</dd></div>
              })}</dl>
            </div>}
          </aside>
        </div>
      </>}
    </section>
  )
}
