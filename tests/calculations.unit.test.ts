import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  calculateDimensionScores,
  findBestArchetype,
  calculatePercentile,
} from '../lib/quiz-calculations'
const dimensions = [
  { id: 'x', name: 'Curiosity' },
  { id: 'y', name: 'Company' },
]
test('unanswered dimensions retain an explicitly unmeasured fallback; positions affect only mapped dimensions', () => {
  assert.deepEqual(
    calculateDimensionScores([], dimensions).map((s) => s.score),
    [50, 50],
  )
  assert.deepEqual(
    calculateDimensionScores(
      [
        {
          weights: [
            { dimensionId: 'x', value: 100 },
            { dimensionId: 'unknown', value: 20 },
          ],
        },
      ],
      dimensions,
    ).map((s) => s.score),
    [100, 50],
  )
})
test('defensive position bounds stay between zero and one hundred', () => {
  assert.deepEqual(
    calculateDimensionScores(
      [
        {
          weights: [
            { dimensionId: 'x', value: 300 },
            { dimensionId: 'y', value: -300 },
          ],
        },
      ],
      dimensions,
    ).map((s) => s.score),
    [100, 0],
  )
})
test('weighted averaging is independent of answer order', () => {
  const answers = [10, 90, 20].map((value) => ({
    weights: [{ dimensionId: 'x', value }],
  }))
  assert.deepEqual(
    calculateDimensionScores(answers, dimensions),
    calculateDimensionScores([...answers].reverse(), dimensions),
  )
  assert.equal(calculateDimensionScores(answers, dimensions)[0].score, 40)
})
test('matching uses relevance-weighted RMS distance, not an unweighted average', () => {
  const scores = [
    { dimensionId: 'x', dimensionName: 'x', score: 80 },
    { dimensionId: 'y', dimensionName: 'y', score: 20 },
  ]
  const result = findBestArchetype(scores, [
    {
      id: 'a',
      name: 'a',
      dimensions: [
        { dimensionId: 'x', targetValue: 100, relevance: 1 },
        { dimensionId: 'y', targetValue: 100, relevance: 0 },
      ],
    },
  ])!
  assert.equal(result.distance, 20)
  assert.equal(result.matchScore, 80)
  const weighted = findBestArchetype(scores, [
    {
      id: 'a',
      name: 'a',
      dimensions: [
        { dimensionId: 'x', targetValue: 100, relevance: 1 },
        { dimensionId: 'y', targetValue: 100, relevance: 0.25 },
      ],
    },
  ])!
  assert.equal(weighted.distance, Math.sqrt((400 + 1600) / 1.25))
})
test('matching ties use stable identifiers and a perfect match scores 100', () => {
  const scores = [{ dimensionId: 'x', dimensionName: 'x', score: 50 }]
  const archetypes = ['first', 'second'].map((id) => ({
    id,
    name: id,
    dimensions: [{ dimensionId: 'x', targetValue: 50, relevance: 1 }],
  }))
  assert.equal(findBestArchetype(scores, archetypes)?.archetypeId, 'first')
  assert.equal(findBestArchetype(scores, archetypes)?.matchScore, 100)
  assert.equal(findBestArchetype(scores, []), null)
})
test('percentile handles empty populations, extremes and ties without mutating input', () => {
  const population = [90, 10, 50, 50]
  assert.equal(calculatePercentile(50, []), 50)
  assert.equal(calculatePercentile(0, population), 0)
  assert.equal(calculatePercentile(100, population), 100)
  assert.equal(calculatePercentile(50, population), 25)
  assert.deepEqual(population, [90, 10, 50, 50])
})


test('question count automatically shares the pie, while influence controls relative share', () => {
  const answer = (value: number, influence = 1) => ({ influence, weights: [{ dimensionId: 'x', value }] })
  const two = [answer(80), answer(40)]
  assert.equal(calculateDimensionScores(two, dimensions)[0].score, 60)
  assert.equal(calculateDimensionScores(Array.from({ length: 10 }, () => two).flat(), dimensions)[0].score, 60)
  assert.ok(Math.abs(calculateDimensionScores([answer(80, 2), answer(40)], dimensions)[0].score - 200 / 3) < 1e-10)
  assert.equal(calculateDimensionScores([answer(80), { influence: 100, weights: [] }], dimensions)[0].score, 80)
  const missing = calculateDimensionScores([], dimensions)
  assert.equal(missing[0].evidenceCount, 0)
  assert.equal(findBestArchetype(missing, [{ id: 'a', name: 'a', dimensions: [{ dimensionId: 'x', targetValue: 50, relevance: 1 }] }]), null)
})

test('one question can have strong influence on one dimension and weak influence on another', () => {
  const answers = [
    { weights: [{ dimensionId: 'x', value: 100, influence: 3 }, { dimensionId: 'y', value: 100, influence: 1 }] },
    { weights: [{ dimensionId: 'x', value: 0, influence: 1 }, { dimensionId: 'y', value: 0, influence: 3 }] },
  ]
  assert.deepEqual(calculateDimensionScores(answers, dimensions).map(s => s.score), [75, 25])
  assert.deepEqual(calculateDimensionScores(Array.from({ length: 10 }, () => answers).flat(), dimensions).map(s => s.score), [75, 25])
})
