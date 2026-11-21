import { test } from 'node:test'
import assert from 'node:assert/strict'
import { quizTagsSchema } from '../lib/quiz-tags'

test('quiz tags are normalized, unique and bounded', () => {
  assert.deepEqual(quizTagsSchema.parse(['  SPACE  CREW ', 'space crew', 'Café']), ['space crew', 'café'])
  assert.deepEqual(quizTagsSchema.parse([]), [])
  for (const input of [[' '], ['x'.repeat(33)], Array.from({ length: 13 }, (_, i) => String(i))]) {
    assert.equal(quizTagsSchema.safeParse(input).success, false)
  }
})
