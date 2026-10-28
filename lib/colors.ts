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

export const COLOR_THEMES = [
  { label: 'Aurora', colors: ['#2563eb', '#7c3aed'] },
  { label: 'Wildflower', colors: ['#7c3aed', '#db2777'] },
  { label: 'Ember', colors: ['#c2410c', '#f59e0b'] },
  { label: 'Lagoon', colors: ['#0f766e', '#38bdf8'] },
  { label: 'Moonstone', colors: ['#475569', '#a5b4fc'] },
  { label: 'Rosewater', colors: ['#be185d', '#fb7185'] },
  { label: 'Orchard', colors: ['#166534', '#84cc16'] },
  { label: 'Desert Bloom', colors: ['#c2410c', '#a855f7'] },
  { label: 'Midnight Swim', colors: ['#172554', '#0e7490'] },
  { label: 'Peach Fizz', colors: ['#fb923c', '#fb7185'] },
  { label: 'Supernova', colors: ['#4f46e5', '#ec4899'] },
  { label: 'Mint Condition', colors: ['#0d9488', '#a3e635'] },
] as const

export const hexColorSchema = z
  .string()
  .trim()
  .regex(
    /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/,
    'Use a hex color such as #3b82f6.',
  )
  .transform(normalizeHex)

const colorListSchema = z.string().transform((value, context) => {
  const colors = value
    .split(',')
    .map((color) => hexColorSchema.safeParse(color))
  if (colors.some((color) => !color.success)) {
    context.addIssue({
      code: 'custom',
      message: 'Use comma-separated hex colors.',
    })
    return z.NEVER
  }
  return colors.map((color) => color.data!).join(',')
})

/** Rendering and storage support lists; authored multi-color choices are curated for now. */
export const colorValueSchema = colorListSchema.refine(
  (value) =>
    !value.includes(',') ||
    COLOR_THEMES.some((theme) => theme.colors.join(',') === value),
  'Choose one of the available color themes.',
)
export const storedColorSchema = z.preprocess(
  (value) => (value === '' ? null : value),
  colorValueSchema.nullable().optional(),
)

export function getColorName(value: string): string {
  const normalized = colorListSchema.parse(value)
  const theme = COLOR_THEMES.find(
    (theme) => theme.colors.join(',') === normalized,
  )
  if (theme) return theme.label
  return normalized
    .split(',')
    .map(
      (hex) =>
        COLOR_THEME.find((color) => color.hex === hex)?.label ??
        hex.toUpperCase(),
    )
    .join('/')
}

function describeColor(value: string) {
  const normalized = colorListSchema.parse(value)
  const colors = normalized.split(',')
  return {
    value: normalized,
    hex: colors[0],
    colors,
    label: getColorName(normalized),
  }
}

export function getColorTheme(color?: string | null, index = 0) {
  const parsed = color && colorListSchema.safeParse(color)
  return parsed && parsed.success
    ? describeColor(parsed.data)
    : getColorThemeByIndex(index)
}

export function getColorThemeByIndex(index: number) {
  return describeColor(
    COLOR_THEME[
      ((index % COLOR_THEME.length) + COLOR_THEME.length) % COLOR_THEME.length
    ].hex,
  )
}

export function getUnusedColorTheme(usedColors: (string | null | undefined)[]) {
  const used = new Set(
    usedColors.filter(Boolean).map((color) => getColorTheme(color).value),
  )
  return describeColor(
    (COLOR_THEME.find((color) => !used.has(color.hex)) ?? COLOR_THEME[0]).hex,
  )
}

/** Perceptual contrast accounts for polarity and intermediate gradient colors. */
export function getContrastText(background: string | string[]) {
  const colors = Array.isArray(background) ? background : [background]
  const samples = [
    ...colors,
    ...colors.slice(1).map((color, index) => mixHex(colors[index], color, 0.5)),
  ]
  const minimum = (ink: string) =>
    Math.min(...samples.map((color) => Math.abs(contrastAPCA(color, ink))))
  return minimum('#000000') >= minimum('#ffffff') ? '#000000' : '#ffffff'
}

export function getBarGradient(value?: string | null) {
  const { colors } = getColorTheme(value)
  return colors.length === 1
    ? colors[0]
    : `linear-gradient(90deg, ${colors.join(', ')})`
}

/** Shading is presentation-only; the authored list remains unchanged. */
export function getColorSurface(value: string) {
  const { colors } = getColorTheme(value)
  const highlight = mixHex(colors[0], '#ffffff', 0.035)
  const shade = mixHex(colors[colors.length - 1], '#000000', 0.12)
  const stops = [highlight, ...colors, shade]
  return {
    background: `linear-gradient(135deg, ${stops.join(', ')})`,
    textColor: getContrastText(stops),
    stops,
  }
}

export function getBadgeAppearance(value: string) {
  const { colors } = getColorTheme(value)
  const primary = colors[0],
    accent = colors[colors.length - 1]
  const themed = colors.length > 1
  const shade = mixHex(primary, '#24204c', 0.27)
  const texture = themed
    ? mixHex(primary, accent, 0.45)
    : mixHex(primary, '#ffffff', 0.21)
  const backgrounds = [primary, shade, texture, mixHex(shade, '#ffffff', 0.21)]
  // Accent lettering is only used when it remains readable on the badge fill.
  const textColor =
    themed &&
    backgrounds.every((color) => Math.abs(contrastAPCA(color, accent)) >= 60)
      ? accent
      : getContrastText(backgrounds)
  return {
    themed,
    primary,
    accent,
    shade,
    texture,
    border: themed ? mixHex(accent, '#ffffff', 0.22) : '#ffffff',
    ring: themed ? accent : mixHex(primary, '#ffffff', 0.65),
    innerRing: mixHex(accent, '#ffffff', 0.3),
    textColor,
  }
}

export function getBadgeTextColor(value: string) {
  return getBadgeAppearance(value).textColor
}

export function getScalePreview(
  value: string,
  direction: 'ascending' | 'descending' | 'bipolar',
) {
  const { colors } = getColorTheme(value)
  const first = colors[0],
    last = colors[colors.length - 1]
  if (direction === 'bipolar')
    return `linear-gradient(90deg, ${first}, ${mixHex(mixHex(first, last, 0.5), '#ffffff', 0.9)} 50%, ${last})`
  if (colors.length > 1)
    return `linear-gradient(90deg, ${(direction === 'descending' ? [...colors].reverse() : colors).join(', ')})`
  const pale = mixHex(first, '#ffffff', 0.85)
  return `linear-gradient(90deg, ${direction === 'descending' ? `${first}, ${pale}` : `${pale}, ${first}`})`
}
