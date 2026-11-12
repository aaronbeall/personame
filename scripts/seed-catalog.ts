import { parse as parseYaml } from 'yaml'
import 'dotenv/config'
import { readFileSync } from 'node:fs'
import { Prisma, PrismaClient } from '@prisma/client'
import { parseCatalog, compileCatalogQuiz } from '../lib/quiz-catalog'
import type { FullQuiz } from '../lib/personas'
const catalog = parseCatalog(
  parseYaml(readFileSync('content/seed-quizzes.yaml', 'utf8')),
)
const db = new PrismaClient()
const refreshArtwork = process.argv.includes('--refresh-artwork')

function pageData(page: FullQuiz['pages'][number]) {
  return {
    title: page.title,
    description: page.description,
    emoji: page.emoji,
    color: page.color,
    style: page.style,
    order: page.order,
    presentation: page.presentation as Prisma.InputJsonValue,
  }
}

async function refreshSeed(quiz: FullQuiz, creatorId: string) {
  return db.$transaction(async tx => {
    const existing = await tx.persona.findUnique({
      where: { slug: quiz.slug },
      include: {
        dimensions: { orderBy: { order: 'asc' } },
        archetypes: { orderBy: { order: 'asc' } },
        pages: {
          orderBy: { order: 'asc' },
          include: { questions: { orderBy: { order: 'asc' }, include: { answers: { orderBy: { order: 'asc' } } } } },
        },
      },
    })
    if (!existing || existing.creatorId !== creatorId) return false

    const questions = existing.pages.flatMap(page => page.questions)
    const desiredQuestions = quiz.pages.flatMap(page => page.questions)
    const existingContent = existing.pages.filter(page => page.style !== 'cover' && page.style !== 'results')
    const desiredContent = quiz.pages.filter(page => page.style !== 'cover' && page.style !== 'results')
    const cover = existing.pages.find(page => page.style === 'cover')
    const results = existing.pages.find(page => page.style === 'results')
    const sameNames = (saved: { name: string }[], desired: { name: string }[]) =>
      saved.length === desired.length && saved.every((item, index) => item.name === desired[index].name)
    const matchesCatalog = existing.title === quiz.title &&
      sameNames(existing.dimensions, quiz.dimensions) &&
      sameNames(existing.archetypes, quiz.archetypes) &&
      questions.length === desiredQuestions.length &&
      questions.every((question, index) => {
        const desired = desiredQuestions[index]
        return question.text === desired.text && question.type === desired.type &&
          question.answers.length === desired.answers.length &&
          question.answers.every((answer, index) => answer.text === desired.answers[index].text)
      })
    if (!matchesCatalog || !cover || !results || existingContent.length > desiredContent.length) return false

    await tx.persona.update({
      where: { id: existing.id },
      data: { emoji: quiz.emoji, color: quiz.color, style: quiz.style },
    })
    for (const [index, dimension] of quiz.dimensions.entries()) {
      await tx.dimension.update({
        where: { id: existing.dimensions[index].id },
        data: {
          emoji: dimension.emoji, color: dimension.color, style: dimension.style,
          minEmoji: dimension.minEmoji, maxEmoji: dimension.maxEmoji,
        },
      })
    }
    for (const [index, archetype] of quiz.archetypes.entries()) {
      await tx.archetype.update({
        where: { id: existing.archetypes[index].id },
        data: { emoji: archetype.emoji, color: archetype.color, imageUrl: archetype.imageUrl },
      })
    }
    let offset = 0
    for (const page of quiz.pages) {
      const previous = page.style === 'cover' ? cover
        : page.style === 'results' ? results
        : existingContent[page.order - 1]
      const savedPage = previous
        ? await tx.quizPage.update({ where: { id: previous.id }, data: pageData(page) })
        : await tx.quizPage.create({ data: { ...pageData(page), personaId: existing.id } })
      for (const question of page.questions) {
        const saved = questions[offset++]
        await tx.question.update({
          where: { id: saved.id },
          data: { pageId: savedPage.id, order: question.order, emoji: question.emoji, color: question.color ?? null, style: question.style },
        })
        for (const [index, answer] of question.answers.entries()) {
          await tx.answer.update({
            where: { id: saved.answers[index].id },
            data: { emoji: answer.emoji, color: answer.color ?? null, style: answer.style },
          })
        }
      }
    }
    return true
  }, { timeout: 20000 })
}
async function main() {
  const email = process.env.SEED_CREATOR_EMAIL
  if (!email)
    throw new Error(
      'Set SEED_CREATOR_EMAIL to an existing creator account. Publication follows each catalog entry.',
    )
  const user = await db.user.findUniqueOrThrow({ where: { email } })
  for (const definition of catalog.quizzes) {
    const quiz = compileCatalogQuiz(definition)
    if (await db.persona.findUnique({ where: { slug: definition.slug } })) {
      const refreshed = refreshArtwork && await refreshSeed(quiz, user.id)
      console.log(`${refreshed ? 'Refreshed artwork' : 'Skipped existing slug'}: ${definition.slug}`)
      continue
    }
    await db.$transaction(async (tx) => {
      const persona = await tx.persona.create({
        data: {
          title: quiz.title,
          description: quiz.description,
          slug: quiz.slug,
          emoji: definition.emoji,
          color: definition.color,
          style: quiz.style,
          creatorId: user.id,
          status: definition.publication === 'PUBLIC' ? 'PUBLISHED' : 'DRAFT',
          visibility:
            definition.publication === 'PUBLIC' ? 'PUBLIC' : 'PRIVATE',
          publishedAt: definition.publication === 'PUBLIC' ? new Date() : null,
        },
      })
      const ids = new Map<string, string>()
      for (const m of quiz.dimensions) {
        const created = await tx.dimension.create({
          data: {
            personaId: persona.id,
            name: m.name,
            description: m.description,
            emoji: m.emoji,
            minEmoji: m.minEmoji,
            maxEmoji: m.maxEmoji,
            displayScale: m.displayScale,
            color: m.color,
            style: m.style,
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
            color: a.color,
            imageUrl: a.imageUrl,
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
            ...pageData(page),
            questions: {
              create: page.questions.map((q) => ({
                text: q.text,
                emoji: q.emoji,
                color: q.color,
                style: q.style,
                type: q.type,
                required: q.required,
                dimensionInfluences: Object.fromEntries(Object.entries(q.dimensionInfluences as Record<string, number>).map(([key, value]) => [ids.get(key)!, value])),
                order: q.order,
                answers: {
                  create: q.answers.map((a) => ({
                    text: a.text,
                    emoji: a.emoji,
                    color: a.color,
                    style: a.style,
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
    console.log(
      `Created ${definition.publication === 'PUBLIC' ? 'public quiz' : 'private draft'}: ${quiz.title}`,
    )
  }
}
main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
