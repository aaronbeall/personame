/** Bounded answer positions are averaged per dimension using question influence. */
export interface DimensionScore {
  dimensionId: string
  dimensionName: string
  score: number
  evidenceCount?: number
  evidenceWeight?: number
}
export interface ArchetypeMatch {
  archetypeId: string
  archetypeName: string
  matchScore: number
  distance: number
  evidenceCoverage: number
}
export type Contribution = { influence?: number; weights: { dimensionId: string; value: number; influence?: number }[] }
export function calculateDimensionScores(answers: Contribution[], dimensions: { id: string; name: string }[]): DimensionScore[] {
  return dimensions.map(dimension => {
    let total = 0, evidenceWeight = 0, evidenceCount = 0
    for (const answer of answers) {
      const position = answer.weights.find(w => w.dimensionId === dimension.id)
      const influence = position?.influence ?? answer.influence ?? 1
      if (!position || !Number.isFinite(position.value) || !Number.isFinite(influence) || influence <= 0) continue
      total += Math.max(0, Math.min(100, position.value)) * influence
      evidenceWeight += influence
      evidenceCount++
    }
    // 50 is a storage/display fallback only; zero evidence is excluded from matching.
    return { dimensionId: dimension.id, dimensionName: dimension.name, score: evidenceWeight ? total / evidenceWeight : 50, evidenceCount, evidenceWeight }
  })
}
type Archetype = { id: string; name: string; dimensions: { dimensionId: string; targetValue: number; relevance: number }[] }
export function rankArchetypes(dimensionScores: DimensionScore[], archetypes: Archetype[]): ArchetypeMatch[] {
  return archetypes.flatMap(archetype => {
    let squared = 0, observed = 0, totalWeight = 0
    for (const target of archetype.dimensions) {
      if (target.relevance <= 0) continue
      totalWeight += target.relevance
      const score = dimensionScores.find(s => s.dimensionId === target.dimensionId && s.evidenceCount !== 0)
      if (!score) continue
      squared += (score.score - target.targetValue) ** 2 * target.relevance
      observed += target.relevance
    }
    if (!observed) return []
    const distance = Math.sqrt(squared / observed)
    return [{ archetypeId: archetype.id, archetypeName: archetype.name, matchScore: Math.max(0, 100 - distance), distance, evidenceCoverage: observed / totalWeight }]
  }).sort((a, b) => a.distance - b.distance || a.archetypeId.localeCompare(b.archetypeId))
}
export function findBestArchetype(scores: DimensionScore[], archetypes: Archetype[]): ArchetypeMatch | null {
  return rankArchetypes(scores, archetypes)[0] ?? null
}

/**
 * Calculate percentile rank for a dimension score
 */
export function calculatePercentile(
  score: number,
  allScores: number[]
): number {
  if (allScores.length === 0) return 50

  const sorted = [...allScores].sort((a, b) => a - b)
  const index = sorted.findIndex((s) => s >= score)

  if (index === -1) return 100
  if (index === 0) return 0

  return Math.round((index / sorted.length) * 100)
}
