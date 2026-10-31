import { prisma } from './prisma'
import type { ResultSnapshot } from './quiz-scoring'
import { pagePresentation } from './quiz-presentation'

export type ResultComparison = { status: 'ready'; completions: number; archetypeShare: number | null; dimensions: { dimensionId: string; average: number; count: number }[] } | { status: 'disabled' | 'waiting' | 'legacy'; minimum?: number }
const MINIMUM_COMPARISONS = 10
/** Aggregate only the same scoring model; expose neither individual answers nor identities. */
export async function resultComparison(result: { id: string; personaId: string; modelKey: string | null; archetypeId: string | null }, snapshot: ResultSnapshot): Promise<ResultComparison> {
  if (!pagePresentation(snapshot.resultPage?.presentation).showComparison) return { status: 'disabled' }
  if (!result.modelKey) return { status: 'legacy' }
  const cohort = { personaId: result.personaId, modelKey: result.modelKey, id: { not: result.id } }
  const completions = await prisma.quizResult.count({ where: cohort })
  if (completions < MINIMUM_COMPARISONS) return { status: 'waiting', minimum: MINIMUM_COMPARISONS }
  const [same, dimensions] = await Promise.all([
    result.archetypeId ? prisma.quizResult.count({ where: { ...cohort, archetypeId: result.archetypeId } }) : Promise.resolve(null),
    prisma.dimensionScore.groupBy({ by: ['dimensionId'], where: { result: cohort, dimensionId: { in: snapshot.scores.filter(s => s.evidenceCount !== 0).map(s => s.dimensionId) } }, _avg: { score: true }, _count: { score: true } }),
  ])
  return { status: 'ready', completions, archetypeShare: same === null || same < 3 ? null : same / completions,
    dimensions: dimensions.filter(d => d.dimensionId && d._count.score >= MINIMUM_COMPARISONS && d._avg.score !== null).map(d => ({ dimensionId: d.dimensionId!, average: d._avg.score!, count: d._count.score })) }
}
