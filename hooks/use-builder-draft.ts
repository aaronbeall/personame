'use client'
import { useEffect, useState } from 'react'
import { useUnsavedChanges } from './use-unsaved-changes'

/** A page-level draft. Refetches never overwrite work; successful saves establish a new baseline. */
export function useBuilderDraft<T>(source: T | undefined, identity: string) {
  const [state, setState] = useState<{
    identity: string
    baseline: T
    value: T
  }>()
  useEffect(() => {
    if (source === undefined) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Hydrate once per editor identity after its data arrives.
    setState((current) =>
      current?.identity === identity
        ? current
        : {
            identity,
            baseline: structuredClone(source),
            value: structuredClone(source),
          },
    )
  }, [source, identity])
  const current = state?.identity === identity ? state : undefined
  const dirty =
    !!current &&
    JSON.stringify(current.value) !== JSON.stringify(current.baseline)
  useUnsavedChanges(dirty)
  return {
    value: current?.value,
    ready: !!current,
    dirty,
    update(value: T) {
      setState((s) => (s?.identity === identity ? { ...s, value } : s))
    },
    accept(value: T) {
      setState({
        identity,
        baseline: structuredClone(value),
        value: structuredClone(value),
      })
    },
    reset() {
      setState((s) =>
        s?.identity === identity
          ? { ...s, value: structuredClone(s.baseline) }
          : s,
      )
    },
  }
}
