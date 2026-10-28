import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiError, currentUser } from '@/lib/personas'
import { quizDetailsSchema } from '@/lib/quiz-details'
import { generateUniqueSlug } from '@/lib/utils'

export async function POST(req: Request) {
  try {
    const user = await currentUser()
    const body = quizDetailsSchema.parse(await req.json())
    const persona = await prisma.persona.create({
      data: {
        ...body,
        slug: generateUniqueSlug(body.title),
        creatorId: user.id,
      },
    })
    return NextResponse.json(persona)
  } catch (error) {
    return apiError(error)
  }
}

export async function GET() {
  try {
    const personas = await prisma.persona.findMany({
      where: { status: 'PUBLISHED', visibility: 'PUBLIC' },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        emoji: true,
        color: true,
        completions: true,
        publishedAt: true,
        _count: { select: { archetypes: true } },
      },
      orderBy: { publishedAt: 'desc' },
      take: 30,
    })

    return NextResponse.json(personas)
  } catch (error) {
    console.error('Error fetching personas:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
