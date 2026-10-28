import { NextResponse } from 'next/server'
import { currentUser, apiError } from '@/lib/personas'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET() {
  try {
    const user = await currentUser()
    const [count, discoveries] = await Promise.all([
      prisma.persona.count({ where: { creatorId: user.id } }),
      prisma.$queryRaw<{ count: bigint }[]>(Prisma.sql`SELECT COUNT(DISTINCT "personaId") AS count FROM "QuizResult" WHERE "userId" = ${user.id}`),
    ])
    return NextResponse.json({ count, selvesCount: Number(discoveries[0].count) })
  } catch (error) {
    return apiError(error)
  }
}
