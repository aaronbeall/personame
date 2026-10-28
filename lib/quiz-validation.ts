import type { FullQuiz } from './personas'
export function readiness(quiz: FullQuiz): string[] {
  const issues: string[] = []
  if (!quiz.title.trim()) issues.push('Give your quiz a title.')
  if (!quiz.dimensions.length) issues.push('Add at least one personality dimension.')
  if (quiz.archetypes.length < 2)
    issues.push('Add at least two archetypes to match participants with.')
  const dimensionIds = new Set(quiz.dimensions.map((m) => m.id))
  for (const a of quiz.archetypes) {
    if (!a.name.trim()) issues.push('Name every archetype.')
    if (!a.dimensions.some((m) => dimensionIds.has(m.dimensionId) && m.relevance > 0))
      issues.push(`Set dimension targets for ${a.name || 'each archetype'}.`)
  }
  const questions = quiz.pages
    .filter((p) => !p.hidden && p.style !== 'cover' && p.style !== 'results')
    .flatMap((p) => p.questions)
  if (!questions.length) issues.push('Add at least one visible question.')
  for (const q of questions) {
    if (!q.text.trim()) issues.push('Give every question some text.')
    const minimum = q.type === 'SCALE' ? 4 : 2
    if (q.answers.length < minimum)
      issues.push(
        `Add ${q.type === 'SCALE' ? 'two endpoints and at least two scale points' : 'at least two answers'} to “${q.text}”.`
      )
    if (q.answers.some((a) => !a.text.trim()))
      issues.push(`Finish the answer labels for “${q.text}”.`)
    if (
      q.answers.some((a) => a.weights.some((w) => !dimensionIds.has(w.dimensionId)))
    )
      issues.push(`Repair the dimension weights for “${q.text}”.`)
  }
  for (const m of quiz.dimensions)
    if (
      !questions.some((q) =>
        (q.type === 'MULTIPLE_CHOICE' ? q.answers : q.answers.slice(0, 2)).some(
          (a) => a.weights.some((w) => w.dimensionId === m.id && w.value !== 0)
        )
      )
    )
      issues.push(`Give at least one answer a non-zero weight for ${m.name}.`)
  return [...new Set(issues)]
}
