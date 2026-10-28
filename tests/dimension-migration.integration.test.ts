import 'dotenv/config'
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { readFileSync, readdirSync } from 'node:fs'
import { PrismaClient } from '@prisma/client'

// Replay the real migration history against populated tables in a disposable schema.
test(
  'dimension rename preserves records, constraints, enums, and historical snapshots',
  {
    skip: !process.env.PERSONAME_TEST_URL,
  },
  async () => {
    assert.ok(
      ['localhost', '127.0.0.1'].includes(
        new URL(process.env.DATABASE_URL!).hostname,
      ),
    )
    const db = new PrismaClient()
    const schema = `rename_test_${randomUUID().replaceAll('-', '')}`
    const root = 'prisma/migrations'
    const target = '20261027020000_rename_metric_to_dimension'
    const oldSnapshot = {
      quizTitle: 'A metric in a title stays unchanged',
      scores: [
        {
          metricId: 'm',
          metricName: 'Curiosity',
          score: 80,
          minEmoji: '🌱',
          maxEmoji: '🚀',
          extra: 'preserved',
        },
        { metricId: 'n', metricName: 'Company', score: 20 },
      ],
      extra: { untouched: true },
    }
    try {
      await db.$transaction(
        async (tx) => {
          await tx.$executeRawUnsafe(`CREATE SCHEMA "${schema}"`)
          await tx.$executeRawUnsafe(`SET LOCAL search_path TO "${schema}"`)
          const execute = async (folder: string) => {
            const sql = readFileSync(`${root}/${folder}/migration.sql`, 'utf8')
            for (const statement of sql
              .replace(/^--.*$/gm, '')
              .split(';')
              .map((s) => s.trim())
              .filter(Boolean)) {
              if (!['BEGIN', 'COMMIT'].includes(statement))
                await tx.$executeRawUnsafe(statement)
            }
          }
          for (const folder of readdirSync(root)
            .filter((f) => f < target && f !== 'migration_lock.toml')
            .sort())
            await execute(folder)
          const inserts = [
            `INSERT INTO "User" (id, "updatedAt") VALUES ('u', NOW())`,
            `INSERT INTO "Persona" (id, title, slug, "creatorId", "updatedAt") VALUES ('p', 'Quiz', 'quiz', 'u', NOW())`,
            `INSERT INTO "Metric" (id, name, "personaId", "minEmoji", "maxEmoji", "displayScale", "updatedAt") VALUES ('m', 'Curiosity', 'p', '🌱', '🚀', 'BIPOLAR', NOW())`,
            `INSERT INTO "Archetype" (id, name, "personaId", "updatedAt") VALUES ('a', 'Explorer', 'p', NOW())`,
            `INSERT INTO "ArchetypeMetric" (id, "targetValue", relevance, "archetypeId", "metricId", "updatedAt") VALUES ('am', 80, 0.7, 'a', 'm', NOW())`,
            `INSERT INTO "QuizPage" (id, "personaId", "updatedAt") VALUES ('page', 'p', NOW())`,
            `INSERT INTO "Question" (id, text, type, "pageId", "updatedAt") VALUES ('q', 'Explore?', 'MULTIPLE_CHOICE', 'page', NOW())`,
            `INSERT INTO "Answer" (id, text, "questionId", "updatedAt") VALUES ('ans', 'Yes', 'q', NOW())`,
            `INSERT INTO "AnswerWeight" (id, value, "answerId", "metricId", "updatedAt") VALUES ('w', 30, 'ans', 'm', NOW())`,
            `INSERT INTO "QuizResult" (id, "personaId", "archetypeId") VALUES ('r', 'p', 'a'), ('empty', 'p', 'a'), ('no-snapshot', 'p', 'a')`,
            `INSERT INTO "MetricScore" (id, score, "resultId", "metricName") VALUES ('score', 80, 'r', 'Curiosity')`,
            `INSERT INTO "UserAnswer" (id, "resultId", "answerId") VALUES ('ua', 'r', 'ans')`,
          ]
          for (const sql of inserts) await tx.$executeRawUnsafe(sql)
          await tx.$executeRaw`UPDATE "QuizResult" SET snapshot = ${JSON.stringify(oldSnapshot)}::jsonb WHERE id = 'r'`
          await tx.$executeRaw`UPDATE "QuizResult" SET snapshot = '{"scores":[]}'::jsonb WHERE id = 'empty'`
          await execute(target)
          const [dimension] = await tx.$queryRaw<
            {
              id: string
              minEmoji: string
              maxEmoji: string
              displayScale: string
            }[]
          >`SELECT * FROM "Dimension" WHERE id = 'm'`
          assert.equal(dimension.id, 'm')
          assert.equal(dimension.minEmoji, '🌱')
          assert.equal(dimension.maxEmoji, '🚀')
          assert.equal(dimension.displayScale, 'BIPOLAR')
          assert.deepEqual(
            await tx.$queryRaw`SELECT id, "dimensionId", "targetValue", relevance FROM "ArchetypeDimension"`,
            [{ id: 'am', dimensionId: 'm', targetValue: 80, relevance: 0.7 }],
          )
          assert.deepEqual(
            await tx.$queryRaw`SELECT id, "dimensionId", value FROM "AnswerWeight"`,
            [{ id: 'w', dimensionId: 'm', value: 30 }],
          )
          assert.deepEqual(
            await tx.$queryRaw`SELECT id, "dimensionName", score FROM "DimensionScore"`,
            [{ id: 'score', dimensionName: 'Curiosity', score: 80 }],
          )
          const results = await tx.$queryRaw<
            { id: string; snapshot: unknown }[]
          >`SELECT id, snapshot FROM "QuizResult" ORDER BY id`
          assert.deepEqual(results, [
            { id: 'empty', snapshot: { scores: [] } },
            { id: 'no-snapshot', snapshot: null },
            {
              id: 'r',
              snapshot: {
                ...oldSnapshot,
                scores: oldSnapshot.scores.map(
                  ({ metricId, metricName, ...rest }) => ({
                    ...rest,
                    dimensionId: metricId,
                    dimensionName: metricName,
                  }),
                ),
              },
            },
          ])
          assert.deepEqual(
            await tx.$queryRaw`SELECT id, "resultId", "answerId" FROM "UserAnswer"`,
            [{ id: 'ua', resultId: 'r', answerId: 'ans' }],
          )
          // Every renamed index and constraint is reflected in the database catalog.
          const names = await tx.$queryRaw<
            { name: string }[]
          >`SELECT indexname AS name FROM pg_indexes WHERE schemaname = ${schema} UNION ALL SELECT constraint_name AS name FROM information_schema.table_constraints WHERE constraint_schema = ${schema}`
          assert.equal(
            names.some((n) => /metric/i.test(n.name)),
            false,
          )
          // A foreign-key reference resolves to the renamed table, with the same values.
          assert.deepEqual(
            await tx.$queryRaw`SELECT d.id FROM "AnswerWeight" w JOIN "Dimension" d ON d.id = w."dimensionId"`,
            [{ id: 'm' }],
          )
          await tx.$executeRawUnsafe(`DROP SCHEMA "${schema}" CASCADE`)
        },
        { timeout: 30000 },
      )
    } finally {
      await db.$disconnect()
    }
  },
)
