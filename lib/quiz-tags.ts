import { z } from 'zod'

export const maxQuizTags = 12
export const maxQuizTagLength = 32

export function normalizeQuizTag(value: string) {
  return value.normalize('NFKC').trim().replace(/\s+/gu, ' ').toLowerCase()
}

export const quizTagsSchema = z.array(
  z.string().transform(normalizeQuizTag).pipe(z.string().min(1).max(maxQuizTagLength)),
).max(maxQuizTags).transform(tags => [...new Set(tags)])
