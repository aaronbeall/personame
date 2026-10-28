import { NextResponse } from 'next/server'
import { z } from 'zod'
import { ownedQuiz, apiError } from '@/lib/personas'
import { prisma } from '@/lib/prisma'
import { quizDetailsSchema } from '@/lib/quiz-details'
import { readiness } from '@/lib/quiz-validation'
type Context = { params: Promise<{ id: string }> }
export async function GET(_req: Request, { params }: Context) {
  try {
    const quiz = await ownedQuiz((await params).id)
    return NextResponse.json({ ...quiz, issues: readiness(quiz) })
  } catch (e) {
    return apiError(e)
  }
}
export async function PATCH(req: Request, { params }: Context) {
  try {
    const quiz = await ownedQuiz((await params).id)
    const body = quizDetailsSchema
      .partial()
      .extend({ status: z.enum(['DRAFT', 'CLOSED']).optional() })
      .parse(await req.json())
    return NextResponse.json(
      await prisma.persona.update({
        where: { id: quiz.id },
        data: { ...body, status: body.status ?? 'DRAFT' },
      }),
    )
  } catch (e) {
    return apiError(e)
  }
}
