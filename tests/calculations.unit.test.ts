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
test('unanswered dimensions remain neutral; weights affect only their own dimensions', () => {
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
test('positive and negative totals clamp at both score bounds', () => {
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
test('score accumulation is independent of answer order, including overshoot', () => {
  const answers = [-100, 90, 20].map((value) => ({
    weights: [{ dimensionId: 'x', value }],
  }))
  assert.deepEqual(
    calculateDimensionScores(answers, dimensions),
    calculateDimensionScores([...answers].reverse(), dimensions),
  )
  assert.equal(calculateDimensionScores(answers, dimensions)[0].score, 60)
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
test('matching ties keep creator order and a perfect match scores 100', () => {
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
