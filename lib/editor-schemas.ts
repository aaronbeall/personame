import { z } from 'zod'
import { DimensionDisplayScale } from '@prisma/client'
const text = z.string().trim().min(1).max(1000)
const meta = {
  id: z.string().optional(),
  emoji: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  style: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
}
export const dimensionInput = z.object({
  ...meta,
  name: text,
  description: z.string().nullish(),
  displayScale: z.enum(DimensionDisplayScale).optional(),
  minEmoji: z
    .string()
    .trim()
    .max(64)
    .nullable()
    .optional()
    .transform((value) => (value === '' ? null : value)),
  maxEmoji: z
    .string()
    .trim()
    .max(64)
    .nullable()
    .optional()
    .transform((value) => (value === '' ? null : value)),
  minLabel: z.string().nullish(),
  maxLabel: z.string().nullish(),
  order: z.number().int(),
})
export const archetypeInput = z.object({
  ...meta,
  name: text,
  description: z.string().nullish(),
  imageUrl: z.string().nullish(),
  order: z.number().int(),
  dimensions: z
    .array(
      z.object({
        dimensionId: z.string(),
        targetValue: z.number().min(0).max(100),
        relevance: z.number().min(0).max(1).default(1),
      }),
    )
    .max(30),
})
const answerInput = z.object({
  ...meta,
  text,
  order: z.number().int(),
  weights: z
    .array(
      z.object({ dimensionId: z.string(), value: z.number().min(-100).max(100) }),
    )
    .max(30),
})
const questionInput = z.object({
  ...meta,
  text,
  type: z.enum(['MULTIPLE_CHOICE', 'SLIDER', 'SCALE']),
  order: z.number().int(),
  required: z.boolean().default(true),
  answers: z.array(answerInput).max(30),
})
export const pagesInput = z.object({
  pages: z
    .array(
      z.object({
        ...meta,
        title: z.string().nullish(),
        description: z.string().nullish(),
        order: z.number().int(),
        hidden: z.boolean().default(false),
        questions: z.array(questionInput).max(50),
      }),
    )
    .max(30),
})
