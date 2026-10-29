import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { quizInclude, apiError, WorkflowError } from '@/lib/personas'
import { scoreQuiz } from '@/lib/quiz-scoring'
import { retryTransaction } from '@/lib/transaction-retry'
const input = z.object({
  revision: z.string(),
  submissionKey: z.uuid(),
  responses: z.record(
    z.string(),
    z.object({
      answerId: z.string().optional(),
      value: z.number().min(0).max(100).optional()
    })
  )
})
export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const body = input.parse(await req.json())
    const session = await getServerSession(authOptions)
    const result = await retryTransaction(async () => {
      try { return await prisma.$transaction(
      async (tx) => {
        const quiz = await tx.persona.findFirst({
          where: { slug, status: 'PUBLISHED', visibility: 'PUBLIC' },
          include: quizInclude
        })
        if (!quiz)
          throw new WorkflowError(
            'This quiz is no longer accepting responses.',
            404
          )
        const previous = await tx.quizResult.findUnique({
          where: { submissionKey: body.submissionKey },
          select: { id: true, personaId: true }
        })
        if (previous && previous.personaId === quiz.id) return previous
        if (previous) throw new WorkflowError('Please start a new response.')
        if (quiz.updatedAt.toISOString() !== body.revision)
          throw new WorkflowError(
            'This quiz changed while you were answering. Reload to start the updated version.',
            409
          )
        let scored
        try {
          scored = scoreQuiz(quiz, body.responses)
        } catch (e) {
          throw new WorkflowError(
            e instanceof Error ? e.message : 'Check your answers.'
          )
        }
        const userId = session?.user?.id
        const saved = await tx.quizResult.create({
          data: {
            personaId: quiz.id,
            userId,
            archetypeId: scored.archetypeId,
            submissionKey: body.submissionKey,
            snapshot: JSON.parse(JSON.stringify(scored.snapshot)),
            answers: { create: scored.answers },
            dimensionScores: {
              create: scored.scores.filter(s => s.evidenceCount !== 0).map((s) => ({
                dimensionName: s.dimensionName,
                score: s.score
              }))
            }
          }
        })
        await tx.persona.update({
          where: { id: quiz.id },
          data: { completions: { increment: 1 }, updatedAt: quiz.updatedAt }
        })
        return saved
      },
      { isolationLevel: 'Serializable', timeout: 15000 }
    ) } catch (error) {
        if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
          const previous = await prisma.quizResult.findFirst({
            where: { submissionKey: body.submissionKey, persona: { slug, status: 'PUBLISHED', visibility: 'PUBLIC' } },
            select: { id: true },
          })
          if (previous) return previous
        }
        throw error
      }
    })
    return NextResponse.json({ id: result.id })
  } catch (e) {
    return apiError(e)
  }
}
