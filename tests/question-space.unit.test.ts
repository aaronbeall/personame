import { test } from 'node:test'
import assert from 'node:assert/strict'
import type { FullQuiz } from '../lib/personas'
import { analyzeQuestionSpace, questionSpaceOptions, wilsonInterval } from '../lib/question-space'
import { scoreQuiz, type QuizResponses } from '../lib/quiz-scoring'

const dimension = { id: 'd', name: 'Curiosity' }
const answer = (id: string, value: number) => ({ id, text: id, weights: [{ dimensionId: 'd', value }] })
function fixture() {
  return {
    dimensions: [dimension],
    archetypes: [
      { id: 'low', name: 'Grounded', dimensions: [{ dimensionId: 'd', targetValue: 0, relevance: 1 }] },
      { id: 'high', name: 'Explorer', dimensions: [{ dimensionId: 'd', targetValue: 100, relevance: 1 }] },
    ],
    pages: [{ hidden: false, style: null, questions: [{ id: 'q', text: 'Explore?', type: 'MULTIPLE_CHOICE', required: true, answers: [answer('no', 0), answer('yes', 100)] }] }],
  } as unknown as FullQuiz
}

test('exact outcome counts agree with production across choice, scale and slider paths', () => {
  const quiz = fixture()
  const base = quiz.pages[0].questions[0]
  quiz.pages[0].questions = [base,
    { ...base, id: 'scale', type: 'SCALE', answers: [answer('low', 0), answer('high', 100), answer('p1', 1000), answer('p2', 1000), answer('p3', 1000)] as typeof base.answers },
    { ...base, id: 'slider', type: 'SLIDER', answers: [answer('low', 0), answer('high', 100)] as typeof base.answers },
  ]
  const expected = { low: 0, high: 0 }
  for (const answerId of ['no', 'yes']) for (const scaleId of ['p1', 'p2', 'p3']) for (let value = 0; value <= 100; value++) {
    const responses: QuizResponses = { q: { answerId }, scale: { answerId: scaleId }, slider: { value } }
    expected[scoreQuiz(quiz, responses).archetypeId as keyof typeof expected]++
  }
  const analysis = analyzeQuestionSpace(quiz)
  assert.equal(analysis.exact, true)
  assert.equal(analysis.count, 606)
  for (const outcome of analysis.outcomes) assert.equal(outcome.wins, expected[outcome.id as keyof typeof expected])
  assert.equal(analysis.axes[0].min, 0)
  assert.equal(analysis.axes[0].max, 100)
  assert.ok(analysis.closeMatchShare !== null)
})

test('slider integers, scale endpoint interpolation and missing weights match the player', () => {
  const quiz = fixture(), q = quiz.pages[0].questions[0]
  q.type = 'SLIDER'
  const options = questionSpaceOptions(q, quiz.dimensions)
  assert.equal(options.length, 101)
  assert.deepEqual(options[50], [50])
  assert.equal(analyzeQuestionSpace(quiz).outcomes[0].wins, 50) // midpoint ties use stable IDs
  q.type = 'SCALE'
  q.answers.push(answer('one', 999) as typeof q.answers[number], answer('two', 999) as typeof q.answers[number])
  assert.deepEqual(questionSpaceOptions(q, quiz.dimensions), [[0], [100]])
  q.answers[0].weights = []
  assert.deepEqual(questionSpaceOptions(q, quiz.dimensions), [[50], [100]])
})

test('hidden, cover and result pages are excluded; optional questions are answered', () => {
  const quiz = fixture()
  quiz.pages[0].questions[0].required = false
  const page = quiz.pages[0]
  quiz.pages.push({ ...page, hidden: true }, { ...page, style: 'cover' }, { ...page, style: 'results' })
  const a = analyzeQuestionSpace(quiz)
  assert.equal(a.questions.length, 1)
  assert.equal(a.count, 2)
  assert.deepEqual(a.outcomes.map(o => o.probability), [.5, .5])
  assert.equal(a.diversity, 2)
})

test('constant shifts, unmeasured axes and weighted target coverage are diagnosed', () => {
  const quiz = fixture()
  quiz.pages[0].questions[0].answers = [answer('a', 10), answer('b', 10)] as FullQuiz['pages'][number]['questions'][number]['answers']
  const a = analyzeQuestionSpace(quiz)
  assert.equal(a.axes[0].min, 10)
  assert.equal(a.axes[0].max, 10)
  assert.equal(a.axes[0].questions, 0)
  assert.equal(a.questions[0].axes[0].span, 0)
  assert.equal(a.questions[0].axes[0].mean, 10)
  assert.deepEqual(a.outcomes[0].outside, ['d'])
  assert.equal(a.outcomes[0].coverage, 0)
  quiz.archetypes[0].dimensions[0].relevance = 0
  const inactive = analyzeQuestionSpace(quiz).outcomes[0]
  assert.equal(inactive.coverage, null)
  assert.equal(inactive.active, 0)
  assert.equal(inactive.probability, 0) // no active target is ineligible
})

test('individual reachable bounds do not claim joint target reachability', () => {
  const quiz = fixture()
  quiz.dimensions.push({ ...quiz.dimensions[0], id: 'd2', name: 'Energy' })
  for (const option of quiz.pages[0].questions[0].answers) option.weights.push({ ...option.weights[0], dimensionId: 'd2' })
  quiz.archetypes.unshift({ ...quiz.archetypes[0], id: 'impossible', dimensions: [
    { ...quiz.archetypes[0].dimensions[0], targetValue: 0 },
    { ...quiz.archetypes[0].dimensions[0], dimensionId: 'd2', targetValue: 100 },
  ] })
  // Complete low/high prototypes win both attainable joint score vectors (0,0) and (100,100).
  quiz.archetypes[1].dimensions.push({ ...quiz.archetypes[1].dimensions[0], dimensionId: 'd2' })
  quiz.archetypes[2].dimensions.push({ ...quiz.archetypes[2].dimensions[0], dimensionId: 'd2' })
  const a = analyzeQuestionSpace(quiz)
  assert.equal(a.outcomes[0].coverage, 1)
  assert.equal(a.outcomes[0].probability, 0)
})

test('large spaces use deterministic bounded sampling with plausible equal-answer estimates', () => {
  const quiz = fixture(), q = quiz.pages[0].questions[0]
  quiz.pages[0].questions = Array.from({ length: 20 }, (_, i) => ({ ...q, id: `q${i}` }))
  const a = analyzeQuestionSpace(quiz), b = analyzeQuestionSpace(quiz)
  assert.equal(a.exact, false)
  assert.equal(a.count, 4096)
  assert.equal(a.paths, 2 ** 20)
  assert.deepEqual(a, b)
  assert.equal(a.outcomes.reduce((sum, o) => sum + o.wins, 0), a.count)
  // Symmetric binomial responses, with the central tie mass assigned by stable IDs.
  const expectedLow = .5 - 184756 / 2 ** 21
  assert.ok(Math.abs(a.outcomes[0].probability - expectedLow) < .03)
  assert.ok(a.outcomes[0].interval[0] < a.outcomes[0].probability)
  assert.ok(a.outcomes[0].interval[1] > a.outcomes[0].probability)
})

test('Wilson intervals remain bounded at zero and full observations', () => {
  const zero = wilsonInterval(0, 100), full = wilsonInterval(100, 100)
  assert.ok(Math.abs(zero[0]) < 1e-12)
  assert.ok(Math.abs(zero[1] - .03699) < .0001)
  assert.ok(Math.abs(full[0] - .96301) < .0001)
  assert.ok(Math.abs(full[1] - 1) < 1e-12)
})

test('incomplete and empty models do not fabricate results', () => {
  const quiz = fixture()
  quiz.pages[0].questions[0].answers = []
  assert.equal(analyzeQuestionSpace(quiz).count, 0)
  assert.deepEqual(analyzeQuestionSpace(quiz).invalid, ['q'])
  quiz.pages = []
  assert.equal(analyzeQuestionSpace(quiz).count, 0)
  quiz.dimensions = []
  quiz.archetypes = []
  assert.equal(analyzeQuestionSpace(quiz).count, 0)
})

test('per-dimension influence is shared by production scoring, reachable bounds and flow links', () => {
  const quiz = fixture()
  quiz.dimensions.push({ ...quiz.dimensions[0], id: 'd2', name: 'Company' })
  quiz.archetypes.forEach(a => a.dimensions.push({ ...a.dimensions[0], dimensionId: 'd2' }))
  const first = quiz.pages[0].questions[0]
  first.answers.forEach(a => a.weights.push({ ...a.weights[0], dimensionId: 'd2' }))
  first.dimensionInfluences = { d: 3, d2: 1 }
  const second = { ...first, id: 'constant', dimensionInfluences: { d: 1, d2: 3 }, answers: first.answers.map(a => ({ ...a, weights: a.weights.map(w => ({ ...w, value: 20 })) })) }
  quiz.pages[0].questions.push(second)
  const scores = scoreQuiz(quiz, { q: { answerId: 'yes' }, constant: { answerId: 'no' } }).scores
  assert.deepEqual(scores.map(s => s.score), [80, 40])
  const analysis = analyzeQuestionSpace(quiz)
  assert.deepEqual(analysis.axes.map(a => [a.min, a.max]), [[5, 80], [15, 40]])
  assert.deepEqual(analysis.questions[0].axes.map(a => a.span), [75, 25])
})
