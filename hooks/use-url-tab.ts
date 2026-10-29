'use client'

import { useMemo } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { parseAsStringLiteral, useQueryState } from 'nuqs'

/** URL is the sole tab state. nuqs handles shallow navigation, batching and browser history. */
export function useUrlTab<const Values extends readonly string[]>(values: Values, defaultValue: Values[number], key = 'tab') {
  const parser = useMemo(() => parseAsStringLiteral(values).withDefault(defaultValue).withOptions({ history: 'push', shallow: true, scroll: false, clearOnDefault: false }), [values, defaultValue])
  const [tab, setTab] = useQueryState(key, parser)
  const pathname = usePathname()
  const search = useSearchParams()
  const hrefFor = (value: Values[number]) => {
    const params = new URLSearchParams(search.toString())
    params.set(key, value)
    return `${pathname}?${params}`
  }
  return { tab, setTab, hrefFor }
}
