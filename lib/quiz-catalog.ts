import { z } from 'zod'
import { storedColorSchema } from './colors'
import { readiness } from './quiz-validation'
import type { FullQuiz } from './personas'
const label = z.string().trim().min(1)
const weights = z.record(z.string(), z.number().min(-100).max(100))
export const catalogSchema = z.object({
  version: z.literal(1),
  quizzes: z
    .array(
      z.object({
        slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
        title: label.max(200),
        description: label,
        emoji: label,
        color: storedColorSchema,
        dimensions: z
          .array(
            z.object({
              key: label,
              name: label,
              description: label.optional(),
              emoji: label.optional(),
              minEmoji: label.nullable().optional(),
              maxEmoji: label.nullable().optional(),
              displayScale: z
                .enum(['PERCENT_ASCENDING', 'PERCENT_DESCENDING', 'BIPOLAR'])
                .default('PERCENT_ASCENDING'),
              minLabel: label,
              maxLabel: label,
              color: storedColorSchema,
            }),
          )
          .min(1)
          .max(8),
        archetypes: z
          .array(
            z.object({
              name: label,
              description: label,
              emoji: label,
              color: storedColorSchema,
              relevance: z
                .record(z.string(), z.number().min(0).max(1))
                .optional(),
              targets: z.record(z.string(), z.number().min(0).max(100)),
            }),
          )
          .min(2),
        questions: z
          .array(
            z.object({
              type: z.enum(['MULTIPLE_CHOICE', 'SLIDER', 'SCALE']),
              text: label,
              emoji: label.optional(),
              color: storedColorSchema,
              required: z.boolean().default(true),
              answers: z
                .array(
                  z.object({
                    text: label,
                    emoji: label.optional(),
                    color: storedColorSchema,
                    weights,
                  }),
                )
                .min(2),
            }),
          )
          .min(1),
      }),
    )
    .min(1),
})
export type CatalogQuiz = z.infer<typeof catalogSchema>['quizzes'][number]
/** Compile readable dimension keys into the same ordered shape the engine scores. No database access. */
export function compileCatalogQuiz(definition: CatalogQuiz): FullQuiz {
  const keys = definition.dimensions.map((m) => m.key)
  if (new Set(keys).size !== keys.length)
    throw new Error(`${definition.slug}: duplicate dimension key`)
  for (const archetype of definition.archetypes) {
    if (
      Object.keys(archetype.relevance ?? {}).some((key) => !keys.includes(key))
    )
      throw new Error(
        `${definition.slug}: unknown dimension in archetype relevance`,
      )
    if (!keys.some((key) => (archetype.relevance?.[key] ?? 1) > 0))
      throw new Error(
        `${definition.slug}: archetypes need at least one relevant dimension`,
      )
    if (
      keys.some((k) => archetype.targets[k] === undefined) ||
      Object.keys(archetype.targets).some((k) => !keys.includes(k))
    )
      throw new Error(
        `${definition.slug}: every archetype must target exactly the declared dimensions`,
      )
  }
  for (const q of definition.questions) {
    if (q.type === 'SLIDER' && q.answers.length !== 2)
      throw new Error(`${definition.slug}: sliders need exactly two endpoints`)
    for (const a of q.answers)
      if (Object.keys(a.weights).some((k) => !keys.includes(k)))
        throw new Error(
          `${definition.slug}: unknown dimension in answer weights`,
        )
    if (
      q.type === 'SCALE' &&
      q.answers
        .slice(2)
        .some((a) => Object.values(a.weights).some((v) => v !== 0))
    )
      throw new Error(
        `${definition.slug}: scale point weights are ignored; put weights on endpoints`,
      )
  }
  const quiz = {
    ...definition,
    id: definition.slug,
    dimensions: definition.dimensions.map((m, order) => ({
      ...m,
      id: m.key,
      order,
    })),
    archetypes: definition.archetypes.map((a, order) => ({
      ...a,
      id: `archetype-${order}`,
      order,
      color: a.color ?? null,
      dimensions: keys.map((dimensionId) => ({
        dimensionId,
        targetValue: a.targets[dimensionId],
        relevance: a.relevance?.[dimensionId] ?? 1,
      })),
    })),
    pages: [
      {
        id: 'cover',
        title: definition.title,
        description: definition.description,
        style: 'cover',
        hidden: false,
        order: 0,
        questions: [],
      },
      {
        id: 'questions',
        title: 'A few small choices',
        style: null,
        hidden: false,
        order: 1,
        questions: definition.questions.map((q, order) => ({
          ...q,
          id: `question-${order}`,
          order,
          emoji: q.emoji ?? null,
          answers: q.answers.map((a, i) => ({
            ...a,
            id: `answer-${order}-${i}`,
            order: i,
            emoji: a.emoji ?? null,
            weights: Object.entries(a.weights).map(([dimensionId, value]) => ({
              dimensionId,
              value,
            })),
          })),
        })),
      },
    ],
  } as unknown as FullQuiz
  const issues = readiness(quiz)
  if (issues.length) throw new Error(`${definition.slug}: ${issues.join(' ')}`)
  return quiz
}
export function parseCatalog(input: unknown) {
  const catalog = catalogSchema.parse(input)
  const slugs = catalog.quizzes.map((q) => q.slug)
  if (new Set(slugs).size !== slugs.length)
    throw new Error('Duplicate quiz slug')
  catalog.quizzes.forEach(compileCatalogQuiz)
  return catalog
}
