import {
  ColorSpace,
  sRGB,
  contrastAPCA,
  parse,
  serialize,
  mix,
} from 'colorjs.io/fn'
import { z } from 'zod'

ColorSpace.register(sRGB)

function normalizeHex(value: string) {
  return serialize(parse(value), {
    format: 'hex',
    collapse: false,
  }).toLowerCase()
}

function mixHex(color: string, other: string, amount: number) {
  return serialize(mix(color, other, amount, { space: 'srgb' }), {
    format: 'hex',
    collapse: false,
  })
}

/** Names belong to the UI; persisted colors are opaque, lowercase #rrggbb. */
export const COLOR_THEME = [
  { label: 'Blue', hex: '#3b82f6' },
  { label: 'Purple', hex: '#8b5cf6' },
  { label: 'Pink', hex: '#ec4899' },
  { label: 'Rose', hex: '#f43f5e' },
  { label: 'Orange', hex: '#f97316' },
  { label: 'Amber', hex: '#f59e42' },
  { label: 'Green', hex: '#22c55e' },
  { label: 'Teal', hex: '#14b8a6' },
  { label: 'Cyan', hex: '#06b6d4' },
  { label: 'Indigo', hex: '#6366f1' },
  { label: 'Violet', hex: '#a21caf' },
  { label: 'Fuchsia', hex: '#d946ef' },
] as const

export const hexColorSchema = z
  .string()
  .trim()
  .regex(
    /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/,
    'Use a hex color such as #3b82f6.',
  )
  .transform((value) => normalizeHex(value))
export const storedColorSchema = z.preprocess(
  (value) => (value === '' ? null : value),
  hexColorSchema.nullable().optional(),
)

export function getColorName(hex: string) {
  const normalized = normalizeHex(hex)
  return (
    COLOR_THEME.find((color) => color.hex === normalized)?.label ??
    normalized.toUpperCase()
  )
}

export function getColorTheme(color?: string | null, index = 0) {
  if (color && hexColorSchema.safeParse(color).success) {
    const hex = normalizeHex(color)
    return { hex, label: getColorName(hex) }
  }
  return getColorThemeByIndex(index)
}

export function getColorThemeByIndex(index: number) {
  return COLOR_THEME[
    ((index % COLOR_THEME.length) + COLOR_THEME.length) % COLOR_THEME.length
  ]
}

export function getUnusedColorTheme(usedColors: (string | null | undefined)[]) {
  const used = new Set(
    usedColors.filter(Boolean).map((color) => normalizeHex(color!)),
  )
  return COLOR_THEME.find((color) => !used.has(color.hex)) ?? COLOR_THEME[0]
}

/** Perceptual contrast includes foreground/background polarity, especially on saturated hues. */
export function getContrastText(background: string | string[]) {
  const colors = Array.isArray(background) ? background : [background]
  const minimum = (ink: string) =>
    Math.min(...colors.map((color) => Math.abs(contrastAPCA(color, ink))))
  return minimum('#000000') >= minimum('#ffffff') ? '#000000' : '#ffffff'
}

/** Subtle shading for surfaces that would otherwise be flat; never changes stored color. */
export function getColorSurface(color: string) {
  const hex = normalizeHex(color)
  const highlight = mixHex(hex, '#ffffff', 0.035)
  const shade = mixHex(hex, '#000000', 0.12)
  const stops = [highlight, hex, shade]
  return {
    background: `linear-gradient(135deg, ${highlight}, ${hex} 45%, ${shade})`,
    textColor: getContrastText(stops),
    stops,
  }
}

export function getBadgeTextColor(background: string) {
  const shade = mixHex(background, '#24204c', 0.27)
  return getContrastText([
    background,
    shade,
    mixHex(background, '#ffffff', 0.21),
    mixHex(shade, '#ffffff', 0.21),
  ])
}
