import { questionInfluence } from './question-influence'
import type { FullQuiz } from './personas'
import { calculateDimensionScores, rankArchetypes } from './quiz-calculations'

type Quiz = Pick<FullQuiz, 'dimensions' | 'archetypes' | 'pages'>
export function wilsonInterval(wins: number, count: number): [number, number] {
  if (!count) return [0, 1]
  const p = wins / count, z2 = 1.96 ** 2, denominator = 1 + z2 / count
  const center = (p + z2 / (2 * count)) / denominator
  const radius = 1.96 * Math.sqrt(p * (1 - p) / count + z2 / (4 * count ** 2)) / denominator
  return [Math.max(0, center - radius), Math.min(1, center + radius)]
}

/** Integer slider positions match the current player. Optional questions are answered. */
export function questionSpaceOptions(question: Quiz['pages'][number]['questions'][number], dimensions: Quiz['dimensions']) {
  const weights = (answer: typeof question.answers[number]) => dimensions.map(d => answer.weights.find(w => w.dimensionId === d.id)?.value ?? 50)
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
      const mapped = (q.type === 'MULTIPLE_CHOICE' ? q.answers : q.answers.slice(0, 2)).some(a => a.weights.some(w => w.dimensionId === d.id))
      const values = options.map(option => option[index])
      const min = values.length ? Math.min(...values) : 50, max = values.length ? Math.max(...values) : 50
      const mean = values.reduce((sum, value) => sum + value, 0) / (values.length || 1)
      const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (values.length || 1)
      return { id: d.id, min, max, mean, variance, mapped, influence: questionInfluence(q, d.id), span: mapped ? max - min : 0 }
    })
    return { id: q.id, text: q.text, type: q.type, options, axes }
  })
  const axes = dimensions.map((d, index) => {
    const measuring = prepared.filter(q => q.axes[index].mapped)
    const total = measuring.reduce((sum, q) => sum + q.axes[index].influence, 0)
    return { id: d.id,
      min: total ? measuring.reduce((sum, q) => sum + q.axes[index].min * q.axes[index].influence, 0) / total : 50,
      max: total ? measuring.reduce((sum, q) => sum + q.axes[index].max * q.axes[index].influence, 0) / total : 50,
      questions: measuring.filter(q => q.axes[index].span > 0).length,
      evidenceQuestions: measuring.length,
      bins: Array<number>(10).fill(0), mean: 0,
    }
  })
  // Links represent how much each question can move the final dimension score.
  for (const [index] of dimensions.entries()) {
    const total = prepared.filter(q => q.axes[index].mapped).reduce((sum, q) => sum + q.axes[index].influence, 0)
    for (const q of prepared) q.axes[index].span *= total ? q.axes[index].influence / total : 0
  }
  const invalid = prepared.filter(q => !q.options.length || q.options.some(o => o.some(v => !Number.isFinite(v))))
  const canScore = dimensions.length > 0 && archetypes.length > 0 && questions.length > 0 && !invalid.length && prepared.some(q => q.axes.some(a => a.mapped)) && archetypes.some(a => a.dimensions.some(t => t.relevance > 0 && axes.some(d => d.id === t.dimensionId && d.evidenceQuestions)))
  const paths = prepared.reduce((product, q) => product * q.options.length, 1)
  // Bound work as well as sample count; computation runs off the UI thread.
  const workPerPath = Math.max(1, 2 * questions.length * dimensions.length + 2 * archetypes.reduce((sum, a) => sum + a.dimensions.length, 0))
  const budget = Math.max(128, Math.min(8192, Math.floor(4_000_000 / workPerPath)))
  const exact = paths <= budget
  const count = canScore ? exact ? paths : Math.min(4096, budget) : 0
  const wins = archetypes.map(() => 0)
  let closeMatches = 0, omissionChanges = 0, omissionComparisons = 0
  let state = 0x12345678
  const random = () => { state ^= state << 13; state ^= state >>> 17; state ^= state << 5; return (state >>> 0) / 4294967296 }
  for (let sample = 0; sample < count; sample++) {
    let cursor = sample
    const contributions = prepared.map(q => {
      const index = exact ? cursor % q.options.length : Math.floor(random() * q.options.length)
      if (exact) cursor = Math.floor(cursor / q.options.length)
      return { weights: dimensions.flatMap((d, i) => q.axes[i].mapped ? [{ dimensionId: d.id, value: q.options[index][i], influence: q.axes[i].influence }] : []) }
    })
    const scores = calculateDimensionScores(contributions, dimensions)
    const matches = rankArchetypes(scores, archetypes)
    const match = matches[0]
    if (!match) continue
    if (matches[1] && matches[1].distance - match.distance < 5) closeMatches++
    const omitted = rankArchetypes(calculateDimensionScores(contributions.filter((_, index) => index !== sample % contributions.length), dimensions), archetypes)[0]
    if (omitted) { omissionComparisons++; if (omitted.archetypeId !== match.archetypeId) omissionChanges++ }
    wins[archetypes.findIndex(a => a.id === match.archetypeId)]++
    scores.forEach((score, index) => {
      const axis = axes[index]
      if (!score.evidenceCount) return
      axis.bins[Math.min(9, Math.floor(score.score / 10))]++
      axis.mean += score.score / count
    })
  }
  const outcomes = archetypes.map((a, i) => {
    const active = a.dimensions.filter(t => t.relevance > 0 && dimensions.some(d => d.id === t.dimensionId))
    const total = active.reduce((sum, t) => sum + t.relevance, 0)
    const outside = active.filter(t => { const axis = axes.find(d => d.id === t.dimensionId)!; return !axis.evidenceQuestions || t.targetValue < axis.min || t.targetValue > axis.max })
    const probability = count ? wins[i] / count : 0
    return { id: a.id, wins: wins[i], probability, interval: exact ? [probability, probability] as [number, number] : wilsonInterval(wins[i], count), active: active.length, outside: outside.map(t => t.dimensionId), coverage: total ? 1 - outside.reduce((sum, t) => sum + t.relevance, 0) / total : null }
  })
  const entropy = outcomes.reduce((sum, a) => sum - (a.probability ? a.probability * Math.log(a.probability) : 0), 0)
  return { closeMatchShare: count ? closeMatches / count : null, omissionFlipShare: omissionComparisons ? omissionChanges / omissionComparisons : null, omissionComparisons, questions: prepared.map(({ options, ...q }) => ({ ...q, options: options.length })), axes, outcomes, count, exact, paths: Number.isFinite(paths) ? paths : null, invalid: invalid.map(q => q.id), diversity: count ? Math.exp(entropy) : 0 }
}
export type QuestionSpaceAnalysis = ReturnType<typeof analyzeQuestionSpace>
