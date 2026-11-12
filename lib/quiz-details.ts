import { z } from 'zod'
import { storedColorSchema } from './colors'
import { readQuizAppearance } from './quiz-presentation'

export const quizDetailsSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().max(2000).optional(),
  emoji: z.string().max(64).nullable().optional(),
  color: storedColorSchema,
  style: z.string().max(10000).refine(value => !!readQuizAppearance(value)).optional(),
})
