import type { Prisma } from '@prisma/client'

/** Only fields used by composition/readiness; no authored descriptions or weight metadata. */
export const readinessSelect = {
  id: true, title: true, status: true,
  dimensions: { select: { id: true, name: true, color: true }, orderBy: { order: 'asc' } },
  archetypes: { select: { id: true, name: true, color: true, dimensions: { select: { dimensionId: true, relevance: true } } }, orderBy: { order: 'asc' } },
  pages: {
    select: {
      hidden: true, style: true,
      questions: { select: {
        text: true, type: true,
        answers: { orderBy: { order: 'asc' }, select: {
          text: true, weights: { select: { dimensionId: true, value: true } },
        } },
      } },
    },
  },
} satisfies Prisma.PersonaSelect
export type ReadinessQuiz = Prisma.PersonaGetPayload<{ select: typeof readinessSelect }>

export const participantSelect = {
  id: true, title: true, slug: true, description: true, emoji: true, color: true, updatedAt: true,
  pages: { where: { hidden: false }, orderBy: { order: 'asc' }, select: {
    id: true, title: true, description: true, hidden: true, emoji: true, color: true, presentation: true, style: true, order: true,
    questions: { orderBy: { order: 'asc' }, select: {
      id: true, text: true, type: true, required: true, emoji: true,
      answers: { orderBy: { order: 'asc' }, select: { id: true, text: true, emoji: true } },
    } },
  } },
} satisfies Prisma.PersonaSelect
export type ParticipantQuiz = Prisma.PersonaGetPayload<{ select: typeof participantSelect }>
