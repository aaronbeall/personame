import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resultComparison } from '@/lib/result-comparison'
import type { ResultSnapshot } from '@/lib/quiz-scoring'
import { apiError, WorkflowError } from '@/lib/personas'
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string; resultId: string }> }
) {
  try {
    const { slug, resultId } = await params
    const result = await prisma.quizResult.findFirst({
      where: { id: resultId, persona: { slug, visibility: 'PUBLIC' } },
      select: { id: true, personaId: true, archetypeId: true, modelKey: true, snapshot: true, completedAt: true }
    })
    if (!result?.snapshot) throw new WorkflowError('Result not found.', 404)
    return NextResponse.json({ snapshot: result.snapshot, completedAt: result.completedAt, comparison: await resultComparison(result, result.snapshot as unknown as ResultSnapshot) })
  } catch (e) {
    return apiError(e)
  }
}
