import type { FullQuiz } from './personas'
import { calculateDimensionScores, findBestArchetype } from './quiz-calculations'

type Quiz = Pick<FullQuiz, 'dimensions' | 'archetypes' | 'pages'>
const clamp = (value: number) => Math.max(0, Math.min(100, value))
export function wilsonInterval(wins: number, count: number): [number, number] {
  if (!count) return [0, 1]
  const p = wins / count, z2 = 1.96 ** 2, denominator = 1 + z2 / count
  const center = (p + z2 / (2 * count)) / denominator
  const radius = 1.96 * Math.sqrt(p * (1 - p) / count + z2 / (4 * count ** 2)) / denominator
  return [Math.max(0, center - radius), Math.min(1, center + radius)]
}

/** Integer slider positions match the current player. Optional questions are answered. */
export function questionSpaceOptions(question: Quiz['pages'][number]['questions'][number], dimensions: Quiz['dimensions']) {
  const weights = (answer: typeof question.answers[number]) => dimensions.map(d => answer.weights.find(w => w.dimensionId === d.id)?.value ?? 0)
  if (question.type === 'MULTIPLE_CHOICE') return question.answers.map(weights)
  if (question.answers.length < 2 || (question.type === 'SCALE' && question.answers.length < 4)) return []
  const low = weights(question.answers[0]), high = weights(question.answers[1])
  const count = question.type === 'SLIDER' ? 101 : question.answers.length - 2
  return Array.from({ length: count }, (_, i) => low.map((a, d) => a + (high[d] - a) * i / (count - 1)))
}

export function analyzeQuestionSpace(quiz: Quiz) {
  const { dimensions, archetypes } = quiz
  const questions = quiz.pages.filter(p => !p.hidden && p.style !== 'cover' && p.style !== 'results').flatMap(p => p.questions)
  const prepared = questions.map(q => {
    const options = questionSpaceOptions(q, dimensions)
    const axes = dimensions.map((d, index) => {
      const values = options.map(option => option[index])
      const min = values.length ? Math.min(...values) : 0, max = values.length ? Math.max(...values) : 0
      const mean = values.reduce((sum, value) => sum + value, 0) / (values.length || 1)
      const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (values.length || 1)
      return { id: d.id, min, max, mean, variance, span: max - min }
    })
    return { id: q.id, text: q.text, type: q.type, options, axes }
  })
  const axes = dimensions.map((d, index) => ({
    id: d.id,
    min: clamp(50 + prepared.reduce((sum, q) => sum + q.axes[index].min, 0)),
    max: clamp(50 + prepared.reduce((sum, q) => sum + q.axes[index].max, 0)),
    questions: prepared.filter(q => q.axes[index].span > 0).length,
    bins: Array<number>(10).fill(0), mean: 0, clipped: 0,
  }))
  const invalid = prepared.filter(q => !q.options.length || q.options.some(o => o.some(v => !Number.isFinite(v))))
  const canScore = dimensions.length > 0 && archetypes.length > 0 && questions.length > 0 && !invalid.length
  const paths = prepared.reduce((product, q) => product * q.options.length, 1)
  // Bound work as well as sample count; computation runs off the UI thread.
  const workPerPath = Math.max(1, questions.length * dimensions.length + archetypes.reduce((sum, a) => sum + a.dimensions.length, 0))
  const budget = Math.max(128, Math.min(8192, Math.floor(4_000_000 / workPerPath)))
  const exact = paths <= budget
  const count = canScore ? exact ? paths : Math.min(4096, budget) : 0
  const wins = archetypes.map(() => 0)
  let state = 0x12345678
  const random = () => { state ^= state << 13; state ^= state >>> 17; state ^= state << 5; return (state >>> 0) / 4294967296 }
  for (let sample = 0; sample < count; sample++) {
    let cursor = sample
    const contributions = prepared.map(q => {
      const index = exact ? cursor % q.options.length : Math.floor(random() * q.options.length)
      if (exact) cursor = Math.floor(cursor / q.options.length)
      return { weights: dimensions.map((d, i) => ({ dimensionId: d.id, value: q.options[index][i] })) }
    })
    const scores = calculateDimensionScores(contributions, dimensions)
    const match = findBestArchetype(scores, archetypes)!
    wins[archetypes.findIndex(a => a.id === match.archetypeId)]++
    scores.forEach((score, index) => {
      const axis = axes[index]
      axis.bins[Math.min(9, Math.floor(score.score / 10))]++
      axis.mean += score.score / count
      const raw = 50 + contributions.reduce((sum, q) => sum + q.weights[index].value, 0)
      if (raw < 0 || raw > 100) axis.clipped++
    })
  }
  const outcomes = archetypes.map((a, i) => {
    const active = a.dimensions.filter(t => t.relevance > 0 && dimensions.some(d => d.id === t.dimensionId))
    const total = active.reduce((sum, t) => sum + t.relevance, 0)
    const outside = active.filter(t => { const axis = axes.find(d => d.id === t.dimensionId)!; return t.targetValue < axis.min || t.targetValue > axis.max })
    const probability = count ? wins[i] / count : 0
    return { id: a.id, wins: wins[i], probability, interval: exact ? [probability, probability] as [number, number] : wilsonInterval(wins[i], count), active: active.length, outside: outside.map(t => t.dimensionId), coverage: total ? 1 - outside.reduce((sum, t) => sum + t.relevance, 0) / total : null }
  })
  const entropy = outcomes.reduce((sum, a) => sum - (a.probability ? a.probability * Math.log(a.probability) : 0), 0)
  return { questions: prepared.map(({ options, ...q }) => ({ ...q, options: options.length })), axes, outcomes, count, exact, paths: Number.isFinite(paths) ? paths : null, invalid: invalid.map(q => q.id), diversity: count ? Math.exp(entropy) : 0 }
}
export type QuestionSpaceAnalysis = ReturnType<typeof analyzeQuestionSpace>
