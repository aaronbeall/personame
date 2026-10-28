'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { ArtActionIcon } from './art-action-icon'
import { ArtConfettiBurst, preloadArtConfetti } from './art-confetti-burst'

/** Shared Create action; a finite decorative burst never intercepts clicks. */
export function CreateQuizLink({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  const anchor = useRef<HTMLAnchorElement>(null)
  const [burst, setBurst] = useState(false)
  const lastBurst = useRef(-Infinity)
  const complete = useCallback(() => setBurst(false), [])
  useEffect(() => {
    preloadArtConfetti()
  }, [])
  const celebrate = () => {
    if (
      burst ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      performance.now() - lastBurst.current < 1100
    )
      return
    lastBurst.current = performance.now()
    setBurst(true)
  }
  return (
    <Link
      ref={anchor}
      href="/create"
      className={`art-create-link ${className}`}
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') celebrate()
      }}
      onFocus={(event) => {
        if (event.currentTarget.matches(':focus-visible')) celebrate()
      }}
    >
      <ArtActionIcon kind="create" />
      <span className="art-create-label">{children}</span>
      {burst && (
        <ArtConfettiBurst anchorRef={anchor} onComplete={complete} />
      )}
    </Link>
  )
}
