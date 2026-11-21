import { z } from 'zod'
import { storedColorSchema } from './colors'
import { readiness } from './quiz-validation'
import type { FullQuiz } from './personas'
import { curatedArtwork, curatedBackgrounds, encodeArtwork, type Artwork } from './quiz-artwork'
import { bookletSchema, encodeQuizAppearance, layoutSchema } from './quiz-presentation'
const label = z.string().trim().min(1)
const weights = z.record(z.string(), z.number().min(0).max(100))
const artworkId = z.enum(curatedBackgrounds as [keyof typeof curatedArtwork, ...(keyof typeof curatedArtwork)[]])

function artwork(id?: keyof typeof curatedArtwork): Artwork | null {
  return id ? { asset: { source: 'curated', id }, x: 50, y: 50, alt: curatedArtwork[id] } : null
}
export const catalogSchema = z.object({
  version: z.literal(2),
  quizzes: z
    .array(
      z.object({
        slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
        publication: z
          .enum(['PUBLIC', 'PRIVATE_DRAFT'])
          .default('PRIVATE_DRAFT'),
        title: label.max(200),
        description: label,
        emoji: label,
        color: storedColorSchema,
        cover: z.object({
          booklet: bookletSchema.optional(),
          image: artworkId,
          layout: layoutSchema.default('hero'),
          background: artworkId.optional(),
        }).optional(),
        questionPages: z.array(z.object({
          title: label,
          description: label.optional(),
          count: z.number().int().positive(),
          layout: layoutSchema.default('hero'),
          emoji: label.optional(),
          color: storedColorSchema,
          background: artworkId.optional(),
        })).min(1).max(28).optional(),
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
              background: artworkId.optional(),
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
              background: artworkId.optional(),
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
              background: artworkId.optional(),
              required: z.boolean().default(true),
              dimensionInfluences: z.record(z.string(), z.number().positive().max(100)).default({}),
              answers: z
                .array(
                  z.object({
                    text: label,
                    emoji: label.optional(),
                    color: storedColorSchema,
                    background: artworkId.optional(),
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
    if (Object.keys(q.dimensionInfluences).some(key => !keys.includes(key))) throw new Error(`${definition.slug}: unknown dimension in question influence`)
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
  const sections = definition.questionPages ?? [{
    title: 'A few small choices',
    count: definition.questions.length,
  }]
  if (sections.reduce((total, section) => total + section.count, 0) !== definition.questions.length)
    throw new Error(`${definition.slug}: question page counts must cover every question exactly once`)
  let offset = 0
  const questionPages = sections.map((section, index) => {
    const start = offset
    offset += section.count
    return {
      id: `questions-${index}`,
      title: section.title,
      description: 'description' in section ? section.description ?? null : null,
      emoji: 'emoji' in section ? section.emoji ?? null : null,
      color: 'color' in section ? section.color ?? null : null,
      style: null,
      hidden: false,
      order: index + 1,
      presentation: {
        layout: 'layout' in section ? section.layout : 'hero',
        backgroundImage: 'background' in section ? artwork(section.background) : null,
      },
      questions: definition.questions.slice(start, offset).map((q, order) => ({
        ...q,
        id: `question-${start + order}`,
        order,
        emoji: q.emoji ?? null,
        style: encodeArtwork(artwork(q.background)),
        answers: q.answers.map((a, i) => ({
          ...a,
          id: `answer-${start + order}-${i}`,
          order: i,
          emoji: a.emoji ?? null,
          style: encodeArtwork(artwork(a.background)),
          weights: Object.entries(a.weights).map(([dimensionId, value]) => ({ dimensionId, value })),
        })),
      })),
    }
  })
  const quiz = {
    ...definition,
    id: definition.slug,
    tags: [],
    style: definition.cover ? encodeQuizAppearance({
      layout: 'hero', backgroundImage: null, coverImage: artwork(definition.cover.image), booklet: definition.cover.booklet,
    }) : null,
    dimensions: definition.dimensions.map((m, order) => ({
      ...m,
      id: m.key,
      order,
      style: encodeArtwork(artwork(m.background)),
    })),
    archetypes: definition.archetypes.map((a, order) => ({
      ...a,
      id: `archetype-${order}`,
      order,
      color: a.color ?? null,
      imageUrl: encodeArtwork(artwork(a.background)),
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
        presentation: definition.cover ? {
          coverPageStyle: {
            layout: definition.cover.layout,
            backgroundImage: artwork(definition.cover.background),
          },
        } : {},
        questions: [],
      },
      ...questionPages,
      {
        id: 'results',
        title: 'Your Results',
        description: 'Discover your personality type',
        style: 'results',
        hidden: false,
        order: questionPages.length + 1,
        presentation: {},
        questions: [],
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
