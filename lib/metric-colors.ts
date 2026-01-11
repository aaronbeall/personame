/**
 * Color palette for metric badges and UI elements
 * Uses Tailwind's default color palette for a vibrant, diverse spectrum
 */
export const METRIC_COLORS = [
  'bg-gradient-to-br from-blue-500 to-blue-600',
  'bg-gradient-to-br from-purple-500 to-purple-600',
  'bg-gradient-to-br from-pink-500 to-pink-600',
  'bg-gradient-to-br from-rose-500 to-rose-600',
  'bg-gradient-to-br from-orange-500 to-orange-600',
  'bg-gradient-to-br from-amber-500 to-amber-600',
  'bg-gradient-to-br from-green-500 to-green-600',
  'bg-gradient-to-br from-teal-500 to-teal-600',
  'bg-gradient-to-br from-cyan-500 to-cyan-600',
  'bg-gradient-to-br from-indigo-500 to-indigo-600',
  'bg-gradient-to-br from-violet-500 to-violet-600',
  'bg-gradient-to-br from-fuchsia-500 to-fuchsia-600',
] as const

/**
 * Get a color for a metric by index
 * @param index - The metric index (0-based)
 * @returns A Tailwind gradient class string
 */
export function getMetricColor(index: number): string {
  return METRIC_COLORS[index % METRIC_COLORS.length]
}
