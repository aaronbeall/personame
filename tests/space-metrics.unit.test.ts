import { test } from 'node:test'
import assert from 'node:assert/strict'
import type { FullQuiz } from '../lib/personas'
import { analyzeImportance, archetypeSpaceMetrics, targetSpaceMetrics, questionSpaceMetrics, spaceProbes } from '../lib/space-metrics'
import { analyzeQuestionSpace } from '../lib/question-space'
type Model = Pick<FullQuiz, 'dimensions' | 'archetypes'>
function model(points: number[][]): Model {
  const dimensions = Array.from({ length: points[0]?.length ?? 1 }, (_, i) => ({ id: `d${i}`, name: `Dimension ${i}` }))
  return { dimensions, archetypes: points.map((point, i) => ({ id: `a${i}`, name: `Archetype ${i}`, dimensions: point.map((value, d) => ({ dimensionId: `d${d}`, targetValue: value, relevance: 1 })) })) } as Model
}
const values = (m: Model) => archetypeSpaceMetrics(m).metrics.map(m => m.value)

test('exact minimum RMS separation is normalized across all dimensions', () => {
  assert.equal(values(model([[0], [100]]))[0], 100)
  assert.equal(values(model([[0, 0], [100, 100]]))[0], 100)
  assert.equal(values(model([[0, 0], [100, 0]]))[0], Math.sqrt(5000))
  assert.equal(values(model([[50], [50]]))[0], 0)
  assert.equal(archetypeSpaceMetrics(model([[50]])).metrics[0].value, null)
})

test('spread and coverage distinguish evenly spaced centers from bunched prototypes', () => {
  const even = archetypeSpaceMetrics(model([[12.5], [37.5], [62.5], [87.5]]))
  const bunched = archetypeSpaceMetrics(model([[1], [2], [3], [4]]))
  assert.equal(even.metrics[1].value, 100)
  assert.equal(even.metrics[2].value, 100)
  assert.ok(even.metrics[0].value! > bunched.metrics[0].value!)
  assert.ok(even.metrics[1].value! > bunched.metrics[1].value!)
  assert.ok(even.metrics[2].value! > bunched.metrics[2].value!)
  assert.equal(bunched.metrics[0].status, 'concern')
})

test('duplicate positions do not create artificial territory balance; order and importance do not affect geometry', () => {
  const m = model([[25], [25], [75], [75]])
  assert.equal(values(m)[2], 50)
  const before = archetypeSpaceMetrics(m)
  m.archetypes.reverse()
  m.archetypes[0].dimensions[0].relevance = 0
  assert.deepEqual(archetypeSpaceMetrics(m), before)
})

test('higher-dimensional probes are reproducible and cover every marginal stratum', () => {
  const probes = spaceProbes(5)
  assert.deepEqual(probes, spaceProbes(5))
  assert.equal(probes.length, 1024)
  for (let d = 0; d < 5; d++) {
    assert.equal(new Set(probes.map(p => Math.floor(p[d] / 100 * 1024))).size, 1024)
    assert.ok(probes.every(p => p[d] > 0 && p[d] < 100))
  }
  assert.equal(spaceProbes(1).length, 256)
  assert.equal(spaceProbes(2).length, 1024)
  assert.equal(spaceProbes(3).length, 1728)
  assert.equal(spaceProbes(0).length, 0)
  const m = model([[10, 20, 30, 40, 50], [90, 80, 70, 60, 50]])
  assert.deepEqual(archetypeSpaceMetrics(m), archetypeSpaceMetrics(m))
})

test('missing targets never get neutral defaults and cannot masquerade as valid coverage', () => {
  const m = model([[0, 0], [100, 100]])
  m.archetypes[0].dimensions.pop()
  assert.equal(archetypeSpaceMetrics(m).complete, 1)
  assert.deepEqual(values(m), [null, null, null])
  assert.equal(analyzeImportance(m).warnings.missingTargets, 1)
  m.archetypes[0].dimensions[0].targetValue = NaN
  assert.equal(analyzeImportance(m).warnings.missingTargets, 2)
  assert.deepEqual(analyzeImportance(m).warnings.inactiveArchetypes, ['a0'])
})

test('importance profiles normalize per archetype and separate broad focus from varied priorities', () => {
  const m = model([[0, 0, 0], [100, 100, 100], [50, 50, 50]])
  const broad = analyzeImportance(m)
  assert.ok(Math.abs(broad.metrics[0].value! - 100) < 1e-12)
  assert.ok(Math.abs(broad.metrics[1].value! - 3) < 1e-12)
  assert.equal(broad.metrics[1].status, 'neutral')
  assert.equal(broad.metrics[1].verdict, 'Broad')
  assert.equal(broad.metrics[2].value, 0)
  for (let i = 0; i < 3; i++) for (let d = 0; d < 3; d++) m.archetypes[i].dimensions[d].relevance = i === d ? 1 : 0
  const focused = analyzeImportance(m)
  assert.ok(Math.abs(focused.metrics[0].value! - 100) < 1e-12)
  assert.equal(focused.metrics[1].value, 1)
  assert.equal(focused.metrics[1].verdict, 'Focused')
  assert.equal(focused.metrics[2].value, 100)
  assert.ok(focused.rows.every(row => row.shares.reduce((sum, p) => sum + p, 0) === 1))
})

test('importance shares give every active archetype equal say and ignore uniform weight scaling', () => {
  const m = model([[0, 0], [100, 100]])
  m.archetypes[0].dimensions[0].relevance = .2
  m.archetypes[0].dimensions[1].relevance = 0
  m.archetypes[1].dimensions[0].relevance = 0
  m.archetypes[1].dimensions[1].relevance = 1
  const before = analyzeImportance(m)
  assert.deepEqual(before.shares.map(d => d.share), [.5, .5])
  m.archetypes[0].dimensions[0].relevance *= 2
  assert.deepEqual(analyzeImportance(m), before)
  m.archetypes[0].dimensions[0].targetValue = 90
  assert.deepEqual(analyzeImportance(m), before)
})

test('pairwise importance variety and median focus have interpretable boundaries', () => {
  const m = model([[0, 0], [50, 50], [100, 100]])
  m.archetypes[0].dimensions[1].relevance = 0
  m.archetypes[2].dimensions[0].relevance = 0
  const a = analyzeImportance(m)
  assert.ok(Math.abs(a.metrics[2].value! - 200 / 3) < 1e-12)
  assert.equal(a.metrics[1].value, 1)
  assert.deepEqual(a.focusRange, [1, 2])
  const one = analyzeImportance(model([[50, 50]]))
  assert.equal(one.metrics[2].value, null)
  assert.equal(one.metrics[1].value, 2)
})

test('inactive archetypes and unused dimensions are warnings, never synthetic equal shares', () => {
  const m = model([[0, 0], [100, 100]])
  for (const a of m.archetypes) a.dimensions[1].relevance = 0
  const concentrated = analyzeImportance(m)
  assert.equal(concentrated.metrics[0].value, 0)
  assert.equal(concentrated.metrics[1].value, 1)
  assert.equal(concentrated.metrics[2].value, 0)
  assert.deepEqual(concentrated.warnings.unusedDimensions, ['d1'])
  m.archetypes[0].dimensions[0].relevance = 0
  const inactive = analyzeImportance(m)
  assert.equal(inactive.rows[0].focus, null)
  assert.deepEqual(inactive.rows[0].shares, [0, 0])
  assert.deepEqual(inactive.warnings.inactiveArchetypes, ['a0'])
  assert.equal(inactive.metrics[2].value, null)
  m.archetypes[1].dimensions[0].relevance = 0
  assert.ok(analyzeImportance(m).metrics.every(m => m.value === null))
})

test('direction bands have explicit boundaries and reverse correctly for clamping', () => {
  for (const [separation, status] of [[9, 'concern'], [10, 'watch'], [19, 'watch'], [20, 'good']] as const)
    assert.equal(archetypeSpaceMetrics(model([[0], [separation]])).metrics[0].status, status)
  const m = model([[0], [100]])
  const q = { ...m, pages: [{ style: null, hidden: false, questions: [{ id: 'q', type: 'MULTIPLE_CHOICE', text: 'Choose', answers: [{ weights: [{ dimensionId: 'd0', value: 0 }] }, { weights: [{ dimensionId: 'd0', value: 100 }] }] }] }] } as unknown as FullQuiz
  const analysis = analyzeQuestionSpace(q)
  assert.deepEqual(questionSpaceMetrics(analysis).map(m => m.value), [100, 100, 0, null])
  for (const [share, status] of [[.2, 'good'], [.2001, 'watch'], [.5, 'watch'], [.5001, 'concern']] as const) {
    analysis.closeMatchShare = share
    assert.equal(questionSpaceMetrics(analysis)[2].status, status)
  }
})

test('empty models expose unavailable values rather than green zeroes', () => {
  const m = model([])
  assert.deepEqual(values(m), [null, null, null])
  assert.ok(targetSpaceMetrics(m).every(m => m.status === 'unavailable'))
  const a = analyzeQuestionSpace({ ...m, pages: [] } as unknown as FullQuiz)
  assert.ok(questionSpaceMetrics(a).every(m => m.status === 'unavailable'))
})
