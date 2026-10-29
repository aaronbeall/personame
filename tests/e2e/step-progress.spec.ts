import { test, expect } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { parse } from 'yaml'
import { getQuizComposition } from '../../lib/quiz-composition'
import { compileCatalogQuiz, parseCatalog } from '../../lib/quiz-catalog'

// Read-only, deterministic UI regression: no database or account writes.
test('builder progress reflects saved readiness, not which page was visited', async ({ page }) => {
  const definition = parseCatalog(parse(readFileSync('content/seed-quizzes.yaml', 'utf8'))).quizzes[0]
  const quiz = compileCatalogQuiz(definition)
  quiz.status = 'DRAFT'
  const id = 'step-progress-preview'
  let complete = false
  const empty = { ...quiz, id, dimensions: [], archetypes: [], pages: [] }
  await page.route('**/api/auth/session', route => route.fulfill({ json: {
    user: { name: 'Stepper Preview', email: 'stepper@example.test' },
    expires: '2099-01-01T00:00:00Z',
  } }))
  await page.route('**/api/me/counts', route => route.fulfill({ json: { count: 1, selvesCount: 0 } }))
  await page.route('**/api/personames/count', route => route.fulfill({ json: { count: 8 } }))
  await page.route(`**/api/personames/${id}`, route => route.fulfill({ json: complete ? { ...quiz, id } : empty }))
  await page.route(`**/api/personames/${id}/details`, route => route.fulfill({ json: quiz }))
  await page.route(`**/api/personames/${id}/progress`, route => route.fulfill({ json: getQuizComposition(complete ? quiz : empty) }))
  await page.route(`**/api/personames/${id}/dimensions`, route => route.fulfill({ json: [] }))
  await page.route(`**/api/personames/${id}/archetypes`, route => route.fulfill({ json: [] }))
  await page.route(`**/api/personames/${id}/questions`, route => route.fulfill({ json: [] }))

  await page.goto(`/create/${id}/questions`)
  const steps = page.getByRole('navigation', { name: 'Quiz creation steps' })
  await expect(steps.getByRole('link', { name: /Name/ })).toHaveAttribute('data-completion', 'complete')
  for (const label of ['Dimensions', 'Archetypes', 'Questions']) {
    const step = steps.getByRole('link', { name: new RegExp(label) })
    await expect(step).toHaveAttribute('data-completion', 'incomplete')
    await expect(step.locator('.step-count')).toHaveText('0')
    await expect(step.locator('.lucide-check')).toHaveCount(0)
  }
  await expect(steps.getByRole('link', { name: /Questions/ })).toHaveAttribute('aria-current', 'step')
  await expect(page.locator('.back-link')).toHaveCount(0)
  await test.info().attach('Skipped steps remain incomplete', {
    body: await page.screenshot(),
    contentType: 'image/png',
  })
  await steps.getByRole('link', { name: /Archetypes/ }).click()
  await expect(page).toHaveURL(/\/archetypes$/)
  await expect(steps.getByRole('link', { name: /Dimensions/ })).toHaveAttribute('data-completion', 'incomplete')
  const incompleteDimension = steps.getByRole('link', { name: /Dimensions/ }).locator('.step-marker')
  await expect(incompleteDimension).toHaveText('2')
  await expect(incompleteDimension).toHaveCSS('border-top-style', 'dashed')
  await expect(incompleteDimension).toHaveCSS('color', 'rgb(166, 64, 80)')

  const futureQuestions = steps.getByRole('link', { name: /Questions/ })
  await expect(futureQuestions.locator('.step-marker')).toHaveText('4')
  await expect(futureQuestions.locator('.step-count')).toHaveCount(0)
  await expect(futureQuestions.locator('.step-marker')).not.toHaveCSS('border-top-style', 'dashed')

  complete = true
  await page.goto(`/create/${id}/questions`)
  for (const label of ['Dimensions', 'Archetypes']) {
    const step = steps.getByRole('link', { name: new RegExp(label) })
    await expect(step).toHaveAttribute('data-completion', 'complete')
    await expect(step.locator('.lucide-check')).toHaveCount(1)
  }
  await expect(steps.getByRole('link', { name: /Review/ })).toHaveAttribute('data-completion', 'pending')
  await page.goto(`/create/${id}/name`)
  // Even already-complete future stages retain their numbers, not checks.
  for (const [label, number] of [['Dimensions', '2'], ['Archetypes', '3'], ['Questions', '4']]) {
    const step = steps.getByRole('link', { name: new RegExp(label) })
    await expect(step).toHaveAttribute('data-completion', 'complete')
    await expect(step.locator('.step-marker')).toHaveText(number)
    await expect(step.locator('.lucide-check')).toHaveCount(0)
    await expect(step.locator('.step-count')).toHaveCount(0)
  }
  // Name has a narrower content column; the steps must stay in one row there too.
  for (const width of [1440, 375]) {
    await page.setViewportSize({ width, height: 1000 })
    const layout = await steps.evaluate(nav => {
      const links = [...nav.querySelectorAll('a')]
      return {
        tops: links.map(link => Math.round(link.getBoundingClientRect().top)),
        overflowsPage: document.documentElement.scrollWidth > innerWidth,
      }
    })
    expect(new Set(layout.tops).size).toBe(1)
    expect(layout.overflowsPage).toBe(false)
  }
  await page.setViewportSize({ width: 1440, height: 1000 })

  // Non-zero counts do not establish readiness: one archetype is insufficient.
  quiz.archetypes = quiz.archetypes.slice(0, 1)
  await page.goto(`/create/${id}/questions`)
  const archetypes = steps.getByRole('link', { name: /Archetypes/ })
  await expect(archetypes).toHaveAttribute('data-completion', 'incomplete')
  await expect(archetypes.locator('.step-count')).toHaveText('1')

  quiz.pages.forEach(page => { page.hidden = true })
  await page.reload()
  const questions = steps.getByRole('link', { name: /Questions/ })
  await expect(questions).toHaveAttribute('data-completion', 'incomplete')
  await expect(questions.locator('.step-count')).toHaveText('0')
})
