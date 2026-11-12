import { NextResponse } from 'next/server'
import { ownedQuizSelect, apiError } from '@/lib/personas'
import { encodeQuizAppearance, quizAppearance } from '@/lib/quiz-presentation'
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { pages, ...details } = await ownedQuizSelect((await params).id, {
      title: true, description: true, emoji: true, color: true, style: true,
      pages: { where: { style: 'cover' }, take: 1, orderBy: { order: 'asc' }, select: { presentation: true } },
    })
    return NextResponse.json({
      ...details,
      style: encodeQuizAppearance(quizAppearance(details, pages[0]?.presentation)),
    })
  } catch (error) { return apiError(error) }
}
