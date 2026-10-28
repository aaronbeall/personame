/** Pixels, seconds, and degrees. Rendering is independent of the particle simulation. */
export type ArtParticle = {
  x: number
  y: number
  vx: number
  vy: number
  rotation: number
  spin: number
  flutter: number
  age: number
  life: number
  size: number
  sprite: number
}
export const CONFETTI_STEP = 1 / 120
export const CONFETTI_GRAVITY = 520
export function createArtParticles(
  width: number,
  random = Math.random,
): ArtParticle[] {
  return Array.from({ length: 14 }, (_, i) => {
    const side = i % 2 ? 1 : -1
    const angle = ((-88 + side * (20 + random() * 45)) * Math.PI) / 180
    const speed = 240 + random() * 130
    return {
      x: side * width * 0.34,
      y: -4,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      rotation: random() * 360,
      spin: side * (160 + random() * 420),
      flutter: random() * Math.PI * 2,
      age: -random() * 0.1,
      life: 1.4 + random() * 0.4,
      size: 36 + random() * 14,
      sprite: i % 9,
    }
  })
}
export function advanceArtParticle(particle: ArtParticle, dt: number) {
  particle.age += dt
  if (particle.age < 0 || particle.age >= particle.life) return
  // Exponential air resistance; gravity pulls every shape through a natural arc.
  const drag = Math.exp(-1.15 * dt)
  particle.vx *= drag
  particle.vy = particle.vy * drag + CONFETTI_GRAVITY * dt
  particle.x += particle.vx * dt
  particle.y += particle.vy * dt
  particle.rotation += particle.spin * dt
  particle.spin *= Math.exp(-0.16 * dt)
}
