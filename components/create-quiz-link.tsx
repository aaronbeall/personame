'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { useArtConfetti } from '@/hooks/use-art-confetti'
import { ArtActionIcon } from './art-action-icon'
import { ArtConfettiBurst } from './art-confetti-burst'

/** Shared Create action; a finite decorative burst never intercepts clicks. */
export function CreateQuizLink({
  children,
  className = '',
  'aria-current': ariaCurrent,
}: {
  children: ReactNode
  className?: string
  'aria-current'?: 'page'
}) {
  const { anchor, burst, complete, celebrate } = useArtConfetti<HTMLAnchorElement>()
  return (
    <Link
      ref={anchor}
      href="/create"
      aria-current={ariaCurrent}
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
