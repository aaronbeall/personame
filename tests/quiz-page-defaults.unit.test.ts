import { test } from 'node:test'
import assert from 'node:assert/strict'
import { withQuizBookends } from '../lib/quiz-page-defaults'
type Page = { id: string; style: string | null; order: number; title: string; questions: string[] }
const create = (style: 'cover' | 'results'): Page => ({ id: `new-${style}`, style, order: 0, title: style, questions: [] as string[] })
test('missing cover and results pages are restored around existing questions', () => {
  const content: Page = { id: 'content', style: null, order: 0, title: 'Authored questions', questions: ['q1', 'q2'] }
  const original = structuredClone(content)
  const pages = withQuizBookends([content], create)
  assert.deepEqual(pages.map(p => p.style), ['cover', null, 'results'])
  assert.deepEqual(pages[1].questions, ['q1', 'q2'])
  assert.deepEqual(pages.map(p => p.order), [0, 1, 2])
  assert.deepEqual(content, original)
})
test('existing special pages keep their identity and content and are not duplicated', () => {
  const cover = { ...create('cover'), id: 'saved-cover', title: 'Custom welcome' }
  const results = { ...create('results'), id: 'saved-results', title: 'Your custom result' }
  for (const pages of [[cover], [results], [cover, results]]) {
    const completed = withQuizBookends(pages, create)
    assert.equal(completed.filter(p => p.style === 'cover').length, 1)
    assert.equal(completed.filter(p => p.style === 'results').length, 1)
    for (const original of pages) assert.equal(completed.find(p => p.id === original.id)?.title, original.title)
    assert.deepEqual(withQuizBookends(completed, () => { throw new Error('Must not add duplicate pages') }), completed)
  }
  assert.deepEqual(withQuizBookends([], create).map(p => p.style), ['cover', 'results'])
})
