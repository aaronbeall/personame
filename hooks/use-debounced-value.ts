'use client'
import { useEffect, useState } from 'react'
export function useDebouncedValue(value: string, wait = 250) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => { const timer = setTimeout(() => setDebounced(value), wait); return () => clearTimeout(timer) }, [value, wait])
  return debounced
}
