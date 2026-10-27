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
                    option('low', -50),
                    option('high', 50),
                    option('one', 0),
                    option('two', 0),
                    option('three', 0),
                  ]
                : [option('low', -50), option('high', 50)],
          },
        ],
      },
    ],
  } as unknown as FullQuiz
}
test('zero remains zero before subsequent weights; clamping happens at the end', () => {
  assert.equal(
    calculateDimensionScores(
      [
        { weights: [{ dimensionId: 'm', value: -50 }] },
        { weights: [{ dimensionId: 'm', value: 10 }] },
      ],
      [dimension],
    )[0].score,
    10,
  )
  assert.equal(
    calculateDimensionScores(
      [
        { weights: [{ dimensionId: 'm', value: -100 }] },
        { weights: [{ dimensionId: 'm', value: 80 }] },
      ],
      [dimension],
    )[0].score,
    30,
  )
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
  assert.equal(scoreQuiz(quiz, {}).scores[0].score, 50)
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
