import { NextResponse } from 'next/server'
import { currentUser, apiError, quizInclude } from '@/lib/personas'
import { prisma } from '@/lib/prisma'
import { getQuizComposition } from '@/lib/quiz-composition'
export async function GET() {
  try {
    const user = await currentUser()
    const quizzes = await prisma.persona.findMany({
      where: { creatorId: user.id },
      orderBy: { updatedAt: 'desc' },
      include: {
        ...quizInclude,
        _count: { select: { dimensions: true, archetypes: true, pages: true } },
      },
    })
    return NextResponse.json(
      quizzes.map((q) => ({
        id: q.id,
        title: q.title,
        description: q.description,
        slug: q.slug,
        status: q.status,
        visibility: q.visibility,
        color: q.color,
        emoji: q.emoji,
        completions: q.completions,
        updatedAt: q.updatedAt,
        _count: q._count,
        composition: getQuizComposition(q),
      })),
    )
  } catch (e) {
    return apiError(e)
  }
}
