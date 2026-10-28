'use client'

import { useEffect, useState } from 'react'

const message = 'You have unsaved changes. Leave without saving?'
const editors = new Map<symbol, boolean>()
const hasUnsavedChanges = () => [...editors.values()].some(Boolean)
const historyKey = '__personameNavigation'

/** Register an editor's dirty state with the application's navigation guard. */
export function useUnsavedChanges(dirty: boolean) {
  const [key] = useState(() => Symbol('editor'))
  useEffect(() => {
    editors.set(key, dirty)
    return () => {
      editors.delete(key)
    }
  }, [dirty, key])
  return {
    confirmLeave: (navigate: () => void) => confirmLeave(dirty, navigate),
  }
}

/** Use for explicit, non-link navigation. Successful saves can navigate directly. */
export function confirmLeave(dirty: boolean, navigate: () => void) {
  if (!dirty || window.confirm(message)) navigate()
}

/** Install once at the app root, so history positions are tracked before any editor opens. */
export function UnsavedChangesGuard() {
  useEffect(() => {
    const session = `${Date.now()}-${Math.random()}`
    let position = 0
    let restoring = false
    const push = history.pushState
    const replace = history.replaceState
    const stamp = (data: unknown, index: number) => ({
      ...(typeof data === 'object' && data !== null ? data : {}),
      [historyKey]: { session, index },
    })
    replace.call(history, stamp(history.state, position), '')
    const trackedPush: History['pushState'] = (data, unused, url) => {
      push.call(history, stamp(data, position + 1), unused, url)
      position += 1
    }
    const trackedReplace: History['replaceState'] = (data, unused, url) => {
      replace.call(history, stamp(data, position), unused, url)
    }
    history.pushState = trackedPush
    history.replaceState = trackedReplace

    const unload = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges()) return
      event.preventDefault()
      event.returnValue = ''
    }
    const click = (event: MouseEvent) => {
      if (
        !hasUnsavedChanges() ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return
      const link =
        event.target instanceof Element
          ? event.target.closest<HTMLAnchorElement>('a[href]')
          : null
      if (
        !link ||
        link.hasAttribute('download') ||
        (link.target && link.target !== '_self')
      )
        return
      const url = new URL(link.href, location.href)
      // Full document departures use beforeunload; in-page anchors retain the draft.
      if (
        url.origin !== location.origin ||
        (url.pathname === location.pathname && url.search === location.search)
      )
        return
      if (!window.confirm(message)) {
        event.preventDefault()
        event.stopImmediatePropagation()
      }
    }
    const pop = (event: PopStateEvent) => {
      const target = event.state?.[historyKey] as
        { session: string; index: number } | undefined
      if (restoring) {
        restoring = false
        event.stopImmediatePropagation()
        return
      }
      if (!target || target.session !== session) return
      const delta = target.index - position
      if (delta && hasUnsavedChanges() && !window.confirm(message)) {
        // Capture runs before Next's listener: restore history without unmounting the editor.
        event.stopImmediatePropagation()
        restoring = true
        history.go(-delta)
        return
      }
      position = target.index
    }
    window.addEventListener('beforeunload', unload)
    document.addEventListener('click', click, true)
    window.addEventListener('popstate', pop, true)
    return () => {
      window.removeEventListener('beforeunload', unload)
      document.removeEventListener('click', click, true)
      window.removeEventListener('popstate', pop, true)
      if (history.pushState === trackedPush) history.pushState = push
      if (history.replaceState === trackedReplace)
        history.replaceState = replace
    }
  }, [])
  return null
}
