'use client'

import type { ReactNode } from 'react'

/** Controlled presentation only: callers provide URL-backed value and navigation. */
export function UrlTabs<Value extends string>({ id, label, items, value, onValueChange }: {
  id: string; label: string; items: readonly { value: Value; label: string; icon?: ReactNode }[]; value: Value; onValueChange: (value: Value) => void
}) {
  return <div className="review-view-tabs" role="tablist" aria-label={label}>{items.map((item, index) => <button type="button" key={item.value} role="tab" id={`${id}-tab-${item.value}`} aria-controls={`${id}-panel-${item.value}`} aria-selected={value === item.value} tabIndex={value === item.value ? 0 : -1} onClick={() => onValueChange(item.value)} onKeyDown={event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + items.length) % items.length
    onValueChange(items[next].value)
    document.getElementById(`${id}-tab-${items[next].value}`)?.focus()
  }}>{item.icon}{item.label}</button>)}</div>
}
