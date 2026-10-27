import 'dotenv/config'
import { readFileSync } from 'node:fs'
import { PrismaClient } from '@prisma/client'
import { parseCatalog, compileCatalogQuiz } from '../lib/quiz-catalog'
const catalog = parseCatalog(
  JSON.parse(readFileSync('content/seed-quizzes.json', 'utf8')),
)
const db = new PrismaClient()
async function main() {
  const email = process.env.SEED_CREATOR_EMAIL
  if (!email)
    throw new Error(
      'Set SEED_CREATOR_EMAIL to an existing creator account. Quizzes are imported as private drafts.',
    )
  const user = await db.user.findUniqueOrThrow({ where: { email } })
  for (const definition of catalog.quizzes) {
    if (await db.persona.findUnique({ where: { slug: definition.slug } })) {
      console.log(`Skipped existing slug: ${definition.slug}`)
      continue
    }
    const quiz = compileCatalogQuiz(definition)
    await db.$transaction(async (tx) => {
      const persona = await tx.persona.create({
        data: {
          title: quiz.title,
          description: quiz.description,
          slug: quiz.slug,
          emoji: definition.emoji,
          creatorId: user.id,
        },
      })
      const ids = new Map<string, string>()
      for (const m of quiz.dimensions) {
        const created = await tx.dimension.create({
          data: {
            personaId: persona.id,
            name: m.name,
            minLabel: m.minLabel,
            maxLabel: m.maxLabel,
            order: m.order,
          },
        })
        ids.set(m.id, created.id)
      }
      for (const a of quiz.archetypes)
        await tx.archetype.create({
          data: {
            personaId: persona.id,
            name: a.name,
            description: a.description,
            emoji: a.emoji,
            order: a.order,
            dimensions: {
              create: a.dimensions.map((m) => ({
                dimensionId: ids.get(m.dimensionId)!,
                targetValue: m.targetValue,
                relevance: m.relevance,
              })),
            },
          },
        })
      for (const page of quiz.pages)
        await tx.quizPage.create({
          data: {
            personaId: persona.id,
            title: page.title,
            description: page.description,
            style: page.style,
            order: page.order,
            questions: {
              create: page.questions.map((q) => ({
                text: q.text,
                type: q.type,
                required: q.required,
                order: q.order,
                answers: {
                  create: q.answers.map((a) => ({
                    text: a.text,
                    order: a.order,
                    weights: {
                      create: a.weights.map((w) => ({
                        dimensionId: ids.get(w.dimensionId)!,
                        value: w.value,
                      })),
                    },
                  })),
                },
              })),
            },
          },
        })
    })
    console.log(`Created private draft: ${quiz.title}`)
  }
}
main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
