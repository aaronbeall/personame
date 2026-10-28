import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parseCatalog, compileCatalogQuiz } from '../lib/quiz-catalog'
import { scoreQuiz, type QuizResponses } from '../lib/quiz-scoring'
import { readiness } from '../lib/quiz-validation'
const raw = JSON.parse(readFileSync('content/seed-quizzes.json', 'utf8'))
const catalog = parseCatalog(raw)
for (const definition of catalog.quizzes)
  test(`${definition.title}: valid, scores all question types, every archetype reachable`, () => {
    const quiz = compileCatalogQuiz(definition)
    assert.deepEqual(readiness(quiz), [])
    const questions = quiz.pages[1].questions
    const matches = new Set<string>()
    // Explore all low/high combinations, not just one happy-path result.
    for (let mask = 0; mask < 2 ** questions.length; mask++) {
      const responses: QuizResponses = {}
      questions.forEach((q, i) => {
        const high = !!(mask & (1 << i))
        responses[q.id] =
          q.type === 'SLIDER'
            ? { value: high ? 100 : 0 }
            : {
                answerId:
                  q.answers[
                    q.type === 'SCALE'
                      ? high
                        ? q.answers.length - 1
                        : 2
                      : high
                        ? q.answers.length - 1
                        : 0
                  ].id,
              }
      })
      const result = scoreQuiz(quiz, responses)
      matches.add(result.archetypeId)
      assert.ok(result.scores.every((s) => s.score >= 0 && s.score <= 100))
    }
    assert.equal(
      matches.size,
      definition.archetypes.length,
      'An archetype cannot be reached by any extreme response pattern',
    )
  })
test('catalog rejects duplicate slugs and undefined or missing dimension references', () => {
  const duplicate = structuredClone(raw)
  duplicate.quizzes.push(duplicate.quizzes[0])
  assert.throws(() => parseCatalog(duplicate), /Duplicate/)
  const unknown = structuredClone(raw)
  unknown.quizzes[0].questions[0].answers[0].weights.typo = 1
  assert.throws(() => parseCatalog(unknown), /unknown dimension/)
  const missing = structuredClone(raw)
  delete missing.quizzes[0].archetypes[0].targets.novelty
  assert.throws(() => parseCatalog(missing), /exactly/)
})
test('readiness excludes hidden, cover and results questions from dimension coverage', () => {
  const quiz = compileCatalogQuiz(catalog.quizzes[0])
  quiz.pages[1].hidden = true
  assert.ok(readiness(quiz).some((s) => s.includes('visible question')))
  assert.ok(readiness(quiz).some((s) => s.includes('non-zero')))
  for (const style of ['cover', 'results']) {
    quiz.pages[1].hidden = false
    quiz.pages[1].style = style
    assert.ok(readiness(quiz).some((s) => s.includes('visible question')))
  }
})
test('scoring rejects slider values outside bounds and scale endpoints as choices', () => {
  const quiz = compileCatalogQuiz(catalog.quizzes[0])
  const questions = quiz.pages[1].questions
  const responses: QuizResponses = Object.fromEntries(
    questions.map((q) => [
      q.id,
      q.type === 'SLIDER'
        ? { value: 50 }
        : { answerId: q.answers[q.type === 'SCALE' ? 2 : 0].id },
    ]),
  )
  const slider = questions.find((q) => q.type === 'SLIDER')!,
    scale = questions.find((q) => q.type === 'SCALE')!
  for (const value of [-1, 101, NaN, Infinity])
    assert.throws(
      () => scoreQuiz(quiz, { ...responses, [slider.id]: { value } }),
      /Choose/,
    )
  assert.throws(
    () =>
      scoreQuiz(quiz, {
        ...responses,
        [scale.id]: { answerId: scale.answers[0].id },
      }),
    /Choose/,
  )
  const empty = structuredClone(quiz)
  empty.archetypes = []
  assert.throws(() => scoreQuiz(empty, responses), /archetype/)
})
test('publishing rejects blank text, missing options, foreign weights and zero-only scoring', () => {
  const quiz = compileCatalogQuiz(catalog.quizzes[0])
  quiz.title = ' '
  quiz.archetypes[0].name = ' '
  quiz.pages[1].questions[0].text = ' '
  quiz.pages[1].questions[0].answers[0].text = ' '
  quiz.pages[1].questions[0].answers[0].weights.push({
    dimensionId: 'foreign',
    value: 1,
  } as never)
  quiz.pages[1].questions[1].answers = []
  const issues = readiness(quiz).join(' ')
  for (const text of [
    'title',
    'Name every',
    'question some text',
    'answer labels',
    'Repair',
    'two answers',
  ])
    assert.ok(issues.includes(text), text)
  const zero = compileCatalogQuiz(catalog.quizzes[0])
  zero.pages[1].questions.forEach((q) =>
    q.answers.forEach((a) => a.weights.forEach((w) => (w.value = 0))),
  )
  assert.equal(readiness(zero).filter((s) => s.includes('non-zero')).length, 2)
})

test('editable catalog preserves curated theme lists on quizzes, dimensions and archetypes', () => {
  const themed = structuredClone(raw)
  const value = '#2563eb,#7c3aed'
  themed.quizzes[0].color = value
  themed.quizzes[0].dimensions[0].color = value
  themed.quizzes[0].archetypes[0].color = value
  const definition = parseCatalog(themed).quizzes[0]
  const quiz = compileCatalogQuiz(definition)
  assert.equal(quiz.color, value)
  assert.equal(quiz.dimensions[0].color, value)
  assert.equal(quiz.archetypes[0].color, value)
})
