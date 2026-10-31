import { z } from 'zod'
import type { CSSProperties } from 'react'
import { getColorTheme, getColorSurface, getBarGradient } from './colors'

export const pagePresentationSchema = z.object({
  layout: z.enum(['hero', 'split', 'card', 'minimal']).default('hero'),
  artwork: z.enum(['islands', 'party', 'science', 'creation', 'none']).default('islands'),
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
export function quizThemeStyle(color?: string | null): CSSProperties {
  const value = color || '#8b5cf6', theme = getColorTheme(value), surface = getColorSurface(value)
  return { '--quiz-accent': theme.hex, '--quiz-gradient': getBarGradient(value), '--quiz-on-accent': surface.textColor, '--quiz-tint': `color-mix(in srgb, ${theme.hex} 8%, #fcfbf8)`, '--quiz-line': `color-mix(in srgb, ${theme.hex} 20%, #e8e4ed)` } as CSSProperties
}
