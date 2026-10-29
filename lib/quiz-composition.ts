import type { ReadinessQuiz } from './quiz-projections'
import { readinessByStage } from './quiz-validation'

const definitions = [
  ['name', 'Name'],
  ['dimensions', 'Dimensions'],
  ['archetypes', 'Archetypes'],
  ['questions', 'Questions'],
  ['preview', 'Review & publish'],
] as const
export function getQuizComposition(quiz: ReadinessQuiz) {
  const issues = readinessByStage(quiz)
  const visibleQuestions = quiz.pages
    .filter((p) => !p.hidden && p.style !== 'cover' && p.style !== 'results')
    .flatMap((p) => p.questions)
  const counts = {
    name: quiz.title.trim() ? 1 : 0,
    dimensions: quiz.dimensions.length,
    archetypes: quiz.archetypes.length,
    questions: visibleQuestions.length,
    preview: 0,
  }
  const finished = (key: (typeof definitions)[number][0]) =>
    key === 'preview' ? quiz.status === 'PUBLISHED' : issues[key].length === 0
  const next = definitions.find(([key]) => !finished(key))?.[0] ?? 'preview'
  return {
    next,
    readyToPublish: Object.values(issues).every((group) => group.length === 0),
    stages: definitions.map(([key, label]) => ({
      key,
      label,
      count: counts[key],
      state: finished(key)
        ? ('complete' as const)
        : key === next
          ? ('next' as const)
          : ('remaining' as const),
    })),
    dimensions: quiz.dimensions
      .slice(0, 3)
      .map((d) => ({ id: d.id, name: d.name, color: d.color })),
    archetypes: quiz.archetypes
      .slice(0, 3)
      .map((a) => ({ id: a.id, name: a.name, color: a.color })),
  }
}
export type QuizComposition = ReturnType<typeof getQuizComposition>
export type OwnedQuizSummary = {
  id: string
  title: string
  description: string | null
  slug: string
  status: string
  visibility: string
  color: string | null
  emoji: string | null
  completions: number
  updatedAt: string
  _count: { dimensions: number; archetypes: number; pages: number }
  composition: QuizComposition
}
