import { z } from 'zod'
import { pagePresentationSchema } from './quiz-presentation'
import { storedColorSchema } from './colors'
import { DimensionDisplayScale } from '@prisma/client'
const text = z.string().trim().min(1).max(1000)
const meta = {
  id: z.string().optional(),
  emoji: z.string().nullable().optional(),
  color: storedColorSchema,
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
      z.object({
        dimensionId: z.string(),
        value: z.number().min(0).max(100),
      }),
    )
    .max(30),
})
const questionInput = z.object({
  ...meta,
  text,
  type: z.enum(['MULTIPLE_CHOICE', 'SLIDER', 'SCALE']),
  order: z.number().int(),
  required: z.boolean().default(true),
  dimensionInfluences: z.record(z.string(), z.number().positive().max(100)).default({}),
  answers: z.array(answerInput).max(30),
})
export const pagesInput = z.object({
  pages: z
    .array(
      z.object({
        ...meta,
        title: z.string().nullish(),
        presentation: pagePresentationSchema.optional(),
        description: z.string().nullish(),
        order: z.number().int(),
        hidden: z.boolean().default(false),
        questions: z.array(questionInput).max(50),
      }),
    )
    .max(30),
}).superRefine(({ pages }, context) => {
  const questions = pages.flatMap(page => page.questions)
  const answers = questions.flatMap(question => question.answers)
  const weights = answers.reduce((total, answer) => total + answer.weights.length, 0)
  if (questions.length > 250 || answers.length > 2500 || weights > 30000)
    context.addIssue({ code: 'custom', message: 'A quiz supports up to 250 questions, 2,500 answers, and 30,000 dimension weights.' })
})
