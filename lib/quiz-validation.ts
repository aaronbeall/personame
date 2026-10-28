import type { FullQuiz } from './personas'
export function readinessByStage(quiz: FullQuiz) {
  const stages = {
    name: [] as string[],
    dimensions: [] as string[],
    archetypes: [] as string[],
    questions: [] as string[],
  }
  if (!quiz.title.trim()) stages.name.push('Give your quiz a title.')
  if (!quiz.dimensions.length)
    stages.dimensions.push('Add at least one personality dimension.')
  if (quiz.archetypes.length < 2)
    stages.archetypes.push(
      'Add at least two archetypes to match participants with.',
    )
  const dimensionIds = new Set(quiz.dimensions.map((m) => m.id))
  for (const a of quiz.archetypes) {
    if (!a.name.trim()) stages.archetypes.push('Name every archetype.')
    if (
      !a.dimensions.some(
        (m) => dimensionIds.has(m.dimensionId) && m.relevance > 0,
      )
    )
      stages.archetypes.push(
        `Set dimension targets for ${a.name || 'each archetype'}.`,
      )
  }
  const questions = quiz.pages
    .filter((p) => !p.hidden && p.style !== 'cover' && p.style !== 'results')
    .flatMap((p) => p.questions)
  if (!questions.length)
    stages.questions.push('Add at least one visible question.')
  for (const q of questions) {
    if (!q.text.trim()) stages.questions.push('Give every question some text.')
    const minimum = q.type === 'SCALE' ? 4 : 2
    if (q.answers.length < minimum)
      stages.questions.push(
        `Add ${q.type === 'SCALE' ? 'two endpoints and at least two scale points' : 'at least two answers'} to “${q.text}”.`,
      )
    if (q.answers.some((a) => !a.text.trim()))
      stages.questions.push(`Finish the answer labels for “${q.text}”.`)
    if (
      q.answers.some((a) =>
        a.weights.some((w) => !dimensionIds.has(w.dimensionId)),
      )
    )
      stages.questions.push(`Repair the dimension weights for “${q.text}”.`)
  }
  for (const m of quiz.dimensions)
    if (
      !questions.some((q) =>
        (q.type === 'MULTIPLE_CHOICE' ? q.answers : q.answers.slice(0, 2)).some(
          (a) => a.weights.some((w) => w.dimensionId === m.id && w.value !== 0),
        ),
      )
    )
      stages.questions.push(
        `Give at least one answer a non-zero weight for ${m.name}.`,
      )
  return stages
}

export function readiness(quiz: FullQuiz): string[] {
  return [...new Set(Object.values(readinessByStage(quiz)).flat())]
}
