export type PaginationItem = number | 'ellipsis'

/** Always include the first, current and last pages; bound the number of controls. */
export function paginationItems(page: number, pages: number, compact = false): PaginationItem[] {
  if (pages < 1) return []
  const current = Math.max(1, Math.min(page, pages))
  const selected = new Set([1, current, pages])
  if (compact) {
    if (current === 1 && pages > 1) selected.add(2)
    if (current === pages && pages > 1) selected.add(pages - 1)
  } else if (pages <= 7) {
    for (let i = 1; i <= pages; i++) selected.add(i)
  } else {
    const start = current <= 4 ? 2 : current >= pages - 3 ? pages - 4 : current - 1
    const end = current <= 4 ? 5 : current >= pages - 3 ? pages - 1 : current + 1
    for (let i = start; i <= end; i++) selected.add(i)
  }
  const result: PaginationItem[] = []
  let previous = 0
  for (const value of [...selected].sort((a, b) => a - b)) {
    if (previous && value - previous > 1) result.push('ellipsis')
    result.push(value)
    previous = value
  }
  return result
}
