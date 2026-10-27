import 'dotenv/config'
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { PrismaClient } from '@prisma/client'

test(
  'hex migration preserves palette colors, custom colors and historical result artwork',
  { skip: !process.env.PERSONAME_TEST_URL },
  async () => {
    assert.ok(
      ['localhost', '127.0.0.1'].includes(
        new URL(process.env.DATABASE_URL!).hostname,
      ),
    )
    const db = new PrismaClient()
    const schema = `color_test_${randomUUID().replaceAll('-', '')}`
    try {
      await db.$transaction(
        async (tx) => {
          await tx.$executeRawUnsafe(`CREATE SCHEMA "${schema}"`)
          await tx.$executeRawUnsafe(`SET LOCAL search_path TO "${schema}"`)
          for (const table of [
            'Persona',
            'Dimension',
            'Archetype',
            'QuizPage',
            'Question',
            'Answer',
          ]) {
            await tx.$executeRawUnsafe(
              `CREATE TABLE "${table}" (id TEXT PRIMARY KEY, color TEXT)`,
            )
            await tx.$executeRawUnsafe(
              `INSERT INTO "${table}" (id, color) VALUES ('palette', 'purple'), ('custom', '#123456'), ('short', '#ABC'), ('upper', '#AABBCC'), ('null', NULL), ('blank', '')`,
            )
          }
          await tx.$executeRawUnsafe(
            'CREATE TABLE "QuizResult" (id TEXT PRIMARY KEY, snapshot JSONB)',
          )
          const original = {
            quizTitle: 'Purple rain',
            archetype: { name: 'Purple', color: 'purple' },
            scores: [{ score: 80 }],
          }
          await tx.$executeRaw`INSERT INTO "QuizResult" (id,snapshot) VALUES ('r',${JSON.stringify(original)}::jsonb), ('null',NULL), ('no-color','{"archetype":{"name":"No color"}}'::jsonb), ('custom','{"archetype":{"color":"#ABC"}}'::jsonb)`
          const sql = readFileSync(
            'prisma/migrations/20261027030000_store_hex_colors/migration.sql',
            'utf8',
          )
          for (const statement of sql
            .replace(/^--.*$/gm, '')
            .split(';')
            .map((s) => s.trim())
            .filter(Boolean)) {
            if (!['BEGIN', 'COMMIT'].includes(statement))
              await tx.$executeRawUnsafe(statement)
          }
          for (const table of [
            'Persona',
            'Dimension',
            'Archetype',
            'QuizPage',
            'Question',
            'Answer',
          ]) {
            assert.deepEqual(
              await tx.$queryRawUnsafe(
                `SELECT id,color FROM "${table}" ORDER BY id`,
              ),
              [
                { id: 'blank', color: null },
                { id: 'custom', color: '#123456' },
                { id: 'null', color: null },
                { id: 'palette', color: '#8b5cf6' },
                { id: 'short', color: '#aabbcc' },
                { id: 'upper', color: '#aabbcc' },
              ],
            )
          }
          assert.deepEqual(
            await tx.$queryRaw`SELECT id,snapshot FROM "QuizResult" ORDER BY id`,
            [
              { id: 'custom', snapshot: { archetype: { color: '#aabbcc' } } },
              { id: 'no-color', snapshot: { archetype: { name: 'No color' } } },
              { id: 'null', snapshot: null },
              {
                id: 'r',
                snapshot: {
                  ...original,
                  archetype: { ...original.archetype, color: '#8b5cf6' },
                },
              },
            ],
          )
          const checks = await tx.$queryRaw<
            { constraint_name: string }[]
          >`SELECT constraint_name FROM information_schema.table_constraints WHERE constraint_schema = ${schema} AND constraint_type = 'CHECK' AND constraint_name LIKE '%color_hex_check'`
          assert.equal(checks.length, 6)
          await tx.$executeRawUnsafe(`DROP SCHEMA "${schema}" CASCADE`)
        },
        { timeout: 30000 },
      )
    } finally {
      await db.$disconnect()
    }
  },
)
