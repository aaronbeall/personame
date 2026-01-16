import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma, Metric } from '@prisma/client'
import { z } from 'zod'
import { ZodPrismaSchema } from '@/lib/zod-prisma'

// Zod schema constrained by Prisma model types (subset used by the API)
// NOTE: We intentionally exclude 'id', 'personaId', and timestamps from the body schema.
// All present keys are required to exist in the shape, and their Zod output types
// must match the Prisma model types exactly.
const metricSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  minLabel: z.string().optional(),
  maxLabel: z.string().optional(),
  emoji: z.string().optional(),
  color: z.string().optional(),
  order: z.number(),
  style: z.string().optional(),
  icon: z.string().optional(),
} satisfies ZodPrismaSchema<Omit<Metric, 'id' | 'personaId' | 'createdAt' | 'updatedAt'>>)

const metricsSchema = z.object({
  metrics: z.array(metricSchema),
})

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const metrics = await prisma.metric.findMany({
      where: { personaId: id },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Error fetching metrics:', error)
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
    const { metrics } = metricsSchema.parse(json)

    // Delete existing metrics and create new ones
    await prisma.metric.deleteMany({
      where: { personaId: id },
    })

    await prisma.metric.createMany({
      data: metrics.map(m => ({
        name: m.name,
        description: m.description || null,
        minLabel: m.minLabel || null,
        maxLabel: m.maxLabel || null,
        emoji: m.emoji || null,
        color: m.color || null,
        order: m.order,
        personaId: id,
      })),
    })

    const newMetrics = await prisma.metric.findMany({
      where: { personaId: id },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json(newMetrics)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ error: 'Database validation error', details: error.message }, { status: 400 })
    }
    console.error('Error saving metrics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
