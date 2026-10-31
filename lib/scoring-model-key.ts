import { createHash } from 'node:crypto'
import type { FullQuiz } from './personas'
import { questionInfluence } from './question-influence'
/** Presentation and publishing changes do not split otherwise comparable results. */
export function scoringModelKey(quiz: FullQuiz): string {
  const dimensions = quiz.dimensions.map(d => ({ id: d.id, name: d.name, minLabel: d.minLabel, maxLabel: d.maxLabel }))
  const questions = quiz.pages.filter(p => !p.hidden && p.style !== 'cover' && p.style !== 'results').flatMap(p => p.questions).map(q => ({ id: q.id, text: q.text, type: q.type, required: q.required,
    influences: dimensions.map(d => [d.id, questionInfluence(q, d.id)]),
    answers: q.answers.map(a => ({ id: a.id, text: a.text, positions: [...a.weights].sort((a, b) => a.dimensionId.localeCompare(b.dimensionId)).map(w => [w.dimensionId, w.value]) })) }))
  const archetypes = quiz.archetypes.map(a => ({ id: a.id, targets: [...a.dimensions].sort((a, b) => a.dimensionId.localeCompare(b.dimensionId)).map(d => [d.dimensionId, d.targetValue, d.relevance]) })).sort((a, b) => a.id.localeCompare(b.id))
  return createHash('sha256').update(JSON.stringify({ scoring: 2, dimensions, questions, archetypes })).digest('hex')
}
