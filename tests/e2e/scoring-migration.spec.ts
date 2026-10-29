import { readFileSync } from 'node:fs'
import { test, expect } from './fixtures'

test('Normalized scoring migration converts legacy signals and preserves historic snapshots', async ({ db }) => {
  const dimensionMigration = readFileSync('prisma/migrations/20261029010000_question_dimension_influence/migration.sql', 'utf8')
  const migration = readFileSync('prisma/migrations/20261029000000_normalized_question_scoring/migration.sql', 'utf8')
  // Transaction-local temporary tables shadow the app tables; no user data is touched.
  await db.$transaction(async tx => {
    for (const statement of [
      'CREATE TEMP TABLE "Question" (id text PRIMARY KEY, type text) ON COMMIT DROP',
      'CREATE TEMP TABLE "Answer" (id text PRIMARY KEY, "questionId" text, "order" int) ON COMMIT DROP',
      'CREATE TEMP TABLE "AnswerWeight" (id text PRIMARY KEY, value double precision, "answerId" text, "dimensionId" text, "createdAt" timestamp, "updatedAt" timestamp) ON COMMIT DROP',
      'CREATE TEMP TABLE "Persona" ("updatedAt" timestamp) ON COMMIT DROP',
      'CREATE TEMP TABLE "QuizResult" (snapshot jsonb) ON COMMIT DROP',
      `INSERT INTO "Question" VALUES ('choice','MULTIPLE_CHOICE'),('scale','SCALE'),('unused','MULTIPLE_CHOICE')`,
      `INSERT INTO "Answer" VALUES ('a','choice',0),('b','choice',1),('l','scale',0),('h','scale',1),('p','scale',2),('u','unused',0)`,
      `INSERT INTO "AnswerWeight" (id,value,"answerId","dimensionId") VALUES ('1',-20,'a','d'),('2',20,'b','d'),('3',0,'a','unrelated'),('4',0,'b','unrelated'),('5',10,'a','partial'),('6',-10,'l','d'),('7',10,'h','d'),('8',999,'p','d'),('9',0,'u','d')`,
      `INSERT INTO "QuizResult" VALUES ('{"scores":[{"score":95}],"archetype":{"name":"Historic self"}}')`,
    ]) await tx.$executeRawUnsafe(statement)
    for (const statement of migration.replace(/--[^\n]*/g, '').split(';').map(s => s.trim()).filter(s => s && s !== 'BEGIN' && s !== 'COMMIT')) await tx.$executeRawUnsafe(statement)
    const rows = await tx.$queryRawUnsafe<{ answerId: string; dimensionId: string; value: number }[]>('SELECT "answerId", "dimensionId", value FROM "AnswerWeight" ORDER BY "answerId", "dimensionId"')
    expect(rows).toEqual([
      { answerId: 'a', dimensionId: 'd', value: 0 }, { answerId: 'a', dimensionId: 'partial', value: 75 },
      { answerId: 'b', dimensionId: 'd', value: 100 }, { answerId: 'b', dimensionId: 'partial', value: 50 },
      { answerId: 'h', dimensionId: 'd', value: 100 }, { answerId: 'l', dimensionId: 'd', value: 0 },
    ])
    const influences = await tx.$queryRawUnsafe<{ id: string; influence: number }[]>('SELECT id,influence FROM "Question" ORDER BY id')
    expect(influences).toEqual([{ id: 'choice', influence: 20 }, { id: 'scale', influence: 10 }, { id: 'unused', influence: 1 }])
    for (const statement of dimensionMigration.replace(/--[^\n]*/g, '').split(';').map(s => s.trim()).filter(s => s && s !== 'BEGIN' && s !== 'COMMIT')) await tx.$executeRawUnsafe(statement)
    const mapped = await tx.$queryRawUnsafe<{ id: string; dimensionInfluences: unknown }[]>('SELECT id,"dimensionInfluences" FROM "Question" ORDER BY id')
    expect(mapped).toEqual([{ id: 'choice', dimensionInfluences: { d: 20, partial: 20 } }, { id: 'scale', dimensionInfluences: { d: 10 } }, { id: 'unused', dimensionInfluences: {} }])
    const results = await tx.$queryRawUnsafe<{ snapshot: unknown }[]>('SELECT snapshot FROM "QuizResult"')
    expect(results[0].snapshot).toEqual({ scores: [{ score: 95 }], archetype: { name: 'Historic self' } })
  })
})
