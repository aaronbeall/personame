import { analyzeImportance } from '@/lib/space-metrics'
import { SpaceMetrics } from './space-metrics'
import type { FullQuiz } from '@/lib/personas'
import { getColorSurface, getColorTheme } from '@/lib/colors'
import { ArchetypeBadge, DimensionTag } from './entity-identity'

export function TargetsImportance({ dimensions, archetypes }: Pick<FullQuiz, 'dimensions' | 'archetypes'>) {
  const analysis = analyzeImportance({ dimensions, archetypes })
  const { missingTargets, inactiveArchetypes, unusedDimensions } = analysis.warnings
  const hasWarnings = missingTargets > 0 || inactiveArchetypes.length > 0 || unusedDimensions.length > 0
  return <section className="review-section" aria-labelledby="targets-importance-title">
    <header className="review-section-heading"><div><h2 id="targets-importance-title">Targets &amp; importance</h2><p>What defines each archetype, and how your dimensions share the spotlight.</p></div></header>
    <SpaceMetrics label="Target space metrics" metrics={analysis.metrics} note={`We give each active archetype an equal say, then compare what matters most to it. ${analysis.focusRange ? `Focus ranges from ${analysis.focusRange[0].toFixed(1)} to ${analysis.focusRange[1].toFixed(1)} dimensions.` : 'Add importance to start comparing priorities.'} Focused, broad, and shared priorities can all be intentional.`} />
    {!dimensions.length || !archetypes.length ? <p className="review-empty">Add dimensions and archetypes to compare their targets.</p> : <>
      {hasWarnings && <details className="importance-setup"><summary>Some settings need a look{missingTargets > 0 ? ` · ${missingTargets} missing ${missingTargets === 1 ? 'target' : 'targets'}` : ''}{inactiveArchetypes.length > 0 ? ` · ${inactiveArchetypes.length} ${inactiveArchetypes.length === 1 ? 'archetype' : 'archetypes'} without importance` : ''}{unusedDimensions.length > 0 ? ` · ${unusedDimensions.length} unused ${unusedDimensions.length === 1 ? 'dimension' : 'dimensions'}` : ''}</summary><ul>
        {missingTargets > 0 && <li>{missingTargets} target {missingTargets === 1 ? 'setting is' : 'settings are'} missing. Fill them in if every archetype should have a position on every dimension.</li>}
        {inactiveArchetypes.length > 0 && <li>Add at least one dimension with importance above zero to: {inactiveArchetypes.map(id => archetypes.find(a => a.id === id)?.name).join(', ')}. Otherwise they can be chosen for the wrong reason.</li>}
        {unusedDimensions.length > 0 && <li>No archetype uses {unusedDimensions.map(id => dimensions.find(d => d.id === id)?.name).join(', ')} to choose a result. That can be fine for dimensions meant only as extra information.</li>}
      </ul></details>}
      {analysis.activeCount > 0 && <div className="importance-influence" role="group" aria-label="Overall dimension influence"><h3>How attention is shared</h3><div className="importance-share-bar" aria-hidden="true">{analysis.shares.map((d, i) => <span key={d.id} style={{ width: `${d.share * 100}%`, background: getColorTheme(dimensions[i].color).hex }} />)}</div><ul>{analysis.shares.map((d, i) => <li key={d.id}><i aria-hidden="true" style={{ background: getColorTheme(dimensions[i].color).hex }} /><span>{dimensions[i].name}</span><b>{(d.share * 100).toFixed(1)}%</b></li>)}</ul><p>Each active archetype gets an equal say. These shares describe your importance settings, not how often each dimension changes someone’s result.</p></div>}
      <div className="importance-heatmap-heading"><h3>Each archetype’s priorities</h3><span><i aria-hidden="true" />Less attention → more attention</span></div>
      <p className="importance-heatmap-help">Darker cells carry more of that archetype’s importance. Each active row adds up to 100%; target bars still show its position.</p>
      <div className="atlas-matrix-scroll" role="region" aria-label="All archetype targets" tabIndex={0}>
        <table className="atlas-matrix importance-heatmap"><caption className="sr-only">Normalized importance shares, raw importance and target values for each archetype. Each active row totals 100 percent before rounding.</caption>
          <thead><tr><th scope="col">Archetype</th>{dimensions.map(d => <th scope="col" key={d.id}><DimensionTag name={d.name} emoji={d.emoji} color={d.color} /></th>)}</tr></thead>
          <tbody>{archetypes.map((a, ai) => { const row = analysis.rows[ai]
            return <tr key={a.id}><th scope="row"><span className="targets-archetype"><ArchetypeBadge name={a.name} emoji={a.emoji} color={a.color} size={28} label={false} />{a.name}</span><small className="importance-focus">{row.focus === null ? 'No active priorities' : `Focus: ${row.focus.toFixed(1)} of ${dimensions.length} dimensions`}</small></th>{dimensions.map((d, di) => {
              const target = a.dimensions.find(t => t.dimensionId === d.id)
              const share = row.shares[di]
              return <td key={d.id} className={target ? undefined : 'importance-missing'} data-share={share.toFixed(6)} style={target ? { background: share ? `color-mix(in srgb, var(--pn-action) ${6 + share * 40}%, white)` : 'white' } : undefined}>{target ? <><span className="importance-cell-share">{(share * 100).toFixed(1)}%<small>share</small></span><small>Set importance: {Math.round(target.relevance * 100)}%</small><span className="importance-cell-target">Target <b>{target.targetValue}</b><small>/100</small></span><span className="atlas-cell-bar" aria-hidden="true"><span style={{ width: `${target.targetValue}%`, background: getColorSurface(getColorTheme(d.color).value).background }} /></span></> : <span className="muted">Not set</span>}</td>
            })}</tr>
          })}</tbody>
        </table>
      </div>
    </>}
  </section>
}
