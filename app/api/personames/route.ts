import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createPersonameSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const json = await req.json()
    const body = createPersonameSchema.parse(json)

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Generate unique slug
    const baseSlug = body.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
    const randomSuffix = Math.random().toString(36).substring(2, 8)
    const slug = `${baseSlug}-${randomSuffix}`

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const personame: any = await prisma.personame.create({
      data: {
        title: body.title,
        description: body.description,
        slug,
        creatorId: user.id,
      },
    })

    return NextResponse.json(personame)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error creating personame:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const visibility = searchParams.get('visibility')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}
    
    if (status) {
      where.status = status
    }
    if (visibility) {
      where.visibility = visibility
    }

    const personames = await prisma.personame.findMany({
      where,
      include: {
        creator: {
          select: {
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            results: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    })

    return NextResponse.json(personames)
  } catch (error) {
    console.error('Error fetching personames:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
