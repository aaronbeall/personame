import { NextResponse } from 'next/server'
import { currentUser, apiError } from '@/lib/personas'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const user = await currentUser()
    const [count, discoveries] = await Promise.all([
      prisma.persona.count({ where: { creatorId: user.id } }),
      prisma.quizResult.groupBy({
        by: ['personaId'],
        where: { userId: user.id },
      }),
    ])
    return NextResponse.json({ count, selvesCount: discoveries.length })
  } catch (error) {
    return apiError(error)
  }
}
