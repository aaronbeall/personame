import { NextResponse } from 'next/server'
import { currentUser, apiError } from '@/lib/personas'
import { prisma } from '@/lib/prisma'
import type { ResultSnapshot } from '@/lib/quiz-scoring'

export async function GET() {
  try {
    const user = await currentUser()
    const results = await prisma.quizResult.findMany({
      where: { userId: user.id },
      orderBy: [{ completedAt: 'desc' }, { id: 'desc' }],
      distinct: ['personaId'],
      select: {
        id: true,
        completedAt: true,
        snapshot: true,
        persona: {
          select: {
            id: true,
            title: true,
            description: true,
            slug: true,
            emoji: true,
            color: true,
            visibility: true,
          },
        },
      },
    })
    return NextResponse.json(
      results.map(({ snapshot, ...result }) => ({
        archetype: (snapshot as ResultSnapshot | null)?.archetype ?? null,
        ...result,
        canViewResult:
          snapshot !== null && result.persona.visibility === 'PUBLIC',
      })),
    )
  } catch (e) {
    return apiError(e)
  }
}
