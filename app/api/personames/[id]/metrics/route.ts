import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const metricSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  minLabel: z.string().optional(),
  maxLabel: z.string().optional(),
  order: z.number(),
})

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
      where: { personameId: id },
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
      where: { personameId: id },
    })

    await prisma.metric.createMany({
      data: metrics.map(m => ({
        name: m.name,
        description: m.description || null,
        minLabel: m.minLabel || null,
        maxLabel: m.maxLabel || null,
        order: m.order,
        personameId: id,
      })),
    })

    const newMetrics = await prisma.metric.findMany({
      where: { personameId: id },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json(newMetrics)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error saving metrics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
