import { NextResponse } from 'next/server'
import { currentUser, apiError } from '@/lib/personas'
import { prisma } from '@/lib/prisma'
import { getQuizComposition } from '@/lib/quiz-composition'
import { readinessSelect } from '@/lib/quiz-projections'
import { listParameters } from '@/lib/pagination'
import type { Prisma } from '@prisma/client'
export async function GET(request: Request) {
  try {
    const { page, limit, skip, search, status } = listParameters(request)
    const user = await currentUser()
    const term = search.replace(/[\\%_]/g, '\\$&')
    const where: Prisma.PersonaWhereInput = {
      creatorId: user.id,
      ...(status ? { status: status === 'DRAFT' ? 'DRAFT' : { in: ['PUBLISHED', 'CLOSED'] } } : {}),
      ...(search ? { OR: [{ title: { contains: term, mode: 'insensitive' } }, { description: { contains: term, mode: 'insensitive' } }] } : {}),
    }
    const [quizzes, total, groups] = await Promise.all([
      prisma.persona.findMany({ where, orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }], skip, take: limit,
        select: { ...readinessSelect, description: true, slug: true, visibility: true, color: true, emoji: true,
          completions: true, updatedAt: true, _count: { select: { dimensions: true, archetypes: true, pages: true } } },
      }),
      prisma.persona.count({ where }),
      prisma.persona.groupBy({ by: ['status'], where: { creatorId: user.id }, _count: true }),
    ])
    const count = (status: string) => groups.find(group => group.status === status)?._count ?? 0
    const items = quizzes.map(q => ({
      id: q.id, title: q.title, description: q.description, slug: q.slug, status: q.status,
      visibility: q.visibility, color: q.color, emoji: q.emoji, completions: q.completions,
      updatedAt: q.updatedAt, _count: q._count, composition: getQuizComposition(q),
    }))
    return NextResponse.json({ items, total, page, hasMore: skip + items.length < total, counts: { DRAFT: count('DRAFT'), PUBLISHED: count('PUBLISHED') + count('CLOSED') } })
  } catch (error) { return apiError(error) }
}
