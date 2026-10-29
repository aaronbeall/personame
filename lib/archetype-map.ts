/** Coordinates are authored targets, not inferred clusters or weighted match boundaries. */
export function projectTarget(values: number[]) {
  const [x = 50, y = 50] = values
  return { x: 90 + x * 4.2, y: values.length === 1 ? 210 : 345 - y * 2.7, depth: 0 }
}
/** Unordered subsets: permutations of the same dimensions never create extra views. */
export function combinationCount(count: number, size: number): number {
  if (size < 0 || size > count) return 0
  let result = 1
  for (let i = 1; i <= Math.min(size, count - size); i++) result = result * (count - i + 1) / i
  return Math.round(result)
}

/** Read one combination without allocating every subset (important for large models). */
export function combinationAt<T>(items: T[], size: number, index: number): T[] {
  if (!Number.isInteger(index) || index < 0 || index >= combinationCount(items.length, size)) return []
  const result: T[] = []
  let start = 0
  for (let remaining = size; remaining > 0; remaining--) {
    for (let i = start; i <= items.length - remaining; i++) {
      const block = combinationCount(items.length - i - 1, remaining - 1)
      if (index >= block) index -= block
      else { result.push(items[i]); start = i + 1; break }
    }
  }
  return result
}

/** Highest target variance gets the first axis; authored order breaks ties. Missing targets are excluded. */
export function rankDimensions<T extends { id: string }>(dimensions: T[], archetypes: { dimensions: { dimensionId: string; targetValue: number }[] }[]): T[] {
  const spread = (id: string) => {
    const values = archetypes.flatMap(a => a.dimensions.filter(t => t.dimensionId === id).map(t => t.targetValue))
    if (!values.length) return 0
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length
    return values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length
  }
  return dimensions.map((dimension, index) => ({ dimension, index, variance: spread(dimension.id) }))
    .sort((a, b) => b.variance - a.variance || a.index - b.index).map(item => item.dimension)
}

/** Circle area grows linearly with value, with a visible baseline for zero. */
export function atlasMarkerRadius(value?: number | null) {
  if (value == null || !Number.isFinite(value)) return 0.085
  const minimum = 0.055, maximum = 0.17
  return Math.sqrt(minimum ** 2 + (maximum ** 2 - minimum ** 2) * Math.max(0, Math.min(100, value)) / 100)
}
