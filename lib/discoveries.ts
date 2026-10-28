import { Prisma } from '@prisma/client'
import { prisma } from './prisma'
import type { ResultSnapshot } from './quiz-scoring'

export type Discovery = {
  id: string; completedAt: Date; archetype: ResultSnapshot['archetype'] | null; canViewResult: boolean
  persona: { id: string; title: string; description: string | null; slug: string; emoji: string | null; color: string | null; visibility: string }
}
/** Deduplicate BEFORE search/pagination; retakes never replace latest results with older matches. */
export async function discoveryPage(userId: string, search: string, skip: number, limit: number) {
  const latest = Prisma.sql`WITH latest AS (
    SELECT DISTINCT ON ("personaId") id, "personaId", "completedAt"
    FROM "QuizResult" WHERE "userId" = ${userId}
    ORDER BY "personaId", "completedAt" DESC, id DESC
  )`
  const from = Prisma.sql`FROM latest l JOIN "QuizResult" r ON r.id = l.id JOIN "Persona" p ON p.id = l."personaId"`
  // strpos gives literal substring matching: user '%' and '_' are not SQL wildcards.
  const filter = Prisma.sql`WHERE strpos(lower(concat_ws(' ', p.title, p.description, r.snapshot->'archetype'->>'name', r.snapshot->'archetype'->>'description')), lower(${search})) > 0 OR ${search} = ''`
  const [items, counts] = await Promise.all([
    prisma.$queryRaw<Discovery[]>(Prisma.sql`${latest} SELECT r.id, r."completedAt", r.snapshot->'archetype' AS archetype,
      (r.snapshot IS NOT NULL AND r.snapshot <> 'null'::jsonb AND p.visibility = 'PUBLIC') AS "canViewResult",
      json_build_object('id',p.id,'title',p.title,'description',p.description,'slug',p.slug,'emoji',p.emoji,'color',p.color,'visibility',p.visibility) AS persona
      ${from} ${filter} ORDER BY l."completedAt" DESC, l.id DESC LIMIT ${limit} OFFSET ${skip}`),
    prisma.$queryRaw<{ count: bigint; collectionTotal: bigint }[]>(Prisma.sql`${latest} SELECT COUNT(*) AS count, (SELECT COUNT(*) FROM latest) AS "collectionTotal" ${from} ${filter}`),
  ])
  return { items, total: Number(counts[0].count), collectionTotal: Number(counts[0].collectionTotal) }
}
