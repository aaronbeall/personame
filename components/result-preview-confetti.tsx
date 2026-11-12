'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ArtConfettiBurst } from './art-confetti-burst'
import { Button } from './ui/button'

export function ResultPreviewConfetti() {
  const anchor = useRef<HTMLDivElement>(null)
  const [burst, setBurst] = useState(false)
  const complete = useCallback(() => setBurst(false), [])
  useEffect(() => {
    const frame = requestAnimationFrame(() => setBurst(true))
    return () => cancelAnimationFrame(frame)
  }, [])
  return <div ref={anchor} className="result-preview-confetti">
    <Button type="button" variant="ghost" size="sm" onClick={() => setBurst(true)} disabled={burst}>Replay confetti</Button>
    {burst && <ArtConfettiBurst anchorRef={anchor} onComplete={complete} fullscreen />}
  </div>
}
