'use client'

import { useEffect, useRef, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import {
  advanceArtParticle,
  createArtParticles,
  CONFETTI_STEP,
} from '@/lib/art-confetti'

let sprite: HTMLImageElement | null = null
export function preloadArtConfetti() {
  if (!sprite) {
    sprite = new window.Image()
    sprite.src = '/images/cta/confetti-sprite.png'
  }
  return sprite
}

export function ArtConfettiBurst({
  anchorRef,
  onComplete,
}: {
  anchorRef: RefObject<HTMLAnchorElement | null>
  onComplete: () => void
}) {
  const canvas = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const anchor = anchorRef.current
    const node = canvas.current
    const context = node?.getContext('2d')
    if (!node || !context || !anchor) {
      onComplete()
      return
    }
    const image = preloadArtConfetti()
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    let disposed = false
    const finish = () => {
      cancelAnimationFrame(frame)
      if (!disposed) {
        disposed = true
        onComplete()
      }
    }
    const begin = () => {
      if (disposed) return
      if (preference.matches) {
        finish()
        return
      }
      const rect = anchor.getBoundingClientRect()
      node.style.width = `${rect.width + 420}px`
      node.style.left = `${rect.left - 210}px`
      node.style.top = `${rect.top + rect.height / 2 - 130}px`
      const width = node.clientWidth
      const height = node.clientHeight
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      node.width = Math.round(width * ratio)
      node.height = Math.round(height * ratio)
      context.scale(ratio, ratio)
      const particles = createArtParticles(rect.width)
      const cellWidth = image.naturalWidth / 3
      const cellHeight = image.naturalHeight / 3
      const start = performance.now()
      let previous = start
      let accumulator = 0
      const animate = (now: number) => {
        if (disposed) return
        if (now - start > 2300 || preference.matches) {
          finish()
          return
        }
        accumulator += Math.min((now - previous) / 1000, 0.05)
        previous = now
        while (accumulator >= CONFETTI_STEP) {
          particles.forEach((particle) =>
            advanceArtParticle(particle, CONFETTI_STEP),
          )
          accumulator -= CONFETTI_STEP
        }
        context.clearRect(0, 0, width, height)
        for (const p of particles) {
          if (p.age < 0 || p.age >= p.life) continue
          context.save()
          context.globalAlpha = Math.max(
            0,
            Math.min(1, p.age / 0.045, (p.life - p.age) / 0.35),
          )
          context.translate(width / 2 + p.x, 130 + p.y)
          context.rotate((p.rotation * Math.PI) / 180)
          // A slight changing face angle gives the drawn pieces a tumbling flutter.
          context.scale(
            0.5 + 0.5 * Math.abs(Math.cos(p.flutter + p.age * 5)),
            1,
          )
          context.drawImage(
            image,
            (p.sprite % 3) * cellWidth,
            Math.floor(p.sprite / 3) * cellHeight,
            cellWidth,
            cellHeight,
            -p.size / 2,
            -p.size / 2,
            p.size,
            p.size,
          )
          context.restore()
        }
        if (particles.every((p) => p.age >= p.life)) finish()
        else frame = requestAnimationFrame(animate)
      }
      frame = requestAnimationFrame(animate)
    }
    const reduceMotion = () => {
      if (preference.matches) finish()
    }
    preference.addEventListener('change', reduceMotion)
    if (image.complete && image.naturalWidth) begin()
    else {
      image.addEventListener('load', begin, { once: true })
      image.addEventListener('error', finish, { once: true })
    }
    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      image.removeEventListener('load', begin)
      image.removeEventListener('error', finish)
      preference.removeEventListener('change', reduceMotion)
    }
  }, [anchorRef, onComplete])
  return createPortal(
    <canvas ref={canvas} className="art-confetti" aria-hidden="true" />,
    document.body,
  )
}
