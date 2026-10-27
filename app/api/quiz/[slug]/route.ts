import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  publicQuiz,
  quizInclude,
  apiError,
  WorkflowError
} from '@/lib/personas'
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const quiz = await prisma.persona.findFirst({
      where: {
        slug: (await params).slug,
        status: 'PUBLISHED',
        visibility: 'PUBLIC'
      },
      include: quizInclude
    })
    if (!quiz)
      throw new WorkflowError('This quiz is not available right now.', 404)
    return NextResponse.json(publicQuiz(quiz))
  } catch (e) {
    return apiError(e)
  }
}
