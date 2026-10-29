import { test } from 'node:test'
import assert from 'node:assert/strict'
import { retryTransaction } from '../lib/transaction-retry'
import { fieldsChanged, relationshipsChanged, inBatches } from '../lib/editor-diff'
import { listParameters } from '../lib/pagination'
import { pagesInput } from '../lib/editor-schemas'

test('serialization retries restart the complete operation, stop at the bound, and preserve other errors', async () => {
  let attempts = 0
  const conflict = Object.assign(new Error('conflict'), { code: 'P2034' })
  const sleep = async () => {}
  assert.equal(await retryTransaction(async () => { if (++attempts < 3) throw conflict; return 'committed' }, { sleep }), 'committed')
  assert.equal(attempts, 3)
  attempts = 0
  await assert.rejects(retryTransaction(async () => { attempts++; throw conflict }, { attempts: 2, sleep }), error => error === conflict)
  assert.equal(attempts, 2)
  const other = Object.assign(new Error('bad input'), { code: 'P2002' })
  await assert.rejects(retryTransaction(async () => { throw other }, { sleep }), error => error === other)
})
test('unchanged editor data ignores database metadata and relationship order while detecting removals', () => {
  assert.equal(fieldsChanged({ name: 'A', description: null, updatedAt: new Date() }, { name: 'A', description: undefined }), false)
  assert.equal(fieldsChanged({ name: 'A' }, { name: 'B' }), true)
  assert.equal(fieldsChanged({ dimensionInfluences: { x: 2, y: 1 } }, { dimensionInfluences: { y: 1, x: 2 } }), false)
  assert.equal(fieldsChanged({ dimensionInfluences: { x: 2 } }, { dimensionInfluences: { x: 3 } }), true)
  const before = [{ id: 'one', dimensionId: 'x', value: 1 }, { id: 'two', dimensionId: 'y', value: 2 }]
  assert.equal(relationshipsChanged(before, [{ dimensionId: 'y', value: 2 }, { dimensionId: 'x', value: 1 }], ['dimensionId', 'value']), false)
  assert.equal(relationshipsChanged(before, [{ dimensionId: 'x', value: 1 }], ['dimensionId', 'value']), true)
})
test('batching keeps large inserts bounded without losing rows', async () => {
  const batches: number[][] = []
  await inBatches(Array.from({ length: 2501 }, (_, i) => i), async rows => { batches.push(rows) })
  assert.deepEqual(batches.map(rows => rows.length), [1000, 1000, 501])
  assert.equal(batches.flat().length, 2501)
})
test('pagination rejects unbounded inputs and editor limits apply to the entire quiz', () => {
  assert.equal(listParameters(new Request('http://local/?page=2&limit=10')).skip, 10)
  for (const query of ['limit=100000', 'page=-1', 'page=NaN']) assert.throws(() => listParameters(new Request(`http://local/?${query}`)))
  const question = { text: 'Question', type: 'MULTIPLE_CHOICE', order: 0, answers: [] }
  assert.equal(pagesInput.safeParse({ pages: Array.from({ length: 6 }, (_, order) => ({ order, questions: Array.from({ length: 50 }, () => question) })) }).success, false)
})
