import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiError, currentUser } from '@/lib/personas'
import { quizDetailsSchema } from '@/lib/quiz-details'
import { generateUniqueSlug } from '@/lib/utils'
import { publishedListings } from '@/lib/public-cache'

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
    const personas = await publishedListings()

    return NextResponse.json(personas)
  } catch (error) {
    console.error('Error fetching personas:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
