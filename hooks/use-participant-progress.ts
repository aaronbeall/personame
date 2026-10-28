'use client'
import { useMemo, useSyncExternalStore } from 'react'
import {
  progressEvent,
  progressKey,
  readProgress,
} from '@/lib/participant-progress'
function subscribe(callback: () => void) {
  window.addEventListener(progressEvent, callback)
  window.addEventListener('storage', callback)
  window.addEventListener('pageshow', callback)
  return () => {
    window.removeEventListener(progressEvent, callback)
    window.removeEventListener('storage', callback)
    window.removeEventListener('pageshow', callback)
  }
}
export function useParticipantProgress(owner?: string | null) {
  const raw = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return owner ? sessionStorage.getItem(progressKey(owner)) : null
      } catch {
        return null
      }
    },
    () => null,
  )
  return useMemo(() => readProgress(raw), [raw])
}
