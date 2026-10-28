'use client'

import Link from 'next/link'
import { ArtActionIcon } from './art-action-icon'
import type { ReactNode } from 'react'

/** The homepage can opt into its local shelf; other Explore actions open the full discovery page. */
export function ExploreLink({
  children,
  className,
  target = 'page',
}: {
  children: ReactNode
  className?: string
  target?: 'page' | 'section'
}) {
  return (
    <Link
      href={target === 'section' ? '/#explore' : '/explore'}
      className={className}
      onClick={(event) => {
        if (
          target !== 'section' ||
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        )
          return
        const section = document.getElementById('explore')
        if (!section) return // Let Next navigate home when clicked from another page.
        event.preventDefault()
        if (window.location.hash !== '#explore')
          window.history.pushState(window.history.state, '', '#explore')
        section.focus({ preventScroll: true })
        section.scrollIntoView({
          block: 'start',
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)')
            .matches
            ? 'instant'
            : 'smooth',
        })
      }}
    >
      {className === 'home-closing-secondary' && (
        <ArtActionIcon kind="explore" />
      )}
      {children}
    </Link>
  )
}
