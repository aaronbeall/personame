import { z } from 'zod'
import { COLOR_THEME } from './colors'

export const quizDetailsSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().max(2000).optional(),
  emoji: z.string().max(64).nullable().optional(),
  color: z
    .enum(COLOR_THEME.map((c) => c.name))
    .nullable()
    .optional(),
})
