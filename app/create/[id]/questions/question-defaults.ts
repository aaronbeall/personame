import { Answer, AnswerWeight, Metric } from '@prisma/client'
import { getTempId } from '@/lib/utils'

/**
 * Creates default answers for a question based on its type
 */
export function createDefaultAnswers(
  type: 'MULTIPLE_CHOICE' | 'SLIDER' | 'SCALE',
  metrics: Metric[]
): (Answer & { weights: AnswerWeight[] })[] {
  const createWeights = (answerId: string): AnswerWeight[] => {
    return metrics.map(m => ({
      id: getTempId(),
      metricId: m.id,
      value: 0,
      answerId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }))
  }

  const createAnswer = (text: string, order: number, questionId: string = getTempId()): Answer & { weights: AnswerWeight[] } => {
    const answerId = getTempId()
    return {
      id: answerId,
      text,
      order,
      emoji: null,
      color: null,
      style: null,
      icon: null,
      questionId,
      weights: createWeights(answerId),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }

  switch (type) {
    case 'MULTIPLE_CHOICE':
      return [
        createAnswer('Option 1', 0),
        createAnswer('Option 2', 1),
      ]

    case 'SLIDER':
      return [
        createAnswer('Min', 0),
        createAnswer('Max', 1),
      ]

    case 'SCALE':
      return [
        createAnswer('Low', 0),  // Min endpoint
        createAnswer('High', 1), // Max endpoint
        ...['1', '2', '3', '4', '5'].map((val, idx) => createAnswer(val, idx + 2)),
      ]

    default:
      return []
  }
}
