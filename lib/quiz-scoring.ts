import type { FullQuiz } from './personas'
import {
  calculateDimensionScores,
  findBestArchetype,
} from './quiz-calculations'
export type ResponseValue = { answerId?: string; value?: number }
export type QuizResponses = Record<string, ResponseValue>
export type ResultSnapshot = {
  quizTitle: string
  slug: string
  archetype: {
    name: string
    description: string | null
    emoji: string | null
    color: string | null
  }
  scores: {
    dimensionId: string
    dimensionName: string
    color?: string | null
    score: number
    minEmoji?: string | null
    maxEmoji?: string | null
    minLabel: string | null
    maxLabel: string | null
  }[]
  matchScore: number
}
export function scoreQuiz(quiz: FullQuiz, responses: QuizResponses) {
  const questions = quiz.pages
    .filter((p) => !p.hidden && p.style !== 'cover' && p.style !== 'results')
    .flatMap((p) => p.questions)
  if (Object.keys(responses).some((id) => !questions.some((q) => q.id === id)))
    throw new Error('An answer refers to a question that is not in this quiz.')
  const contributions: { weights: { dimensionId: string; value: number }[] }[] =
    []
  const answers: { answerId: string; value?: number }[] = []
  for (const q of questions) {
    const response = responses[q.id]
    if (!response) {
      if (q.required) throw new Error(`Answer “${q.text}” before continuing.`)
      continue
    }
    if (q.type === 'MULTIPLE_CHOICE') {
      const answer = q.answers.find((a) => a.id === response.answerId)
      if (!answer) throw new Error(`Choose an answer for “${q.text}”.`)
      contributions.push(answer)
      answers.push({ answerId: answer.id })
    } else {
      const points = q.answers.slice(2)
      const index = points.findIndex((a) => a.id === response.answerId)
      const ratio =
        q.type === 'SLIDER'
          ? (response.value ?? NaN) / 100
          : index / (points.length - 1)
      if (
        !Number.isFinite(ratio) ||
        ratio < 0 ||
        ratio > 1 ||
        (q.type === 'SCALE' && index < 0) ||
        q.answers.length < 2
      )
        throw new Error(`Choose a value for “${q.text}”.`)
      const [low, high] = q.answers
      contributions.push({
        weights: quiz.dimensions.map((m) => {
          const a = low.weights.find((w) => w.dimensionId === m.id)?.value ?? 0
          const b = high.weights.find((w) => w.dimensionId === m.id)?.value ?? 0
          return { dimensionId: m.id, value: a + (b - a) * ratio }
        }),
      })
      answers.push({
        answerId: q.type === 'SLIDER' ? low.id : points[index].id,
        value: ratio * 100,
      })
    }
  }
  const scores = calculateDimensionScores(contributions, quiz.dimensions)
  const match = findBestArchetype(scores, quiz.archetypes)
  if (!match)
    throw new Error(
      'This quiz needs at least one archetype before it can be scored.',
    )
  const archetype = quiz.archetypes.find((a) => a.id === match.archetypeId)!
  const snapshot: ResultSnapshot = {
    quizTitle: quiz.title,
    slug: quiz.slug,
    archetype: {
      name: archetype.name,
      description: archetype.description,
      emoji: archetype.emoji,
      color: archetype.color,
    },
    scores: scores.map((s) => ({
      ...s,
      color:
        quiz.dimensions.find((dimension) => dimension.id === s.dimensionId)!
          .color ?? null,
      minEmoji:
        quiz.dimensions.find((m) => m.id === s.dimensionId)!.minEmoji ?? null,
      maxEmoji:
        quiz.dimensions.find((m) => m.id === s.dimensionId)!.maxEmoji ?? null,
      minLabel: quiz.dimensions.find((m) => m.id === s.dimensionId)!.minLabel,
      maxLabel: quiz.dimensions.find((m) => m.id === s.dimensionId)!.maxLabel,
    })),
    matchScore: match.matchScore,
  }
  return { answers, scores, archetypeId: match.archetypeId, snapshot }
}
