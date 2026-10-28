import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readProgress, progressKey } from '../lib/participant-progress'
const attempt = {
  quizId: 'quiz-1',
  slug: 'quiz',
  title: 'A quiz',
  description: null,
  color: '#123456',
  emoji: null,
  revision: 'r1',
  answered: 1,
  total: 6,
  updatedAt: '2026-10-28T12:00:00Z',
}
test('Progress ignores corrupt and invalid saved records', () => {
  for (const raw of [null, '{broken', '{}', 'null'])
    assert.deepEqual(readProgress(raw), [])
  assert.deepEqual(
    readProgress(
      JSON.stringify([
        attempt,
        null,
        { ...attempt, answered: 7 },
        { ...attempt, total: 0 },
        { ...attempt, slug: 3 },
      ]),
    ),
    [attempt],
  )
})
test('Progress is sorted by recency and uses separate account storage keys', () => {
  const newer = {
    ...attempt,
    quizId: 'quiz-2',
    updatedAt: '2026-10-28T13:00:00Z',
  }
  assert.deepEqual(readProgress(JSON.stringify([attempt, newer])), [
    newer,
    attempt,
  ])
  assert.notEqual(
    progressKey('first@example.com'),
    progressKey('second@example.com'),
  )
})
