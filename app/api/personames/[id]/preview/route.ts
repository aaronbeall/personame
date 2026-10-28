import { NextResponse } from 'next/server'
import { z } from 'zod'
import { ownedQuiz, apiError, WorkflowError } from '@/lib/personas'
import { scoreQuiz } from '@/lib/quiz-scoring'
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const quiz = await ownedQuiz((await params).id)
    const { responses } = z
      .object({
        responses: z.record(
          z.string(),
          z.object({
            answerId: z.string().optional(),
            value: z.number().min(0).max(100).optional()
          })
        )
      })
      .parse(await req.json())
    try {
      return NextResponse.json(scoreQuiz(quiz, responses).snapshot)
    } catch (e) {
      throw new WorkflowError(
        e instanceof Error ? e.message : 'Check your quiz.'
      )
    }
  } catch (e) {
    return apiError(e)
  }
}
