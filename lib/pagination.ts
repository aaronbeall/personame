import { z } from 'zod'
const parameters = z.object({
  page: z.coerce.number().int().min(1).max(10000).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(24),
  search: z.string().trim().max(200).default(''),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
})
export function listParameters(request: Request) {
  const value = parameters.parse(Object.fromEntries(new URL(request.url).searchParams))
  return { ...value, skip: (value.page - 1) * value.limit }
}
export type ListPage<T> = {
  items: T[]; total: number; collectionTotal?: number; page: number; hasMore: boolean
  counts?: { DRAFT: number; PUBLISHED: number }
}
