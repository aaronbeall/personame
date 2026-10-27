import { test } from 'node:test'
import assert from 'node:assert/strict'
import { quizDetailsSchema } from '../lib/quiz-details'

test('quiz details trim names and preserve optional style values', () => {
  assert.deepEqual(
    quizDetailsSchema.parse({
      title: '  A little curiosity  ',
      emoji: '🧠',
      color: '#8b5cf6',
    }),
    { title: 'A little curiosity', emoji: '🧠', color: '#8b5cf6' },
  )
  assert.equal(quizDetailsSchema.parse({ title: 'Minimal' }).title, 'Minimal')
})
test('quiz details reject blank names, excessive text, and unsupported colors', () => {
  for (const value of [
    { title: ' ' },
    { title: 'x'.repeat(201) },
    { title: 'Valid', description: 'x'.repeat(2001) },
    { title: 'Valid', color: 'not-a-palette-color' },
    { title: 'Valid', emoji: 'x'.repeat(65) },
  ])
    assert.equal(quizDetailsSchema.safeParse(value).success, false)
})
