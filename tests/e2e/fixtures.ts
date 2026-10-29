import { parse as parseYaml } from 'yaml'
import 'dotenv/config'
import { test as base, expect } from '@playwright/test'
import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { parseCatalog, compileCatalogQuiz } from '../../lib/quiz-catalog'
export const test = base.extend<{
  account: { id: string }
  db: PrismaClient
  seedQuiz: () => Promise<{ id: string; slug: string }>
}>({
  db: async ({}, provide) => {
    const hostname = new URL(process.env.DATABASE_URL!).hostname
    if (!['localhost', '127.0.0.1'].includes(hostname))
      throw new Error(
        'E2E fixtures require a local database; refusing to write to a remote database',
      )
    const db = new PrismaClient()
    try {
      await provide(db)
    } finally {
      await db.$disconnect()
    }
  },
  account: async ({ db, context, baseURL }, provide) => {
    if (!baseURL || new URL(baseURL).port !== '3100')
      throw new Error('E2E fixtures require the isolated localhost:3100 server')
    const user = await db.user.create({
      data: {
        name: 'Browser Test Creator',
        email: `e2e-${randomUUID()}@example.test`,
      },
    })
    try {
      const token = randomUUID()
      await db.session.create({
        data: {
          userId: user.id,
          sessionToken: token,
          expires: new Date(Date.now() + 3600000),
        },
      })
      // Use the real database session strategy; no test-only authentication endpoint.
      await context.addCookies([
        {
          name: 'next-auth.session-token',
          value: token,
          url: baseURL,
          httpOnly: true,
          sameSite: 'Lax',
        },
      ])
      await provide({ id: user.id })
    } finally {
      await db.user.delete({ where: { id: user.id } })
    }
  },
  seedQuiz: async ({ account, context }, provide) => {
    const request = context.request
    await provide(async () => {
      const definition = parseCatalog(
        parseYaml(readFileSync('content/seed-quizzes.yaml', 'utf8')),
      ).quizzes[0]
      const quiz = compileCatalogQuiz(definition)
      const created = await request.post('/api/personames', {
        data: {
          title: `Browser fixture ${randomUUID().slice(0, 8)}`,
          description: definition.description,
        },
      })
      expect(created.ok()).toBeTruthy()
      const { id, slug } = await created.json()
      const path = `/api/personames/${id}`
      const saved = await request.post(`${path}/dimensions`, {
        data: {
          dimensions: quiz.dimensions.map((m) => ({
            ...m,
            id: `temp-${m.id}`,
          })),
        },
      })
      expect(saved.ok()).toBeTruthy()
      const dimensions = (await saved.json()) as { id: string }[]
      const remap = new Map(
        quiz.dimensions.map((m, i) => [m.id, dimensions[i].id]),
      )
      expect(
        (
          await request.post(`${path}/archetypes`, {
            data: {
              archetypes: quiz.archetypes.map((a) => ({
                ...a,
                id: `temp-${a.id}`,
                dimensions: a.dimensions.map((m) => ({
                  ...m,
                  dimensionId: remap.get(m.dimensionId),
                })),
              })),
            },
          })
        ).ok(),
      ).toBeTruthy()
      expect(
        (
          await request.post(`${path}/questions`, {
            data: {
              pages: quiz.pages.map((p) => ({
                ...p,
                id: `temp-${p.id}`,
                questions: p.questions.map((q) => ({
                  ...q,
                  dimensionInfluences: Object.fromEntries(Object.entries(q.dimensionInfluences as Record<string, number>).map(([key, value]) => [remap.get(key)!, value])),
                  id: `temp-${q.id}`,
                  answers: q.answers.map((a) => ({
                    ...a,
                    id: `temp-${a.id}`,
                    weights: a.weights.map((w) => ({
                      ...w,
                      dimensionId: remap.get(w.dimensionId),
                    })),
                  })),
                })),
              })),
            },
          })
        ).ok(),
      ).toBeTruthy()
      // Referencing the owner here makes fixture ownership explicit for cleanup.
      expect(account.id).toBeTruthy()
      return { id, slug }
    })
  },
})
export { expect }
