import { test } from 'node:test'
import assert from 'node:assert/strict'
import { paginationItems } from '../lib/pagination-items'

test('short pagination lists all pages, with bounded edge and middle ranges for large collections', () => {
  assert.deepEqual(paginationItems(1, 3), [1, 2, 3])
  assert.deepEqual(paginationItems(1, 30), [1, 2, 3, 4, 5, 'ellipsis', 30])
  assert.deepEqual(paginationItems(15, 30), [1, 'ellipsis', 14, 15, 16, 'ellipsis', 30])
  assert.deepEqual(paginationItems(30, 30), [1, 'ellipsis', 26, 27, 28, 29, 30])
})
test('compact ranges preserve first, current and last without overflowing small screens', () => {
  assert.deepEqual(paginationItems(1, 30, true), [1, 2, 'ellipsis', 30])
  assert.deepEqual(paginationItems(15, 30, true), [1, 'ellipsis', 15, 'ellipsis', 30])
  for (const page of [1, 2, 500, 999, 1000]) {
    const range = paginationItems(page, 1000, true)
    assert.ok(range.includes(page) && range.includes(1) && range.includes(1000))
    assert.ok(range.length <= 5)
  }
})
