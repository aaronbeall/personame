import { test } from 'node:test'
import assert from 'node:assert/strict'
import { describeDimensionValue } from '../lib/dimension-value'

test('descriptors are symmetric and identify the dominant endpoint', () => {
  for (const [value, intensity] of [
    [60, 'Slightly'],
    [70, 'Somewhat'],
    [80, 'Moderately'],
    [90, 'Very'],
    [100, 'Extremely'],
  ] as const) {
    assert.equal(
      describeDimensionValue(value, 'Serious', 'Silly').description,
      `${intensity} Silly`,
    )
    assert.equal(
      describeDimensionValue(100 - value, 'Serious', 'Silly').description,
      `${intensity} Serious`,
    )
  }
})
test('midpoint is balanced, endpoints remain bounded, and decimal scores are retained', () => {
  assert.equal(
    describeDimensionValue(50, 'Serious', 'Silly').description,
    'Balanced — Serious / Silly',
  )
  assert.equal(describeDimensionValue(50, 'Serious', 'Silly').end, null)
  assert.equal(describeDimensionValue(90.5, 'Serious', 'Silly').score, 90.5)
  assert.equal(describeDimensionValue(101, 'Serious', 'Silly').score, 100)
  assert.equal(describeDimensionValue(-1, 'Serious', 'Silly').score, 0)
  assert.equal(describeDimensionValue(NaN, 'Serious', 'Silly').score, 50)
  assert.equal(describeDimensionValue(49.9, 'Serious', 'Silly').end, 'low')
  assert.equal(describeDimensionValue(50.1, 'Serious', 'Silly').end, 'high')
})
