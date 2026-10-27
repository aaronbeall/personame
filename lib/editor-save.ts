import { z } from 'zod'
import { prisma } from './prisma'
import { ownedQuiz, quizInclude, WorkflowError } from './personas'
import { dimensionInput, archetypeInput, pagesInput } from './editor-schemas'

function savedId(id: string | undefined, existing: Set<string>) {
  if (!id || id.startsWith('temp-')) return undefined
  if (!existing.has(id))
    throw new WorkflowError(
      'This item does not belong to this quiz. Reload and try again.'
    )
  return id
}
function unique(ids: (string | undefined)[]) {
  const present = ids.filter(Boolean)
  if (new Set(present).size !== present.length)
    throw new WorkflowError('Duplicate items in this quiz.')
}
export async function saveDimensions(id: string, json: unknown) {
  const quiz = await ownedQuiz(id)
  const { dimensions } = z
    .object({ dimensions: z.array(dimensionInput).max(30) })
    .parse(json)
  unique(dimensions.map((m) => m.id))
  return prisma.$transaction(async (tx) => {
    const keep: string[] = []
    for (const { id: candidate, ...data } of dimensions) {
      const existing = savedId(
        candidate,
        new Set(quiz.dimensions.map((m) => m.id))
      )
      const row = existing
        ? await tx.dimension.update({ where: { id: existing }, data })
        : await tx.dimension.create({ data: { ...data, personaId: id } })
      keep.push(row.id)
    }
    await tx.dimension.deleteMany({
      where: { personaId: id, id: { notIn: keep } }
    })
    await tx.persona.update({ where: { id }, data: { status: 'DRAFT' } })
    return tx.dimension.findMany({
      where: { personaId: id },
      orderBy: { order: 'asc' }
    })
  })
}
export async function saveArchetypes(id: string, json: unknown) {
  const quiz = await ownedQuiz(id)
  const { archetypes } = z
    .object({ archetypes: z.array(archetypeInput).max(50) })
    .parse(json)
  unique(archetypes.map((a) => a.id))
  for (const a of archetypes) {
    unique(a.dimensions.map((m) => m.dimensionId))
    if (
      a.dimensions.some(
        (m) => !quiz.dimensions.some((owned) => owned.id === m.dimensionId)
      )
    )
      throw new WorkflowError('Use only this quiz’s dimensions.')
  }
  return prisma.$transaction(async (tx) => {
    const keep: string[] = []
    for (const { id: candidate, dimensions, ...data } of archetypes) {
      const existing = savedId(
        candidate,
        new Set(quiz.archetypes.map((a) => a.id))
      )
      const row = existing
        ? await tx.archetype.update({ where: { id: existing }, data })
        : await tx.archetype.create({ data: { ...data, personaId: id } })
      keep.push(row.id)
      await tx.archetypeDimension.deleteMany({ where: { archetypeId: row.id } })
      await tx.archetypeDimension.createMany({
        data: dimensions.map((m) => ({ ...m, archetypeId: row.id }))
      })
    }
    await tx.archetype.deleteMany({
      where: { personaId: id, id: { notIn: keep } }
    })
    await tx.persona.update({ where: { id }, data: { status: 'DRAFT' } })
    return tx.archetype.findMany({
      where: { personaId: id },
      orderBy: { order: 'asc' },
      include: { dimensions: true }
    })
  })
}
export async function savePages(id: string, json: unknown) {
  const quiz = await ownedQuiz(id)
  const { pages } = pagesInput.parse(json)
  const oldQuestions = quiz.pages.flatMap((p) => p.questions)
  const oldAnswers = oldQuestions.flatMap((q) => q.answers)
  unique(pages.map((p) => p.id))
  unique(pages.flatMap((p) => p.questions.map((q) => q.id)))
  unique(
    pages.flatMap((p) => p.questions.flatMap((q) => q.answers.map((a) => a.id)))
  )
  for (const p of pages)
    for (const q of p.questions)
      for (const a of q.answers) {
        unique(a.weights.map((w) => w.dimensionId))
        if (
          a.weights.some((w) => !quiz.dimensions.some((m) => m.id === w.dimensionId))
        )
          throw new WorkflowError('Use only this quiz’s dimensions.')
      }
  return prisma.$transaction(
    async (tx) => {
      const keepPages: string[] = [],
        keepQuestions: string[] = [],
        keepAnswers: string[] = []
      for (const { id: candidate, questions, ...data } of pages) {
        const existing = savedId(
          candidate,
          new Set(quiz.pages.map((p) => p.id))
        )
        const page = existing
          ? await tx.quizPage.update({ where: { id: existing }, data })
          : await tx.quizPage.create({ data: { ...data, personaId: id } })
        keepPages.push(page.id)
        for (const { id: qid, answers, ...qd } of questions) {
          const old = savedId(qid, new Set(oldQuestions.map((q) => q.id)))
          const question = old
            ? await tx.question.update({
                where: { id: old },
                data: { ...qd, pageId: page.id }
              })
            : await tx.question.create({ data: { ...qd, pageId: page.id } })
          keepQuestions.push(question.id)
          for (const { id: aid, weights, ...ad } of answers) {
            const previous = savedId(aid, new Set(oldAnswers.map((a) => a.id)))
            const answer = previous
              ? await tx.answer.update({
                  where: { id: previous },
                  data: { ...ad, questionId: question.id }
                })
              : await tx.answer.create({
                  data: { ...ad, questionId: question.id }
                })
            keepAnswers.push(answer.id)
            await tx.answerWeight.deleteMany({ where: { answerId: answer.id } })
            await tx.answerWeight.createMany({
              data: weights.map((w) => ({ ...w, answerId: answer.id }))
            })
          }
        }
      }
      await tx.answer.deleteMany({
        where: {
          question: { page: { personaId: id } },
          id: { notIn: keepAnswers }
        }
      })
      await tx.question.deleteMany({
        where: { page: { personaId: id }, id: { notIn: keepQuestions } }
      })
      await tx.quizPage.deleteMany({
        where: { personaId: id, id: { notIn: keepPages } }
      })
      await tx.persona.update({ where: { id }, data: { status: 'DRAFT' } })
      return (
        await tx.persona.findUniqueOrThrow({
          where: { id },
          include: quizInclude
        })
      ).pages
    },
    { timeout: 20000 }
  )
}
