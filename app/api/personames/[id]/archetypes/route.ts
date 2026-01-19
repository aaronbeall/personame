import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma, Archetype, ArchetypeMetric } from '@prisma/client'
import { z } from 'zod'
import { ZodPrismaSchema } from '@/lib/zod-prisma'

// Zod schema constrained by Prisma model types (subset used by the API)
const archetypeMetricSchema = z.object({
  metricId: z.string().min(1),
  targetValue: z.number(),
  relevance: z.number().optional(),
} satisfies ZodPrismaSchema<Omit<ArchetypeMetric, 'id' | 'archetypeId' | 'createdAt' | 'updatedAt'>>)

const archetypeSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  emoji: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  order: z.number(),
  style: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  metrics: z.array(archetypeMetricSchema),
} satisfies ZodPrismaSchema<Omit<Archetype, 'id' | 'personaId' | 'createdAt' | 'updatedAt'>>)

const archetypesSchema = z.object({
  archetypes: z.array(archetypeSchema),
})

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const archetypes = await prisma.archetype.findMany({
      where: { personaId: id },
      orderBy: { order: 'asc' },
      include: {
        metrics: {
          orderBy: { metricId: 'asc' },
        },
      },
    })

    return NextResponse.json(archetypes)
  } catch (error) {
    console.error('Error fetching archetypes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const json = await req.json()
    const { archetypes } = archetypesSchema.parse(json)

    const existingArchetypeIds = await prisma.archetype.findMany({
      where: { personaId: id },
      select: { id: true },
    })

    await prisma.$transaction(async tx => {
      if (existingArchetypeIds.length > 0) {
        await tx.archetypeMetric.deleteMany({
          where: { archetypeId: { in: existingArchetypeIds.map(a => a.id) } },
        })
      }

      await tx.archetype.deleteMany({ where: { personaId: id } })

      for (const archetype of archetypes) {
        await tx.archetype.create({
          data: {
            name: archetype.name,
            description: archetype.description ?? null,
            emoji: archetype.emoji ?? null,
            color: archetype.color ?? null,
            imageUrl: archetype.imageUrl ?? null,
            order: archetype.order,
            style: archetype.style ?? null,
            icon: archetype.icon ?? null,
            personaId: id,
            metrics: {
              create: archetype.metrics.map(metric => ({
                metricId: metric.metricId,
                targetValue: metric.targetValue,
                relevance: metric.relevance ?? 1,
              })),
            },
          },
        })
      }
    })

    const newArchetypes = await prisma.archetype.findMany({
      where: { personaId: id },
      orderBy: { order: 'asc' },
      include: {
        metrics: {
          orderBy: { metricId: 'asc' },
        },
      },
    })

    return NextResponse.json(newArchetypes)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ error: 'Database validation error', details: error.message }, { status: 400 })
    }
    console.error('Error saving archetypes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
