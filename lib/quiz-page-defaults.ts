/** Restore missing bookends without replacing authored pages or mutating input. */
export function withQuizBookends<Page extends { style: string | null; order: number }>(
  pages: Page[],
  create: (style: 'cover' | 'results') => Page,
): Page[] {
  const result = [...pages]
  if (!result.some(page => page.style === 'cover')) result.unshift(create('cover'))
  if (!result.some(page => page.style === 'results')) result.push(create('results'))
  return result.map((page, order) => ({ ...page, order }))
}
