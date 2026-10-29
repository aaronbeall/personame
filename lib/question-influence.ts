/** A question's relative influence is independent for every mapped dimension. */
export function questionInfluences(question: { dimensionInfluences?: unknown }): Record<string, number> {
  const value = question.dimensionInfluences
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, number> : {}
}
export function questionInfluence(question: { dimensionInfluences?: unknown }, dimensionId: string): number {
  const value = questionInfluences(question)[dimensionId]
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 1
}
