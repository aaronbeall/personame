import { test, expect } from './fixtures'
import type { FullQuiz } from '../../lib/personas'

test('Question space computes in a worker and exposes scoring flow, coverage and outcomes', async ({ page, seedQuiz }) => {
  const { id } = await seedQuiz()
  const quiz = await (await page.request.get(`/api/personames/${id}`)).json()
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto(`/create/${id}/preview?tab=analyze`)
  const card = page.getByRole('region', { name: 'Your question space', exact: true })
  await expect(card.getByRole('heading', { name: 'Who might you become?' })).toBeVisible()
  for (const label of ['Archetype space metrics', 'Target space metrics', 'Question space metrics']) {
    const metrics = page.getByRole('group', { name: label, exact: true })
    await expect(metrics.locator('.space-diagnostic')).toHaveCount(3)
    await expect(metrics.locator('.space-metric-result > strong').first()).not.toHaveText('—')
  }
  const geometry = page.getByRole('group', { name: 'Archetype space metrics', exact: true })
  const originalGeometry = await geometry.locator('.space-metric-result > strong').allTextContents()
  await page.getByRole('button', { name: 'Parallel', exact: true }).click()
  expect(await geometry.locator('.space-metric-result > strong').allTextContents()).toEqual(originalGeometry)
  await geometry.locator('.space-diagnostic').first().locator('summary').click()
  await expect(geometry.getByText(/Zero means they have identical settings/)).toBeVisible()
  await expect(geometry.getByRole('link', { name: 'Technical reference ↗', exact: true })).toHaveAttribute('href', '/reference/space-metrics#minimum-separation')
  await geometry.screenshot({ path: test.info().outputPath('plain-metric-help.png'), style: '.site-header { visibility: hidden !important; }' })
  await geometry.locator('.space-diagnostic').first().locator('summary').click()
  await expect(card.locator('.space-metric-guide')).toHaveCount(0)

  await expect(card.locator('.question-outcome')).toHaveCount(quiz.archetypes.length)
  await expect(card.locator('.question-reach')).toHaveCount(quiz.dimensions.length)
  await expect(card.locator('.question-outcome-identity > b').first()).not.toHaveText('—')
  const probabilities = (await card.locator('.question-outcome-identity > b').allTextContents()).map(text => Number.parseFloat(text))
  expect(probabilities).toEqual([...probabilities].sort((left, right) => right - left))
  const trace = card.getByRole('button', { name: /^Trace question 2:/ })
  await trace.click()
  await expect(trace).toHaveAttribute('aria-pressed', 'true')
  await expect(card.locator('.question-trace-detail > strong')).toHaveText(quiz.pages.filter((p: { hidden: boolean; style: string }) => !p.hidden && p.style !== 'cover' && p.style !== 'results').flatMap((p: { questions: { text: string }[] }) => p.questions)[1].text)
  await card.getByText('How to read these numbers', { exact: true }).click()
  await expect(card.getByText(/Think of this as trying lots of ways/)).toBeVisible()
  await expect(page.getByRole('region', { name: 'All archetype targets' })).toBeVisible()
  await expect(page.locator('.archetype-space').getByRole('region', { name: 'All archetype targets' })).toHaveCount(0)
  await card.getByText('How to read these numbers', { exact: true }).click()
  await card.screenshot({ path: test.info().outputPath('question-space-desktop.png'), style: '.site-header { visibility: hidden !important; }' })
  await page.setViewportSize({ width: 390, height: 844 })
  await expect.poll(() => page.locator('body').evaluate(el => el.scrollWidth)).toBeLessThanOrEqual(390)
  await card.screenshot({ path: test.info().outputPath('question-space-mobile.png'), style: '.site-header { visibility: hidden !important; }' })
  await page.getByRole('tab', { name: 'Review', exact: true }).click()
  await expect(card).toHaveCount(0)
  expect(errors).toEqual([])
})

test('Question space handles an empty draft without fabricated probabilities', async ({ page, account }) => {
  void account
  const response = await page.request.post('/api/personames', { data: { title: 'Empty analysis' } })
  const { id } = await response.json()
  await page.goto(`/create/${id}/preview?tab=analyze`)
  const card = page.getByRole('region', { name: 'Your question space', exact: true })
  await expect(card.getByText('Add visible questions and dimensions to map your question space.')).toBeVisible()
  await expect(card.locator('.question-outcome')).toHaveCount(0)
  await expect(card.getByRole('alert')).toHaveCount(0)
})


test('Question space pages long quizzes and reveals fixed scoring diagnostics', async ({ page, seedQuiz }) => {
  const { id } = await seedQuiz()
  const path = `/api/personames/${id}`
  const quiz: FullQuiz = await (await page.request.get(path)).json()
  const dimensions = await page.request.post(`${path}/dimensions`, { data: { dimensions: [...quiz.dimensions, { id: 'temp-unmeasured', name: 'Unmeasured', minLabel: 'Low', maxLabel: 'High', color: '#0f766e', order: 2 }] } })
  expect(dimensions.ok()).toBeTruthy()
  const pages = quiz.pages.map(p => ({ ...p, questions: [...p.questions] }))
  const questionPage = pages.find(p => p.questions.length)!
  const base = questionPage.questions[0]
  questionPage.questions.push(...Array.from({ length: 3 }, (_, index) => ({ ...base, id: `temp-extra-${index}`, text: `Constant question ${index + 1}`, order: 6 + index, answers: base.answers.map((a, ai) => ({ ...a, id: `temp-extra-${index}-${ai}`, weights: [] })) })))
  expect((await page.request.post(`${path}/questions`, { data: { pages } })).ok()).toBeTruthy()
  await page.goto(`/create/${id}/preview?tab=analyze`)
  const card = page.getByRole('region', { name: 'Your question space', exact: true })
  await expect(card.getByRole('button', { name: 'Next questions' })).toBeVisible()
  await expect(card.getByRole('button', { name: /^Trace question / })).toHaveCount(8)
  await card.getByRole('button', { name: 'Next questions' }).click()
  await expect(card.getByRole('button', { name: /^Trace question / })).toHaveCount(1)
  await expect(card.getByRole('button', { name: 'Next questions' })).toBeDisabled()
  await expect(card.locator('.question-trace-detail')).toContainText('0 dimensions vary')
  await card.locator('.question-space-findings summary').click()
  await expect(card.getByText('Unmeasured stays at 50 across all answers.')).toBeVisible()
  await expect(card.getByText(/“Constant question 1” gives the same scores for every answer/)).toBeVisible()
})


test('Analysis technical reference is available separately with working metric anchors', async ({ page }) => {
  await page.goto('/reference/space-metrics#minimum-separation')
  await expect(page.getByRole('heading', { name: 'Space metrics: technical reference', exact: true })).toBeAttached()
  await expect(page.locator('#minimum-separation')).toHaveCount(1)
  await expect(page.locator('#minimum-separation')).toContainText('Exact closest-pair RMS distance')
  await page.getByRole('link', { name: 'Scores at the limit', exact: true }).click()
  await expect(page).toHaveURL(/#clamped-scores$/)
  await expect(page.locator('#clamped-scores')).toBeInViewport()
  await page.setViewportSize({ width: 390, height: 844 })
  await expect.poll(() => page.locator('body').evaluate(el => el.scrollWidth)).toBeLessThanOrEqual(390)
})
