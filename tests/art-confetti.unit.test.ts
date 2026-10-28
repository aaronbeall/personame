import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  createArtParticles,
  advanceArtParticle,
  CONFETTI_STEP,
} from '../lib/art-confetti'

test('confetti launches upward, rotates, slows horizontally, and falls under gravity', () => {
  const p = createArtParticles(180, () => 0.5)[0]
  p.age = 0
  const start = { ...p }
  for (let i = 0; i < 24; i++) advanceArtParticle(p, CONFETTI_STEP)
  assert.ok(p.y < start.y)
  assert.notEqual(p.rotation, start.rotation)
  assert.ok(Math.abs(p.vx) < Math.abs(start.vx))
  for (let i = 0; i < 110; i++) advanceArtParticle(p, CONFETTI_STEP)
  assert.ok(p.vy > 0, 'gravity turns ascent into descent')
  assert.ok(p.y > start.y, 'pieces fall below the emitter')
})
test('particles have bounded varied lifetimes, correct sprite indices, and wait for emission', () => {
  const particles = createArtParticles(180, () => 0.5)
  assert.equal(particles.length, 14)
  assert.ok(
    particles.every((p) => p.sprite >= 0 && p.sprite < 9 && p.life <= 1.8),
  )
  const p = particles[0]
  const x = p.x
  advanceArtParticle(p, 0.01)
  assert.equal(p.x, x)
  p.age = p.life
  advanceArtParticle(p, 0.01)
  assert.equal(p.x, x, 'expired particles stop simulating')
})
