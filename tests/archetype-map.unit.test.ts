import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createAtlasCamera, projectAtlasPreview, targetPosition } from '../lib/atlas-camera'
import { atlasMarkerRadius, projectTarget, combinationAt, combinationCount, rankDimensions } from '../lib/archetype-map'

test('2D mapping keeps low/high direction and single dimension placement consistent', () => {
  assert.deepEqual(projectTarget([0, 0]), { x: 90, y: 345, depth: 0 })
  assert.deepEqual(projectTarget([100, 100]), { x: 510, y: 75, depth: 0 })
  assert.equal(projectTarget([25]).y, 210)
})
test('3D positions and thumbnails use the perspective scene camera and keep the cube visible', () => {
  assert.deepEqual(targetPosition([0, 50, 100]).toArray(), [-1, 0, 1])
  const camera = createAtlasCamera()
  assert.equal(camera.isPerspectiveCamera, true)
  const center = projectAtlasPreview([50, 50, 50])
  assert.ok(Math.abs(center.x - 300) < 0.00001 && Math.abs(center.y - 220) < 0.00001)
  for (const x of [0, 100]) for (const y of [0, 100]) for (const z of [0, 100]) {
    const point = projectAtlasPreview([x, y, z])
    assert.ok(point.x > 0 && point.x < 600 && point.y > 0 && point.y < 440)
  }
  assert.notEqual(projectAtlasPreview([100, 50, 50]).x, projectAtlasPreview([50, 50, 100]).x)
})
test('dimension combinations are unordered, unique, complete, and accessible by index', () => {
  assert.equal(combinationCount(3, 2), 3)
  assert.equal(combinationCount(4, 3), 4)
  assert.equal(combinationCount(10, 3), 120)
  assert.equal(combinationCount(2, 3), 0)
  const items = ['a', 'b', 'c', 'd']
  assert.deepEqual(Array.from({ length: 6 }, (_, i) => combinationAt(items, 2, i)), [['a', 'b'], ['a', 'c'], ['a', 'd'], ['b', 'c'], ['b', 'd'], ['c', 'd']])
  assert.deepEqual(combinationAt(items, 3, 3), ['b', 'c', 'd'])
  assert.deepEqual(combinationAt(items, 3, 4), [])
  assert.deepEqual(combinationAt(items, 2, -1), [])
  assert.deepEqual(combinationAt(items, 4, 0), items)
  assert.equal(new Set(Array.from({ length: 120 }, (_, i) => combinationAt(Array.from({ length: 10 }, (_, j) => j), 3, i).join(','))).size, 120)
})
test('automatic axes rank target spread, break ties by authored order and ignore missing targets', () => {
  const dimensions = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'missing' }]
  const archetypes = [{ dimensions: [{ dimensionId: 'a', targetValue: 50 }, { dimensionId: 'b', targetValue: 0 }, { dimensionId: 'c', targetValue: 20 }] }, { dimensions: [{ dimensionId: 'a', targetValue: 50 }, { dimensionId: 'b', targetValue: 100 }, { dimensionId: 'c', targetValue: 80 }] }]
  assert.deepEqual(rankDimensions(dimensions, archetypes).map(d => d.id), ['b', 'c', 'a', 'missing'])
  assert.deepEqual(dimensions.map(d => d.id), ['a', 'b', 'c', 'missing'])
})

test('fourth-dimension size preserves zero, scales area linearly, and keeps missing values neutral', () => {
  const zero = atlasMarkerRadius(0), half = atlasMarkerRadius(50), full = atlasMarkerRadius(100)
  assert.ok(zero > 0 && zero < half && half < full)
  assert.ok(Math.abs((half ** 2 - zero ** 2) / (full ** 2 - zero ** 2) - 0.5) < 1e-10)
  assert.equal(atlasMarkerRadius(-5), zero)
  assert.equal(atlasMarkerRadius(105), full)
  assert.equal(atlasMarkerRadius(null), atlasMarkerRadius())
})
