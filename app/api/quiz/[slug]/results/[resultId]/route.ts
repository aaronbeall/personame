import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiError, WorkflowError } from '@/lib/personas'
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string; resultId: string }> }
) {
  try {
    const { slug, resultId } = await params
    const result = await prisma.quizResult.findFirst({
      where: { id: resultId, persona: { slug, visibility: 'PUBLIC' } },
      select: { snapshot: true, completedAt: true }
    })
    if (!result?.snapshot) throw new WorkflowError('Result not found.', 404)
    return NextResponse.json(result)
  } catch (e) {
    return apiError(e)
  }
}
