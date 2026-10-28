'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { paginationItems } from '@/lib/pagination-items'

export function CollectionPagination({
  page, total, onPage, pageSize = 24, itemLabel = 'items',
  contentId, loading = false,
}: {
  page: number
  total: number
  onPage: (page: number) => void
  pageSize?: number
  itemLabel?: string
  contentId: string
  loading?: boolean
}) {
  const pages = Math.ceil(total / pageSize)
  if (pages <= 1) return null
  const navigate = (next: number) => {
    if (next === page || loading) return
    onPage(next)
    document.getElementById(contentId)?.scrollIntoView({
      block: 'start',
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    })
  }
  const numbers = (compact: boolean) => (
    <ol className={`pagination-numbers pagination-${compact ? 'compact' : 'wide'}`}>
      {paginationItems(page, pages, compact).map((item, index) => (
        <li key={`${item}-${index}`}>
          {item === 'ellipsis' ? (
            <span className="pagination-ellipsis" aria-hidden="true">…</span>
          ) : (
            <button type="button" aria-label={`Page ${item}`}
              aria-current={page === item ? 'page' : undefined}
              aria-controls={contentId} disabled={loading}
              onClick={() => navigate(item)}>{item}</button>
          )}
        </li>
      ))}
    </ol>
  )
  return (
    <nav className="collection-pagination"
      aria-label={`${itemLabel} pagination`}>
      <p className="pagination-summary" aria-live="polite" aria-atomic="true">
        <strong>{((page - 1) * pageSize + 1).toLocaleString()}–{Math.min(page * pageSize, total).toLocaleString()}</strong>
        {' '}of {total.toLocaleString()} {itemLabel}
      </p>
      <div className="pagination-controls">
        <button type="button" className="pagination-direction" aria-label="Previous page"
          aria-controls={contentId} disabled={page <= 1 || loading} onClick={() => navigate(page - 1)}>
          <ChevronLeft size={16} aria-hidden="true" /><span>Previous</span>
        </button>
        {numbers(false)}
        {numbers(true)}
        <button type="button" className="pagination-direction" aria-label="Next page"
          aria-controls={contentId} disabled={page >= pages || loading} onClick={() => navigate(page + 1)}>
          <span>Next</span><ChevronRight size={16} aria-hidden="true" />
        </button>
      </div>
    </nav>
  )
}
