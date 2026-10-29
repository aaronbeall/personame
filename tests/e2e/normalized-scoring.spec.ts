import { randomUUID } from 'node:crypto'
import { test, expect } from './fixtures'

test('Normalized scoring persists influence, exposes close matches and excludes missing evidence', async ({ page, seedQuiz, db }) => {
  const { id, slug } = await seedQuiz()
  const path = `/api/personames/${id}`
  const original = await (await page.request.get(path)).json()
  const [d, other] = original.dimensions
  const questions = [2, 1, 1].map((influence, index) => ({
    id: `temp-measure-${index}`, text: `Measurement ${index + 1}`, type: 'SLIDER', required: index !== 2, dimensionInfluences: { [index === 2 ? other.id : d.id]: influence }, order: index,
    answers: [0, 100].map((value, order) => ({ id: `temp-position-${index}-${order}`, text: order ? 'High' : 'Low', order, weights: [{ dimensionId: index === 2 ? other.id : d.id, value }] })),
  }))
  const pages = original.pages.map((p: { questions: unknown[]; style: string }) => ({ ...p, questions: p.style === null ? questions : [] }))
  const saved = await page.request.post(`${path}/questions`, { data: { pages } })
  expect(saved.ok(), await saved.text()).toBeTruthy()
  const stored = (await saved.json()).flatMap((p: { questions: { id: string; dimensionInfluences: Record<string, number> }[] }) => p.questions)
  expect(stored.map((q: { dimensionInfluences: Record<string, number> }) => Object.values(q.dimensionInfluences)[0])).toEqual([2, 1, 1])
  const archetypes = original.archetypes.slice(0, 2).map((a: { dimensions: { dimensionId: string }[] }, index: number) => ({ ...a, name: index ? 'The upper neighbor' : 'The lower neighbor', dimensions: a.dimensions.map(t => ({ ...t, targetValue: t.dimensionId === d.id ? index ? 70 : 60 : 50, relevance: 1 })) }))
  expect((await page.request.post(`${path}/archetypes`, { data: { archetypes } })).ok()).toBeTruthy()
  expect((await page.request.post(`${path}/publish`)).ok()).toBeTruthy()
  const quiz = await (await page.request.get(`/api/quiz/${slug}`)).json()
  const responses = { [stored[0].id]: { value: 100 }, [stored[1].id]: { value: 0 } }
  const submitted = await page.request.post(`/api/quiz/${slug}/submit`, { data: { responses, revision: quiz.revision, submissionKey: randomUUID() } })
  expect(submitted.ok(), await submitted.text()).toBeTruthy()
  const result = await submitted.json()
  const snapshot = (await (await page.request.get(`/api/quiz/${slug}/results/${result.id}`)).json()).snapshot
  expect(snapshot.scoringVersion).toBe(2)
  expect(snapshot.scores[0].score).toBeCloseTo(200 / 3)
  expect(snapshot.scores[0].evidenceCount).toBe(2)
  expect(snapshot.scores[1].evidenceCount).toBe(0)
  expect(snapshot.archetype.name).toBe('The upper neighbor')
  expect(snapshot.ambiguous).toBe(true)
  expect(await db.dimensionScore.count({ where: { resultId: result.id } })).toBe(1)
  await page.goto(`/quiz/${slug}/results/${result.id}`)
  await expect(page.getByRole('heading', { name: 'A little of both', exact: true })).toBeVisible()
  await expect(page.getByText('Not measured', { exact: true })).toBeVisible()
  await expect(page.getByText(/2 answers used/)).toBeVisible()
  await page.locator('.result-view').screenshot({ path: test.info().outputPath('normalized-result.png') })
  const tied = await page.request.post(`${path}/preview`, { data: { responses: { [stored[0].id]: { value: 75 }, [stored[1].id]: { value: 45 } } } })
  expect(tied.ok(), await tied.text()).toBeTruthy()
  expect((await tied.json()).alternatives[0].tied).toBe(true)
})

test('Dimension influences edit independently, survive no-op saves and are cleaned up on dimension removal', async ({ page, seedQuiz, db }) => {
  const { id } = await seedQuiz()
  const path = `/api/personames/${id}`
  const quiz = await (await page.request.get(path)).json()
  const [first, second] = quiz.dimensions
  const content = quiz.pages.find((p: { questions: unknown[] }) => p.questions.length)
  const question = content.questions[0]
  question.dimensionInfluences = { [first.id]: 3, [second.id]: .5 }
  for (const answer of question.answers) if (!answer.weights.some((w: { dimensionId: string }) => w.dimensionId === second.id)) answer.weights.push({ dimensionId: second.id, value: 50 })
  expect((await page.request.post(`${path}/questions`, { data: { pages: quiz.pages } })).ok()).toBeTruthy()
  const before = await db.question.findUniqueOrThrow({ where: { id: question.id } })
  expect(before.dimensionInfluences).toEqual({ [first.id]: 3, [second.id]: .5 })
  expect((await page.request.post(`${path}/questions`, { data: { pages: quiz.pages } })).ok()).toBeTruthy()
  expect((await db.question.findUniqueOrThrow({ where: { id: question.id } })).updatedAt).toEqual(before.updatedAt)
  await page.goto(`/create/${id}/questions`)
  await page.getByText(content.title, { exact: true }).click()
  await page.getByRole('heading', { name: question.text, exact: true }).click()
  await expect(page.getByRole('spinbutton', { name: `${first.name} influence`, exact: true })).toHaveValue('3')
  await expect(page.getByRole('spinbutton', { name: `${second.name} influence`, exact: true })).toHaveValue('0.5')
  await page.locator('.question-scoring-settings').screenshot({ path: test.info().outputPath('dimension-influences.png') })
  const foreign = structuredClone(quiz.pages)
  foreign.find((p: { questions: unknown[] }) => p.questions.length).questions[0].dimensionInfluences = { foreign: 2 }
  expect((await page.request.post(`${path}/questions`, { data: { pages: foreign } })).status()).toBe(400)
  expect((await page.request.post(`${path}/dimensions`, { data: { dimensions: [first] } })).ok()).toBeTruthy()
  expect((await db.question.findUniqueOrThrow({ where: { id: question.id } })).dimensionInfluences).toEqual({ [first.id]: 3 })
})
