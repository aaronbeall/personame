import { SPACE_METRIC_REFERENCE } from './space-metric-reference'
import type { FullQuiz } from './personas'
import type { QuestionSpaceAnalysis } from './question-space'

type Model = Pick<FullQuiz, 'dimensions' | 'archetypes'>
export type SpaceMetric = {
  label: string; value: number | null; unit: '%' | 'pts' | 'dims'; direction: 'higher' | 'lower'
  status: 'good' | 'watch' | 'concern' | 'unavailable' | 'neutral'; verdict: string
  thresholds: [number, number]; guide: string; explanation: string; referenceId: string; scaleMax?: number; suffix?: string
}
function metric(label: keyof typeof SPACE_METRIC_REFERENCE, value: number | null, unit: SpaceMetric['unit'], direction: SpaceMetric['direction'], thresholds: [number, number], verdicts: [string, string, string], guide: string, explanation: string): SpaceMetric {
  const band = value === null ? 2 : direction === 'higher'
    ? value >= thresholds[1] ? 0 : value >= thresholds[0] ? 1 : 2
    : value <= thresholds[0] ? 0 : value <= thresholds[1] ? 1 : 2
  return { label: SPACE_METRIC_REFERENCE[label].title, referenceId: SPACE_METRIC_REFERENCE[label].id, value, unit, direction, thresholds, status: value === null ? 'unavailable' : (['good', 'watch', 'concern'] as const)[band], verdict: value === null ? 'Not enough data' : verdicts[band], guide, explanation }
}
const clamp = (v: number) => Math.max(0, Math.min(100, v))
const validTarget = (t: Model['archetypes'][number]['dimensions'][number]) => Number.isFinite(t.targetValue) && t.targetValue >= 0 && t.targetValue <= 100

/** Fixed cell centers in 1–3D; fixed-seed Latin hypercube in higher dimensions. No Math.random. */
export function spaceProbes(dimensionCount: number): number[][] {
  if (dimensionCount < 1) return []
  if (dimensionCount <= 3) {
    const cells = dimensionCount === 1 ? 256 : dimensionCount === 2 ? 32 : 12
    const count = cells ** dimensionCount
    return Array.from({ length: count }, (_, index) => {
      let cursor = index
      return Array.from({ length: dimensionCount }, () => { const value = (cursor % cells + .5) / cells * 100; cursor = Math.floor(cursor / cells); return value })
    })
  }
  const count = 1024
  let state = 0x51ace123
  const random = () => { state ^= state << 13; state ^= state >>> 17; state ^= state << 5; return (state >>> 0) / 4294967296 }
  const probes = Array.from({ length: count }, () => Array<number>(dimensionCount))
  for (let d = 0; d < dimensionCount; d++) {
    const strata = Array.from({ length: count }, (_, i) => i)
    for (let i = count - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [strata[i], strata[j]] = [strata[j], strata[i]] }
    for (let i = 0; i < count; i++) probes[i][d] = (strata[i] + .5) / count * 100
  }
  return probes
}
const rms = (a: number[], b: number[]) => Math.sqrt(a.reduce((sum, value, i) => sum + (value - b[i]) ** 2, 0) / a.length)

/** Geometry ignores importance deliberately: every authored dimension has equal geometric weight. */
export function archetypeSpaceMetrics({ dimensions, archetypes }: Model) {
  const vectors = archetypes.flatMap(a => {
    const targets = dimensions.map(d => a.dimensions.find(t => t.dimensionId === d.id && validTarget(t)))
    return targets.every(t => t !== undefined) && dimensions.length ? [targets.map(t => t!.targetValue)] : []
  })
  const complete = dimensions.length > 0 && archetypes.length > 0 && vectors.length === archetypes.length
  let separation: number | null = null, coverage: number | null = null, evenness: number | null = null
  const probes = complete ? spaceProbes(dimensions.length) : []
  if (complete) {
    if (vectors.length >= 2) {
      separation = Infinity
      for (let i = 0; i < vectors.length; i++) for (let j = i + 1; j < vectors.length; j++) separation = Math.min(separation, rms(vectors[i], vectors[j]))
    }
    // Duplicate prototypes are one territory, not multiple artificial equal-sized territories.
    const unique = [...new Map(vectors.map(v => [v.join(','), v])).values()]
    const occupancy = unique.map(() => 0)
    let covered = 0
    for (const point of probes) {
      const distances = unique.map(v => rms(v, point)), nearest = Math.min(...distances)
      if (nearest <= 20) covered++
      const ties = distances.map((v, i) => Math.abs(v - nearest) < 1e-9 ? i : -1).filter(i => i >= 0)
      for (const i of ties) occupancy[i] += 1 / ties.length
    }
    coverage = covered / probes.length * 100
    const entropy = occupancy.reduce((sum, count) => { const p = count / probes.length; return sum - (p ? p * Math.log(p) : 0) }, 0)
    evenness = clamp(Math.exp(entropy) / vectors.length * 100)
  }
  return { complete: vectors.length, total: archetypes.length, probeCount: probes.length, metrics: [
    metric('Minimum separation', separation, 'pts', 'higher', [10, 20], ['Distinct', 'Close', 'Crowded'], '≥20 distinct · 10–<20 close · <10 crowded', "How different are your two most similar archetypes? Zero means they have identical settings. Higher means they are easier to tell apart. If this is low, consider moving their targets apart."),
    metric('Space within reach', coverage, '%', 'higher', [50, 80], ['Broad', 'Patchy', 'Sparse'], '≥80% broad · 50–<80% patchy · <50% sparse', "How much of the full map has an archetype nearby? Higher means fewer empty areas. If this is low, consider adding an archetype for a part of the map you have missed."),
    metric('Territory balance', evenness, '%', 'higher', [50, 80], ['Even', 'Uneven', 'Concentrated'], '≥80% even · 50–<80% uneven · <50% concentrated', "Does each archetype get a similar share of the map? Near 100% means the shares are even. Lower means a few archetypes take up most of the space. This is about the map, not the results real people will get."),
  ] }
}

export function analyzeImportance({ dimensions, archetypes }: Model) {
  const rows = archetypes.map(a => {
    const targets = dimensions.map(d => a.dimensions.find(t => t.dimensionId === d.id && validTarget(t)))
    const weights = targets.map(t => t && Number.isFinite(t.relevance) && t.relevance > 0 ? t.relevance : 0)
    const total = weights.reduce((sum, weight) => sum + weight, 0)
    const shares = weights.map(weight => total ? weight / total : 0)
    const focus = total ? Math.exp(-shares.reduce((sum, p) => sum + (p ? p * Math.log(p) : 0), 0)) : null
    return { id: a.id, shares, focus, missing: targets.filter(t => !t).length }
  })
  const active = rows.filter(row => row.focus !== null)
  const shares = dimensions.map((d, i) => ({ id: d.id, share: active.length ? active.reduce((sum, row) => sum + row.shares[i], 0) / active.length : 0 }))
  const entropy = shares.reduce((sum, d) => sum - (d.share ? d.share * Math.log(d.share) : 0), 0)
  const balance = dimensions.length && active.length ? dimensions.length === 1 ? 100 : clamp(entropy / Math.log(dimensions.length) * 100) : null
  const focuses = active.map(row => row.focus!).sort((a, b) => a - b)
  const median = focuses.length ? (focuses[Math.floor((focuses.length - 1) / 2)] + focuses[Math.floor(focuses.length / 2)]) / 2 : null
  let difference = 0, pairs = 0
  for (let i = 0; i < active.length; i++) for (let j = i + 1; j < active.length; j++) {
    difference += active[i].shares.reduce((sum, p, d) => sum + Math.abs(p - active[j].shares[d]), 0) / 2
    pairs++
  }
  const focusMetric = metric('Archetype focus', median, 'dims', 'higher', [1 + (dimensions.length - 1) / 3, 1 + 2 * (dimensions.length - 1) / 3], ['Broad', 'Mixed', 'Focused'], '', 'How many dimensions usually define an archetype? Closer to 1 means a single defining trait; closer to the total means a broader mix. Both can work. The table shows the focus of each archetype.')
  if (median !== null) {
    focusMetric.status = 'neutral'
    if (dimensions.length === 1) focusMetric.verdict = 'Single dimension'
  }
  focusMetric.scaleMax = Math.max(1, dimensions.length)
  focusMetric.suffix = `of ${dimensions.length}`
  return { rows, shares, activeCount: active.length, focusRange: focuses.length ? [focuses[0], focuses[focuses.length - 1]] : null,
    warnings: {
      missingTargets: rows.reduce((sum, row) => sum + row.missing, 0),
      inactiveArchetypes: rows.filter(row => row.focus === null).map(row => row.id),
      unusedDimensions: shares.filter(d => !d.share).map(d => d.id),
    }, metrics: [
      metric('Dimension influence', balance, '%', 'higher', [50, 80], ['Balanced', 'Uneven', 'Concentrated'], '', 'Do your archetypes share attention across dimensions, or does one dimension dominate? Higher means their attention is more evenly spread. The colored bar shows each dimension’s share. This reads your settings, not real participant results.'),
      focusMetric,
      metric('Importance variety', pairs ? clamp(difference / pairs * 100) : null, '%', 'higher', [10, 30], ['Varied', 'Some variety', 'Similar'], '', 'Do your archetypes care about different things? Zero means they all have the same priorities. Higher means their priorities differ. Shared priorities can still be intentional, even when target positions are different.'),
    ] }
}
export function targetSpaceMetrics(model: Model): SpaceMetric[] { return analyzeImportance(model).metrics }

export function questionSpaceMetrics(a: QuestionSpaceAnalysis): SpaceMetric[] {
  const valid = a.axes.length > 0 && a.questions.length > 0 && !a.invalid.length
  return [
    metric('Reachable axis span', valid ? a.axes.reduce((sum, d) => sum + d.max - d.min, 0) / a.axes.length : null, '%', 'higher', [40, 70], ['Broad', 'Limited', 'Narrow'], '≥70% broad · 40–<70% limited · <40% narrow', "How much of each dimension can your questions explore? Higher means a wider range of possible scores. If this is low, check whether your answers push scores far enough in both directions. Not every score inside the range is necessarily possible."),
    metric('Outcome balance', a.count ? clamp(a.diversity / a.outcomes.length * 100) : null, '%', 'higher', [50, 80], ['Even', 'Uneven', 'Concentrated'], '≥80% even · 50–<80% uneven · <50% concentrated', "Do the possible answers lead to a mix of results? Near 100% means results are evenly common when every answer gets an equal chance. Lower means a few results dominate. Rare results can be part of the fun."),
    metric('Clamped scores', a.count ? a.axes.reduce((sum, d) => sum + d.clipped / a.count, 0) / a.axes.length * 100 : null, '%', 'lower', [10, 30], ['Low', 'Elevated', 'High'], '≤10% low · >10–30% elevated · >30% high', "How often do scores go past 0 or 100 and get stopped there? Lower means fewer answers lose their differences at the limit. If this is high, try reducing some answer weights."),
  ]
}
