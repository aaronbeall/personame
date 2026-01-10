// Example quiz calculation utilities

export interface MetricScore {
  metricId: string
  metricName: string
  score: number
}

export interface ArchetypeMatch {
  archetypeId: string
  archetypeName: string
  matchScore: number
  distance: number
}

/**
 * Calculate metric scores from user answers
 */
export function calculateMetricScores(
  answers: Array<{ weights: Array<{ metricId: string; value: number }> }>,
  metrics: Array<{ id: string; name: string }>
): MetricScore[] {
  const scores: Record<string, number> = {}

  // Initialize all metrics to 50 (neutral)
  metrics.forEach((metric) => {
    scores[metric.id] = 50
  })

  // Add weights from answers
  answers.forEach((answer) => {
    answer.weights.forEach((weight) => {
      scores[weight.metricId] = (scores[weight.metricId] || 50) + weight.value
    })
  })

  // Normalize to 0-100 range
  return metrics.map((metric) => ({
    metricId: metric.id,
    metricName: metric.name,
    score: Math.max(0, Math.min(100, scores[metric.id])),
  }))
}

/**
 * Find the best matching archetype based on metric scores
 */
export function findBestArchetype(
  metricScores: MetricScore[],
  archetypes: Array<{
    id: string
    name: string
    metrics: Array<{ metricId: string; targetValue: number; relevance: number }>
  }>
): ArchetypeMatch | null {
  if (archetypes.length === 0) return null

  const matches = archetypes.map((archetype) => {
    // Calculate weighted Euclidean distance
    let distance = 0
    let totalWeight = 0

    archetype.metrics.forEach((archetypeMetric) => {
      const userScore = metricScores.find((s) => s.metricId === archetypeMetric.metricId)
      if (userScore) {
        const diff = userScore.score - archetypeMetric.targetValue
        distance += Math.pow(diff, 2) * archetypeMetric.relevance
        totalWeight += archetypeMetric.relevance
      }
    })

    distance = Math.sqrt(distance / (totalWeight || 1))

    // Convert distance to match score (0-100, where 100 is perfect match)
    const matchScore = Math.max(0, 100 - distance)

    return {
      archetypeId: archetype.id,
      archetypeName: archetype.name,
      matchScore,
      distance,
    }
  })

  // Return the best match
  return matches.reduce((best, current) =>
    current.matchScore > best.matchScore ? current : best
  )
}

/**
 * Calculate percentile rank for a metric score
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
