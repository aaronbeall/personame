import { scoringModelKey } from './scoring-model-key'
import { pagePresentation, type PagePresentation } from './quiz-presentation'
import { questionInfluence } from './question-influence'
import type { FullQuiz } from './personas'
import {
  calculateDimensionScores,
  rankArchetypes,
  type Contribution,
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
    evidenceCount?: number
    evidenceWeight?: number
    minEmoji?: string | null
    maxEmoji?: string | null
    minLabel: string | null
    maxLabel: string | null
  }[]
  quizColor?: string | null
  quizEmoji?: string | null
  modelKey?: string
  resultPage?: { title: string | null; description: string | null; color: string | null; presentation: PagePresentation }
  matchScore: number
  scoringVersion?: number
  matchMargin?: number | null
  ambiguous?: boolean
  alternatives?: { name: string; description: string | null; emoji: string | null; color: string | null; matchScore: number; tied: boolean }[]
}
export function scoreQuiz(quiz: FullQuiz, responses: QuizResponses) {
  const questions = quiz.pages
    .filter((p) => !p.hidden && p.style !== 'cover' && p.style !== 'results')
    .flatMap((p) => p.questions)
  if (Object.keys(responses).some((id) => !questions.some((q) => q.id === id)))
    throw new Error('An answer refers to a question that is not in this quiz.')
  const contributions: Contribution[] = []
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
      contributions.push({ weights: quiz.dimensions.filter(d => q.answers.some(a => a.weights.some(w => w.dimensionId === d.id))).map(d => ({ dimensionId: d.id, influence: questionInfluence(q, d.id), value: answer.weights.find(w => w.dimensionId === d.id)?.value ?? 50 })) })
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
        weights: quiz.dimensions.filter(m => low.weights.some(w => w.dimensionId === m.id) || high.weights.some(w => w.dimensionId === m.id)).map((m) => {
          const a = low.weights.find((w) => w.dimensionId === m.id)?.value ?? 50
          const b = high.weights.find((w) => w.dimensionId === m.id)?.value ?? 50
          return { dimensionId: m.id, value: a + (b - a) * ratio, influence: questionInfluence(q, m.id) }
        }),
      })
      answers.push({
        answerId: q.type === 'SLIDER' ? low.id : points[index].id,
        value: ratio * 100,
      })
    }
  }
  const scores = calculateDimensionScores(contributions, quiz.dimensions)
  const matches = rankArchetypes(scores, quiz.archetypes)
  const match = matches[0]
  if (!match)
    throw new Error(
      'There are not enough answered, mapped questions to match an archetype.',
    )
  const archetype = quiz.archetypes.find((a) => a.id === match.archetypeId)!
  const snapshot: ResultSnapshot = {
    quizTitle: quiz.title,
    quizColor: quiz.color,
    quizEmoji: quiz.emoji,
    modelKey: scoringModelKey(quiz),
    resultPage: (() => { const page = quiz.pages.find(p => p.style === 'results'); return { title: page?.title ?? null, description: page?.description ?? null, color: page?.color ?? null, presentation: pagePresentation(page?.presentation) } })(),
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
    scoringVersion: 2,
    matchMargin: matches[1] ? matches[1].distance - match.distance : null,
    ambiguous: !!matches[1] && matches[1].distance - match.distance < 5,
    alternatives: matches.slice(1, 3).map(other => {
      const a = quiz.archetypes.find(a => a.id === other.archetypeId)!
      return { name: a.name, description: a.description, emoji: a.emoji, color: a.color, matchScore: other.matchScore, tied: Math.abs(other.distance - match.distance) < 1e-9 }
    }),
  }
  return { answers, scores, archetypeId: match.archetypeId, snapshot }
}
