import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  calculateDimensionScores,
  findBestArchetype,
} from '../lib/quiz-calculations'
import { scoreQuiz } from '../lib/quiz-scoring'
import { readiness } from '../lib/quiz-validation'
import type { FullQuiz } from '../lib/personas'
const dimension = {
  id: 'm',
  name: 'Curiosity',
  minLabel: 'Grounded',
  maxLabel: 'Exploratory',
}
const option = (id: string, value: number) => ({
  id,
  text: id,
  weights: [{ dimensionId: 'm', value }],
})
function fixture(type = 'MULTIPLE_CHOICE') {
  return {
    title: 'Curiosity quiz',
    slug: 'curiosity',
    dimensions: [dimension],
    archetypes: [
      {
        id: 'low',
        name: 'Grounded',
        description: 'Grounded',
        emoji: '🌱',
        color: null,
        dimensions: [{ dimensionId: 'm', targetValue: 0, relevance: 1 }],
      },
      {
        id: 'high',
        name: 'Explorer',
        description: 'Curious',
        emoji: '✨',
        color: null,
        dimensions: [{ dimensionId: 'm', targetValue: 100, relevance: 1 }],
      },
    ],
    pages: [
      { style: 'cover', hidden: false, questions: [] },
      {
        style: null,
        hidden: false,
        questions: [
          {
            id: 'q',
            text: 'Explore?',
            required: true,
            type,
            answers:
              type === 'SCALE'
                ? [
                    option('low', 0),
                    option('high', 100),
                    option('one', 0),
                    option('two', 0),
                    option('three', 0),
                  ]
                : [option('low', 0), option('high', 100)],
          },
        ],
      },
    ],
  } as unknown as FullQuiz
}
test('adding equivalent evidence does not change the scale', () => {
  const a = { weights: [{ dimensionId: 'm', value: 80 }] }
  assert.equal(calculateDimensionScores([a, a], [dimension])[0].score, 80)
  assert.equal(calculateDimensionScores(Array(20).fill(a), [dimension])[0].score, 80)
})
test('choice scores and nearest archetype reflect actual submitted options', () => {
  const result = scoreQuiz(fixture(), { q: { answerId: 'high' } })
  assert.equal(result.snapshot.scores[0].score, 100)
  assert.equal(result.archetypeId, 'high')
  assert.equal(
    scoreQuiz(fixture(), { q: { answerId: 'low' } }).archetypeId,
    'low',
  )
})
test('slider weights interpolate at both ends and at midpoint', () => {
  for (const value of [0, 25, 50, 75, 100])
    assert.equal(
      scoreQuiz(fixture('SLIDER'), { q: { value } }).scores[0].score,
      value,
    )
})
test('scale interpolates endpoint weights at the chosen point, not its label weights', () => {
  for (const [answerId, score] of [
    ['one', 0],
    ['two', 50],
    ['three', 100],
  ] as const)
    assert.equal(
      scoreQuiz(fixture('SCALE'), { q: { answerId } }).scores[0].score,
      score,
    )
})
test('required, foreign, malformed, and hidden answers cannot be submitted', () => {
  assert.throws(() => scoreQuiz(fixture(), {}), /Answer/)
  assert.throws(
    () => scoreQuiz(fixture(), { q: { answerId: 'foreign' } }),
    /Choose/,
  )
  assert.throws(
    () => scoreQuiz(fixture(), { other: { answerId: 'high' } }),
    /not in/,
  )
  assert.throws(
    () => scoreQuiz(fixture('SLIDER'), { q: { value: NaN } }),
    /Choose/,
  )
  assert.throws(
    () => scoreQuiz(fixture('SLIDER'), { q: { value: 101 } }),
    /Choose/,
  )
  const hidden = fixture()
  hidden.pages[1].hidden = true
  assert.throws(() => scoreQuiz(hidden, { q: { answerId: 'high' } }), /not in/)
})
test('optional skipped questions are neutral and snapshots are independent of later edits', () => {
  const quiz = fixture()
  quiz.pages[1].questions[0].required = false
  assert.throws(() => scoreQuiz(quiz, {}), /not enough answered/)
  const result = scoreQuiz(quiz, { q: { answerId: 'high' } })
  quiz.archetypes[1].name = 'Changed'
  quiz.dimensions[0].name = 'Changed'
  assert.equal(result.snapshot.archetype.name, 'Explorer')
  assert.equal(result.snapshot.scores[0].dimensionName, 'Curiosity')
})
test('publish checklist rejects empty quizzes and missing meaningful targets or weights', () => {
  assert.deepEqual(readiness(fixture()), [])
  const quiz = fixture()
  quiz.archetypes[0].dimensions = []
  assert.ok(readiness(quiz).some((i) => i.includes('targets')))
  quiz.pages = []
  assert.ok(readiness(quiz).some((i) => i.includes('visible question')))
  assert.equal(findBestArchetype([], []), null)
})

test('result snapshots preserve endpoint emoji independently of later edits', () => {
  const quiz = fixture()
  quiz.dimensions = quiz.dimensions.map((m) => ({
    ...m,
    minEmoji: '🌱',
    maxEmoji: '🚀',
  }))
  const result = scoreQuiz(quiz, { q: { answerId: 'high' } })
  assert.equal(result.snapshot.scores[0].minEmoji, '🌱')
  assert.equal(result.snapshot.scores[0].maxEmoji, '🚀')
  quiz.dimensions[0].minEmoji = null
  assert.equal(result.snapshot.scores[0].minEmoji, '🌱')
  assert.equal(result.snapshot.scores[0].score, 100)
})

test('result snapshots retain complete dimension and archetype themes', () => {
  const quiz = fixture()
  quiz.dimensions[0] = { ...quiz.dimensions[0], color: '#7c3aed,#db2777' }
  quiz.archetypes[1].color = '#2563eb,#7c3aed'
  const result = scoreQuiz(quiz, { q: { answerId: 'high' } })
  assert.equal(result.snapshot.scores[0].color, '#7c3aed,#db2777')
  assert.equal(result.snapshot.archetype.color, '#2563eb,#7c3aed')
  assert.equal(result.snapshot.scores[0].score, 100)
})


test('close and exactly tied matches are explicit, reproducible and snapshots keep evidence', () => {
  const quiz = fixture('SLIDER')
  const result = scoreQuiz(quiz, { q: { value: 50 } })
  assert.equal(result.snapshot.scoringVersion, 2)
  assert.equal(result.snapshot.ambiguous, true)
  assert.equal(result.snapshot.matchMargin, 0)
  assert.equal(result.snapshot.alternatives?.[0].tied, true)
  assert.equal(result.scores[0].evidenceCount, 1)
  quiz.archetypes.reverse()
  assert.equal(scoreQuiz(quiz, { q: { value: 50 } }).archetypeId, result.archetypeId)
})

test('optional missing evidence is excluded, while neutral and zero remain meaningful answers', () => {
  const quiz = fixture('SLIDER')
  quiz.dimensions.push({ ...quiz.dimensions[0], id: 'unmeasured', name: 'Not asked' })
  const snapshot = scoreQuiz(quiz, { q: { value: 0 } }).snapshot
  assert.equal(snapshot.scores[0].score, 0)
  assert.equal(snapshot.scores[0].evidenceCount, 1)
  assert.equal(snapshot.scores[1].evidenceCount, 0)
  assert.equal(scoreQuiz(quiz, { q: { value: 50 } }).scores[0].score, 50)
})
