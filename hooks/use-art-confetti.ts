'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { preloadArtConfetti } from '@/components/art-confetti-burst'

/** A finite, rate-limited burst shared by links and action buttons. */
export function useArtConfetti<Element extends HTMLElement>() {
  const anchor = useRef<Element>(null)
  const [burst, setBurst] = useState(false)
  const lastBurst = useRef(-Infinity)
  const complete = useCallback(() => setBurst(false), [])
  useEffect(() => { preloadArtConfetti() }, [])
  const celebrate = () => {
    if (burst || window.matchMedia('(prefers-reduced-motion: reduce)').matches || performance.now() - lastBurst.current < 1100) return
    lastBurst.current = performance.now()
    setBurst(true)
  }
  return { anchor, burst, complete, celebrate }
}
