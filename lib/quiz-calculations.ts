// Scores start neutral; answer contributions are additive and clamp once at the end.

export interface DimensionScore {
  dimensionId: string
  dimensionName: string
  score: number
}

export interface ArchetypeMatch {
  archetypeId: string
  archetypeName: string
  matchScore: number
  distance: number
}

/**
 * Calculate dimension scores from user answers
 */
export function calculateDimensionScores(
  answers: Array<{ weights: Array<{ dimensionId: string; value: number }> }>,
  dimensions: Array<{ id: string; name: string }>
): DimensionScore[] {
  const scores: Record<string, number> = {}

  // Initialize all dimensions to 50 (neutral)
  dimensions.forEach((dimension) => {
    scores[dimension.id] = 50
  })

  // Add weights from answers
  answers.forEach((answer) => {
    answer.weights.forEach((weight) => {
      scores[weight.dimensionId] = (scores[weight.dimensionId] ?? 50) + weight.value
    })
  })

  // Normalize to 0-100 range
  return dimensions.map((dimension) => ({
    dimensionId: dimension.id,
    dimensionName: dimension.name,
    score: Math.max(0, Math.min(100, scores[dimension.id]))
  }))
}

/**
 * Find the best matching archetype based on dimension scores
 */
export function findBestArchetype(
  dimensionScores: DimensionScore[],
  archetypes: Array<{
    id: string
    name: string
    dimensions: Array<{ dimensionId: string; targetValue: number; relevance: number }>
  }>
): ArchetypeMatch | null {
  if (archetypes.length === 0) return null

  const matches = archetypes.map((archetype) => {
    // Calculate weighted Euclidean distance
    let distance = 0
    let totalWeight = 0

    archetype.dimensions.forEach((archetypeDimension) => {
      const userScore = dimensionScores.find(
        (s) => s.dimensionId === archetypeDimension.dimensionId
      )
      if (userScore) {
        const diff = userScore.score - archetypeDimension.targetValue
        distance += Math.pow(diff, 2) * archetypeDimension.relevance
        totalWeight += archetypeDimension.relevance
      }
    })

    distance = Math.sqrt(distance / (totalWeight || 1))

    // Convert distance to match score (0-100, where 100 is perfect match)
    const matchScore = Math.max(0, 100 - distance)

    return {
      archetypeId: archetype.id,
      archetypeName: archetype.name,
      matchScore,
      distance
    }
  })

  // Return the best match
  return matches.reduce((best, current) =>
    current.matchScore > best.matchScore ? current : best
  )
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
