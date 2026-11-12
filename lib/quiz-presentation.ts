import { z } from 'zod'
import type { CSSProperties } from 'react'
import { getColorTheme, getColorSurface, getBarGradient } from './colors'
import { artworkSchema } from './quiz-artwork'

export const layoutSchema = z.enum(['hero', 'split', 'card', 'minimal'])
const coverPageStyleSchema = z.object({
  layout: layoutSchema,
  backgroundImage: artworkSchema.nullable(),
})
export type CoverPageStyle = z.infer<typeof coverPageStyleSchema>
export const quizAppearanceSchema = z.object({
  layout: layoutSchema.default('hero'),
  coverImage: artworkSchema.nullable().default(null),
  backgroundImage: artworkSchema.nullable().default(null),
})
export type QuizAppearance = z.infer<typeof quizAppearanceSchema>
export function encodeQuizAppearance(appearance: QuizAppearance) {
  return 'appearance:' + JSON.stringify(appearance)
}

export function readQuizAppearance(style?: string | null): QuizAppearance | null {
  if (!style?.startsWith('appearance:')) return null
  try {
    const parsed = quizAppearanceSchema.safeParse(JSON.parse(style.slice('appearance:'.length)))
    return parsed.success ? parsed.data : null
  } catch { return null }
}

export function quizAppearance(quiz: { style?: string | null }, legacyCover?: unknown): QuizAppearance {
  const cover = pagePresentation(legacyCover)
  return readQuizAppearance(quiz.style) ?? {
    layout: cover.layout,
    coverImage: cover.coverImage === undefined && legacyCover && cover.artwork !== 'none'
      ? { asset: { source: 'curated', id: cover.artwork }, x: 50, y: 50, alt: '' }
      : cover.coverImage ?? null,
    backgroundImage: cover.backgroundImage ?? null,
  }
}

export const pagePresentationSchema = z.object({
  layout: layoutSchema.default('hero'),
  artwork: z.enum(['islands', 'party', 'science', 'creation', 'none']).default('islands'),
  coverImage: artworkSchema.nullable().optional(),
  backgroundImage: artworkSchema.nullable().optional(),
  coverPageStyle: coverPageStyleSchema.optional(),
  showDescription: z.boolean().default(true),
  showQuestionCount: z.boolean().default(true),
  showTimeEstimate: z.boolean().default(true),
  startLabel: z.string().trim().min(1).max(60).default('Let’s find out'),
  showDimensions: z.boolean().default(true),
  showAlternatives: z.boolean().default(true),
  showComparison: z.boolean().default(true),
  showRetake: z.boolean().default(true),
  showShare: z.boolean().default(true),
})
export type PagePresentation = z.infer<typeof pagePresentationSchema>
export function pagePresentation(value?: unknown): PagePresentation {
  const parsed = pagePresentationSchema.safeParse(value ?? {})
  return parsed.success ? parsed.data : pagePresentationSchema.parse({})
}
export function coverPresentation(value: unknown, appearance: QuizAppearance): PagePresentation {
  const settings = pagePresentation(value)
  const pageStyle = settings.coverPageStyle ?? {
    layout: appearance.layout,
    backgroundImage: appearance.backgroundImage,
  }
  return { ...settings, ...pageStyle, coverImage: appearance.coverImage }
}
export function quizThemeStyle(color?: string | null): CSSProperties {
  const value = color || '#8b5cf6', theme = getColorTheme(value), surface = getColorSurface(value)
  return { '--quiz-accent': theme.hex, '--quiz-gradient': getBarGradient(value), '--quiz-on-accent': surface.textColor, '--quiz-tint': `color-mix(in srgb, ${theme.hex} 8%, #fcfbf8)`, '--quiz-line': `color-mix(in srgb, ${theme.hex} 20%, #e8e4ed)` } as CSSProperties
}
