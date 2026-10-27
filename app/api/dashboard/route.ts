import { NextResponse } from 'next/server'
import { currentUser, apiError } from '@/lib/personas'
import { prisma } from '@/lib/prisma'
export async function GET() {
  try {
    const user = await currentUser()
    const quizzes = await prisma.persona.findMany({
      where: { creatorId: user.id },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: { select: { dimensions: true, archetypes: true, pages: true } }
      }
    })
    return NextResponse.json(quizzes)
  } catch (e) {
    return apiError(e)
  }
}
