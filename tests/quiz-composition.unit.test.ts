import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parse } from 'yaml'
import { compileCatalogQuiz, parseCatalog } from '../lib/quiz-catalog'
import { getQuizComposition } from '../lib/quiz-composition'
import { readiness } from '../lib/quiz-validation'
const definition = parseCatalog(
  parse(readFileSync('content/seed-quizzes.yaml', 'utf8')),
).quizzes[0]

test('composition routes a complete draft to publish, and marks publication only when live', () => {
  const quiz = compileCatalogQuiz(definition)
  quiz.status = 'DRAFT'
  const progress = getQuizComposition(quiz)
  assert.equal(progress.next, 'preview')
  assert.equal(progress.readyToPublish, true)
  assert.deepEqual(
    progress.stages.map((s) => s.state),
    ['complete', 'complete', 'complete', 'complete', 'next'],
  )
  quiz.status = 'PUBLISHED'
  assert.ok(
    getQuizComposition(quiz).stages.every((s) => s.state === 'complete'),
  )
})
test('composition uses actual readiness, not record counts, and excludes hidden questions', () => {
  const quiz = compileCatalogQuiz(definition)
  quiz.status = 'DRAFT'
  quiz.pages[1].questions.forEach((q) =>
    q.answers.forEach((a) => (a.weights = [])),
  )
  assert.equal(getQuizComposition(quiz).next, 'questions')
  assert.equal(getQuizComposition(quiz).readyToPublish, false)
  assert.ok(readiness(quiz).some((issue) => issue.includes('Map at least')))
  quiz.pages[1].hidden = true
  assert.equal(
    getQuizComposition(quiz).stages.find((s) => s.key === 'questions')?.count,
    0,
  )
  quiz.archetypes = []
  assert.equal(getQuizComposition(quiz).next, 'archetypes')
  quiz.dimensions = []
  assert.equal(getQuizComposition(quiz).next, 'dimensions')
  quiz.title = ' '
  assert.equal(getQuizComposition(quiz).next, 'name')
})
