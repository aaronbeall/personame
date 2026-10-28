import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { quizInclude, apiError, WorkflowError } from '@/lib/personas'
import { scoreQuiz } from '@/lib/quiz-scoring'
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
    const result = await prisma.$transaction(
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
          where: { submissionKey: body.submissionKey }
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
        const user = session?.user?.email
          ? await tx.user.findUnique({ where: { email: session.user.email } })
          : null
        const saved = await tx.quizResult.create({
          data: {
            personaId: quiz.id,
            userId: user?.id,
            archetypeId: scored.archetypeId,
            submissionKey: body.submissionKey,
            snapshot: JSON.parse(JSON.stringify(scored.snapshot)),
            answers: { create: scored.answers },
            dimensionScores: {
              create: scored.scores.map((s) => ({
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
    )
    return NextResponse.json({ id: result.id })
  } catch (e) {
    return apiError(e)
  }
}
