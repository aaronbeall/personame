'use client'

import { useLayoutEffect, useRef, type ReactNode } from 'react'

/** Progressive enhancement: server content stays visible without JS or with reduced motion. */
export function HomeMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const element = root.current
    if (!element || !('IntersectionObserver' in window)) return
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const registered = new WeakSet<HTMLElement>()
    const reveal = (target: HTMLElement, animate = true) => {
      if (target.dataset.revealState !== 'pending') return
      target.dataset.revealState = animate ? 'visible' : 'settled'
      observer.unobserve(target)
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) reveal(entry.target as HTMLElement)
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -24px 0px' },
    )
    const register = () => {
      element
        .querySelectorAll<HTMLElement>('[data-reveal]')
        .forEach((target) => {
          if (registered.has(target)) return
          registered.add(target)
          if (target.dataset.revealState === 'visible' || target.dataset.revealState === 'settled') return
          const box = target.getBoundingClientRect()
          if (preference.matches || box.bottom <= 0) {
            target.dataset.revealState = 'settled'
          } else {
            target.dataset.revealState = 'pending'
            observer.observe(target)
          }
        })
    }
    const reduceMotion = () => {
      if (preference.matches)
        element.querySelectorAll<HTMLElement>('[data-reveal]').forEach((target) => reveal(target, false))
    }
    const revealFocused = (event: FocusEvent) => {
      if (event.target instanceof HTMLElement) {
        let target = event.target.closest<HTMLElement>('[data-reveal]')
        while (target) {
          reveal(target, false)
          target =
            target.parentElement?.closest<HTMLElement>('[data-reveal]') ?? null
        }
      }
    }
    register()
    // Quiz shelves arrive asynchronously after the initial page render.
    const mutations = new MutationObserver(register)
    mutations.observe(element, { childList: true, subtree: true })
    preference.addEventListener('change', reduceMotion)
    element.addEventListener('focusin', revealFocused)
    return () => {
      observer.disconnect()
      mutations.disconnect()
      preference.removeEventListener('change', reduceMotion)
      element.removeEventListener('focusin', revealFocused)
    }
  }, [])
  return (
    <div ref={root} className="home-page min-h-screen">
      {children}
    </div>
  )
}
