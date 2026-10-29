import { randomUUID } from 'node:crypto'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { prisma } from './prisma'
import { ownedQuizSelect, quizInclude, WorkflowError } from './personas'
import { dimensionInput, archetypeInput, pagesInput } from './editor-schemas'
import { fieldsChanged, relationshipsChanged, inBatches } from './editor-diff'
import { invalidatePublicQuiz } from './public-cache'

function savedId(id: string | undefined, existing: Set<string>) {
  if (!id || id.startsWith('temp-')) return randomUUID()
  if (!existing.has(id)) throw new WorkflowError('This item does not belong to this quiz. Reload and try again.')
  return id
}
function unique(ids: (string | undefined)[]) {
  const present = ids.filter(Boolean)
  if (new Set(present).size !== present.length) throw new WorkflowError('Duplicate items in this quiz.')
}
export async function saveDimensions(id: string, json: unknown) {
  const { dimensions } = z.object({ dimensions: z.array(dimensionInput).max(30) }).parse(json)
  unique(dimensions.map(item => item.id))
  const quiz = await ownedQuizSelect(id, { dimensions: true })
  const old = new Map(quiz.dimensions.map(item => [item.id, item]))
  const ids = new Set(old.keys())
  const rows = dimensions.map(item => ({ ...item, id: savedId(item.id, ids), personaId: id }))
  const result = await prisma.$transaction(async tx => {
    await inBatches(rows.filter(row => !old.has(row.id)), data => tx.dimension.createMany({ data }))
    for (const row of rows) {
      const previous = old.get(row.id)
      if (previous && fieldsChanged(previous, row)) await tx.dimension.update({ where: { id: row.id }, data: row })
    }
    const removed = [...ids].filter(id => !rows.some(row => row.id === id))
    if (removed.length) await tx.$executeRaw(Prisma.sql`UPDATE "Question" q SET "dimensionInfluences" = q."dimensionInfluences" - ARRAY[${Prisma.join(removed)}]::text[] FROM "QuizPage" p WHERE q."pageId" = p.id AND p."personaId" = ${id}`)
    await tx.dimension.deleteMany({ where: { personaId: id, id: { notIn: rows.map(row => row.id) } } })
    await tx.persona.update({ where: { id }, data: { status: 'DRAFT' } })
    return tx.dimension.findMany({ where: { personaId: id }, orderBy: { order: 'asc' } })
  })
  invalidatePublicQuiz(id)
  return result
}
export async function saveArchetypes(id: string, json: unknown) {
  const { archetypes } = z.object({ archetypes: z.array(archetypeInput).max(50) }).parse(json)
  unique(archetypes.map(item => item.id))
  const quiz = await ownedQuizSelect(id, { dimensions: { select: { id: true } }, archetypes: { include: { dimensions: true } } })
  const dimensionIds = new Set(quiz.dimensions.map(item => item.id))
  const old = new Map(quiz.archetypes.map(item => [item.id, item]))
  const ids = new Set(old.keys())
  const rows = archetypes.map(({ id: candidate, dimensions, ...data }) => {
    unique(dimensions.map(item => item.dimensionId))
    if (dimensions.some(item => !dimensionIds.has(item.dimensionId))) throw new WorkflowError('Use only this quiz’s dimensions.')
    return { data: { ...data, id: savedId(candidate, ids), personaId: id }, dimensions }
  })
  const result = await prisma.$transaction(async tx => {
    await inBatches(rows.filter(row => !old.has(row.data.id)).map(row => row.data), data => tx.archetype.createMany({ data }))
    for (const { data } of rows) {
      const previous = old.get(data.id)
      if (previous && fieldsChanged(previous, data)) await tx.archetype.update({ where: { id: data.id }, data })
    }
    const changed = rows.filter(row => relationshipsChanged(old.get(row.data.id)?.dimensions ?? [], row.dimensions, ['dimensionId', 'targetValue', 'relevance']))
    if (changed.length) {
      await tx.archetypeDimension.deleteMany({ where: { archetypeId: { in: changed.map(row => row.data.id) } } })
      await inBatches(changed.flatMap(row => row.dimensions.map(item => ({ ...item, archetypeId: row.data.id }))), data => tx.archetypeDimension.createMany({ data }))
    }
    await tx.archetype.deleteMany({ where: { personaId: id, id: { notIn: rows.map(row => row.data.id) } } })
    await tx.persona.update({ where: { id }, data: { status: 'DRAFT' } })
    return tx.archetype.findMany({ where: { personaId: id }, orderBy: { order: 'asc' }, include: { dimensions: true } })
  })
  invalidatePublicQuiz(id)
  return result
}
export async function savePages(id: string, json: unknown) {
  const { pages } = pagesInput.parse(json)
  unique(pages.map(p => p.id))
  unique(pages.flatMap(p => p.questions.map(q => q.id)))
  unique(pages.flatMap(p => p.questions.flatMap(q => q.answers.map(a => a.id))))
  const quiz = await ownedQuizSelect(id, { dimensions: { select: { id: true } }, pages: quizInclude.pages })
  const oldPages = new Map(quiz.pages.map(p => [p.id, p]))
  const oldQuestions = new Map(quiz.pages.flatMap(p => p.questions).map(q => [q.id, q]))
  const oldAnswers = new Map([...oldQuestions.values()].flatMap(q => q.answers).map(a => [a.id, a]))
  const pageIds = new Set(oldPages.keys()), questionIds = new Set(oldQuestions.keys()), answerIds = new Set(oldAnswers.keys())
  const dimensionIds = new Set(quiz.dimensions.map(d => d.id))
  const prepared = pages.map(({ id: candidate, questions, ...data }) => {
    const pageId = savedId(candidate, pageIds)
    return { data: { ...data, id: pageId, personaId: id }, questions: questions.map(({ id: candidate, answers, ...data }) => {
      const questionId = savedId(candidate, questionIds)
      if (Object.keys(data.dimensionInfluences).some(key => !dimensionIds.has(key))) throw new WorkflowError('Use only this quiz’s dimensions for question influence.')
      return { data: { ...data, id: questionId, pageId }, answers: answers.map(({ id: candidate, weights, ...data }) => {
        unique(weights.map(w => w.dimensionId))
        if (weights.some(w => !dimensionIds.has(w.dimensionId))) throw new WorkflowError('Use only this quiz’s dimensions.')
        return { data: { ...data, id: savedId(candidate, answerIds), questionId }, weights }
      }) }
    }) }
  })
  const questions = prepared.flatMap(p => p.questions), answers = questions.flatMap(q => q.answers)
  const result = await prisma.$transaction(async tx => {
    await inBatches(prepared.filter(p => !oldPages.has(p.data.id)).map(p => p.data), data => tx.quizPage.createMany({ data }))
    for (const { data } of prepared) { const previous = oldPages.get(data.id); if (previous && fieldsChanged(previous, data)) await tx.quizPage.update({ where: { id: data.id }, data }) }
    await inBatches(questions.filter(q => !oldQuestions.has(q.data.id)).map(q => q.data), data => tx.question.createMany({ data }))
    for (const { data } of questions) { const previous = oldQuestions.get(data.id); if (previous && fieldsChanged(previous, data)) await tx.question.update({ where: { id: data.id }, data }) }
    await inBatches(answers.filter(a => !oldAnswers.has(a.data.id)).map(a => a.data), data => tx.answer.createMany({ data }))
    for (const { data } of answers) { const previous = oldAnswers.get(data.id); if (previous && fieldsChanged(previous, data)) await tx.answer.update({ where: { id: data.id }, data }) }
    const changed = answers.filter(a => relationshipsChanged(oldAnswers.get(a.data.id)?.weights ?? [], a.weights, ['dimensionId', 'value']))
    if (changed.length) {
      await tx.answerWeight.deleteMany({ where: { answerId: { in: changed.map(a => a.data.id) } } })
      await inBatches(changed.flatMap(a => a.weights.map(w => ({ ...w, answerId: a.data.id }))), data => tx.answerWeight.createMany({ data }))
    }
    await tx.answer.deleteMany({ where: { question: { page: { personaId: id } }, id: { notIn: answers.map(a => a.data.id) } } })
    await tx.question.deleteMany({ where: { page: { personaId: id }, id: { notIn: questions.map(q => q.data.id) } } })
    await tx.quizPage.deleteMany({ where: { personaId: id, id: { notIn: prepared.map(p => p.data.id) } } })
    await tx.persona.update({ where: { id }, data: { status: 'DRAFT' } })
    return (await tx.persona.findUniqueOrThrow({ where: { id }, select: { pages: quizInclude.pages } })).pages
  }, { timeout: 20000 })
  invalidatePublicQuiz(id)
  return result
}
