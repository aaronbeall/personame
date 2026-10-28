import 'dotenv/config'
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { PrismaClient } from '@prisma/client'

test(
  'theme list migration preserves solids and supports extensible ordered lists on every color field',
  { skip: !process.env.PERSONAME_TEST_URL },
  async () => {
    assert.ok(
      ['localhost', '127.0.0.1'].includes(
        new URL(process.env.DATABASE_URL!).hostname,
      ),
    )
    const db = new PrismaClient()
    const schema = `theme_test_${randomUUID().replaceAll('-', '')}`
    try {
      await db.$transaction(
        async (tx) => {
          await tx.$executeRawUnsafe(`CREATE SCHEMA "${schema}"`)
          await tx.$executeRawUnsafe(`SET LOCAL search_path TO "${schema}"`)
          const tables = [
            'Persona',
            'Dimension',
            'Archetype',
            'QuizPage',
            'Question',
            'Answer',
          ]
          for (const table of tables) {
            await tx.$executeRawUnsafe(
              `CREATE TABLE "${table}" (id TEXT PRIMARY KEY, color TEXT, CONSTRAINT "${table}_color_hex_check" CHECK (color IS NULL OR color ~ '^#[0-9a-f]{6}$'))`,
            )
            await tx.$executeRawUnsafe(
              `INSERT INTO "${table}" VALUES ('solid','#123456'), ('null',NULL)`,
            )
          }
          const sql = readFileSync(
            'prisma/migrations/20261027040000_color_theme_lists/migration.sql',
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
          for (const table of tables) {
            await tx.$executeRawUnsafe(
              `INSERT INTO "${table}" VALUES ('pair','#2563eb,#7c3aed'), ('future','#123456,#abcdef,#987654')`,
            )
            assert.deepEqual(
              await tx.$queryRawUnsafe(
                `SELECT id,color FROM "${table}" ORDER BY id`,
              ),
              [
                { id: 'future', color: '#123456,#abcdef,#987654' },
                { id: 'null', color: null },
                { id: 'pair', color: '#2563eb,#7c3aed' },
                { id: 'solid', color: '#123456' },
              ],
            )
            await tx.$executeRawUnsafe('SAVEPOINT invalid_theme')
            await assert.rejects(
              tx.$executeRawUnsafe(
                `INSERT INTO "${table}" VALUES ('invalid','#123456,not-a-color')`,
              ),
            )
            await tx.$executeRawUnsafe('ROLLBACK TO SAVEPOINT invalid_theme')
          }
          await tx.$executeRawUnsafe(`DROP SCHEMA "${schema}" CASCADE`)
        },
        { timeout: 30000 },
      )
    } finally {
      await db.$disconnect()
    }
  },
)
