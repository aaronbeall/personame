import { test, expect } from './fixtures'

test('Explore is public, reuses quiz shelves, searches published quizzes, and opens a quiz', async ({
  page,
  seedQuiz,
  db,
  context,
}) => {
  const live = await seedQuiz()
  const draft = await seedQuiz()
  expect(
    (await page.request.post(`/api/personames/${live.id}/publish`)).ok(),
  ).toBeTruthy()
  const quiz = await db.persona.findUniqueOrThrow({ where: { id: live.id } })
  await context.clearCookies()
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/explore')
  await expect(page).toHaveTitle('Explore quizzes | Personame')
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Who will you discover next?',
    }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Follow your curiosity', exact: true }),
  ).toHaveCount(1)
  await expect(page.locator('.quiz-shelf')).toHaveCount(4)
  const listing = await (await page.request.get('/api/personames')).json()
  expect(listing.some((q: { id: string }) => q.id === draft.id)).toBe(false)
  await page.screenshot({
    path: test.info().outputPath('explore-desktop.png'),
    fullPage: true,
  })
  const search = page.getByRole('searchbox', { name: 'Search quizzes' })
  await search.fill(quiz.title)
  await expect(page.locator('.quiz-shelf')).toHaveCount(1)
  await expect(page.locator('.shelf-quiz')).toHaveCount(1)
  await expect(page.locator('.shelf-quiz')).toHaveAttribute(
    'href',
    `/quiz/${live.slug}`,
  )
  await search.fill('there is no quiz with this name 948341')
  await expect(
    page.getByRole('heading', { name: 'No quizzes found' }),
  ).toBeVisible()
  await search.fill(quiz.title)
  await page.setViewportSize({ width: 390, height: 844 })
  await expect
    .poll(() => page.locator('body').evaluate((el) => el.scrollWidth))
    .toBeLessThanOrEqual(390)
  await page.screenshot({
    path: test.info().outputPath('explore-mobile.png'),
    fullPage: true,
  })
  await page.locator('.shelf-quiz').click()
  await expect(page).toHaveURL(new RegExp(`/quiz/${live.slug}$`))
  await expect(
    page.getByRole('button', { name: 'Let’s find out' }),
  ).toBeVisible()
})

test('Homepage keeps its local explore section and links to the full discovery page', async ({
  page,
  seedQuiz,
}) => {
  const quiz = await seedQuiz()
  expect(
    (await page.request.post(`/api/personames/${quiz.id}/publish`)).ok(),
  ).toBeTruthy()
  await page.goto('/')
  await page.locator('.hero-cta-secondary:visible').click()
  await expect(page).toHaveURL(/\/#explore$/)
  await expect(
    page.getByRole('region', { name: 'Explore quizzes', exact: true }),
  ).toBeFocused()
  await page
    .getByRole('link', { name: 'Explore all quizzes', exact: true })
    .click()
  await expect(page).toHaveURL(/\/explore$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Who will you discover next?',
  )
  await expect(
    page
      .locator('footer')
      .getByRole('link', { name: 'Explore quizzes', exact: true }),
  ).toHaveAttribute('href', '/explore')
})
