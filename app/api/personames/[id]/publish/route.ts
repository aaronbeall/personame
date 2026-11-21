import { z } from 'zod'
import { quizTagsSchema } from '@/lib/quiz-tags'
import { NextResponse } from 'next/server'
import { ownedQuizSelect, apiError, WorkflowError, quizInclude } from '@/lib/personas'
import { prisma } from '@/lib/prisma'
import { readiness } from '@/lib/quiz-validation'
import { invalidatePublicQuiz } from '@/lib/public-cache'
import { retryTransaction } from '@/lib/transaction-retry'
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const quiz = await ownedQuizSelect((await params).id, { id: true, publishedAt: true })
    const payload = await request.text()
    const { tags } = z.object({ tags: quizTagsSchema.optional() }).parse(payload ? JSON.parse(payload) : {})
    const result = await retryTransaction(() => prisma.$transaction(
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
            tags,
            visibility: 'PUBLIC',
            publishedAt: quiz.publishedAt ?? new Date()
          }
        })
      },
      { isolationLevel: 'Serializable' }
    ))
    invalidatePublicQuiz(quiz.id)
    return NextResponse.json(result)
  } catch (e) {
    return apiError(e)
  }
}
