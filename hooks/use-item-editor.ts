'use client'

import { useState } from 'react'

/** Item edits are local checkpoints inside the page draft, not individual database saves. */
export function useItemEditor<T extends { id: string }>(
  items: T[],
  onChange: (items: T[]) => void,
) {
  const [checkpoints, setCheckpoints] = useState<Record<string, T | null>>({})
  const close = (id: string) =>
    setCheckpoints((current) => {
      const next = { ...current }
      delete next[id]
      return next
    })
  return {
    editing: Object.keys(checkpoints),
    edit(item: T) {
      setCheckpoints((current) => ({
        ...current,
        [item.id]: structuredClone(item),
      }))
    },
    startNew(id: string) {
      setCheckpoints((current) => ({ ...current, [id]: null }))
    },
    done: close,
    cancel(id: string) {
      if (!Object.hasOwn(checkpoints, id)) return
      const original = checkpoints[id]
      onChange(
        original
          ? items.map((item) =>
              item.id === id ? structuredClone(original) : item,
            )
          : items.filter((item) => item.id !== id),
      )
      close(id)
    },
    closeAll() {
      setCheckpoints({})
    },
  }
}
