import { NextResponse } from 'next/server'
import { ownedQuizSelect, apiError } from '@/lib/personas'
import { readinessSelect } from '@/lib/quiz-projections'
import { getQuizComposition } from '@/lib/quiz-composition'
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    return NextResponse.json(getQuizComposition(await ownedQuizSelect((await params).id, readinessSelect)))
  } catch (error) { return apiError(error) }
}
