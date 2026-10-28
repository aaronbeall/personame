import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  apiError,
  WorkflowError
} from '@/lib/personas'
import { publishedQuiz } from '@/lib/public-cache'
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const available = await prisma.persona.findFirst({
      where: {
        slug: (await params).slug,
        status: 'PUBLISHED',
        visibility: 'PUBLIC'
      },
      select: { id: true, updatedAt: true }
    })
    if (!available)
      throw new WorkflowError('This quiz is not available right now.', 404)
    const quiz = await publishedQuiz(available.id, available.updatedAt.toISOString())
    if (!quiz) throw new WorkflowError('This quiz is not available right now.', 404)
    return NextResponse.json(quiz)
  } catch (e) {
    return apiError(e)
  }
}
