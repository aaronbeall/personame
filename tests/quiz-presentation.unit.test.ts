import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parse as parseYaml } from 'yaml'
import { readFileSync } from 'node:fs'
import { parseCatalog, compileCatalogQuiz } from '../lib/quiz-catalog'
import { pagePresentation, pagePresentationSchema } from '../lib/quiz-presentation'
import { scoringModelKey } from '../lib/scoring-model-key'
import { scoreQuiz } from '../lib/quiz-scoring'

test('older pages get complete presentation defaults and malformed settings fail validation', () => {
  assert.equal(pagePresentation().startLabel, 'Let’s find out')
  assert.equal(pagePresentation({layout:'split',showComparison:false}).showComparison, false)
  assert.equal(pagePresentationSchema.safeParse({layout:'invalid'}).success,false)
  assert.equal(pagePresentationSchema.safeParse({startLabel:''}).success,false)
})
test('comparison cohort ignores visual edits but changes when the scoring model changes', () => {
  const quiz = compileCatalogQuiz(parseCatalog(parseYaml(readFileSync('content/seed-quizzes.yaml','utf8'))).quizzes[0])
  const key = scoringModelKey(quiz)
  const changed = structuredClone(quiz)
  changed.title = 'New cover name'
  changed.color = '#12ffaa'
  changed.pages[0].presentation = {layout:'minimal'}
  assert.equal(scoringModelKey(changed),key)
  const semanticEdit = structuredClone(quiz)
  semanticEdit.dimensions[0].maxLabel = 'A different meaning'
  assert.notEqual(scoringModelKey(semanticEdit),key)
  const question = changed.pages.flatMap(p=>p.questions)[0]
  question.answers[0].weights[0].value += 1
  assert.notEqual(scoringModelKey(changed),key)
})
test('the result captures configured presentation without changing its scoring identity', () => {
  const quiz = compileCatalogQuiz(parseCatalog(parseYaml(readFileSync('content/seed-quizzes.yaml','utf8'))).quizzes[0])
  quiz.pages.find(p=>p.style==='results')!.presentation = {layout:'card',showDimensions:false}
  const responses = Object.fromEntries(quiz.pages.flatMap(p=>p.questions).map(q=>[q.id,q.type==='SLIDER'?{value:50}:{answerId:q.answers[q.type==='SCALE'?2:0].id}]))
  const scored = scoreQuiz(quiz,responses)
  assert.equal(scored.snapshot.resultPage?.presentation.layout,'card')
  assert.equal(scored.snapshot.resultPage?.presentation.showDimensions,false)
  assert.equal(scored.snapshot.modelKey,scoringModelKey(quiz))
})
