import { NextResponse } from 'next/server'
import { ownedQuiz, apiError, WorkflowError, quizInclude } from '@/lib/personas'
import { prisma } from '@/lib/prisma'
import { readiness } from '@/lib/quiz-validation'
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const quiz = await ownedQuiz((await params).id)
    const result = await prisma.$transaction(
      async (tx) => {
        const current = await tx.persona.findUniqueOrThrow({
          where: { id: quiz.id },
          include: quizInclude
        })
        const issues = readiness(current)
        if (issues.length) throw new WorkflowError(issues.join(' '))
        return tx.persona.update({
          where: { id: quiz.id },
          data: {
            status: 'PUBLISHED',
            visibility: 'PUBLIC',
            publishedAt: quiz.publishedAt ?? new Date()
          }
        })
      },
      { isolationLevel: 'Serializable' }
    )
    return NextResponse.json(result)
  } catch (e) {
    return apiError(e)
  }
}
