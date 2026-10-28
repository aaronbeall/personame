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

test('Explore header count covers the full public catalog and stays visible while scrolling', async ({
  page,
  account,
  seedQuiz,
  db,
  context,
}) => {
  await db.persona.createMany({
    data: Array.from({ length: 31 }, (_, i) => ({
      title: `Catalog count ${i}`,
      slug: `count-${account.id}-${i}`,
      creatorId: account.id,
      status: 'PUBLISHED' as const,
      visibility: 'PUBLIC' as const,
      publishedAt: new Date(),
    })),
  })
  await db.persona.createMany({
    data: [
      {
        title: 'Private published quiz',
        slug: `private-${account.id}`,
        creatorId: account.id,
        status: 'PUBLISHED',
        visibility: 'PRIVATE',
      },
      {
        title: 'Closed quiz',
        slug: `closed-${account.id}`,
        creatorId: account.id,
        status: 'CLOSED',
        visibility: 'PUBLIC',
      },
    ],
  })
  // Direct fixture inserts bypass cache tags; exercise the real publish invalidation.
  const published = await seedQuiz()
  expect((await page.request.post(`/api/personames/${published.id}/publish`)).ok()).toBeTruthy()
  const count = await db.persona.count({
    where: { status: 'PUBLISHED', visibility: 'PUBLIC' },
  })
  await page.goto('/explore')
  const header = page.locator('.site-header')
  const explore = header.getByRole('link', {
    name: 'Explore quizzes',
    exact: true,
  })
  await expect(explore.locator('.lucide-compass')).toBeVisible()
  await expect(page.locator('#header-explore-count')).toHaveAttribute(
    'title',
    `${count.toLocaleString('en')} published quizzes`,
  )
  expect(
    await (await page.request.get('/api/personames/count')).json(),
  ).toEqual({ count })
  const listing = await (await page.request.get('/api/personames')).json()
  expect(listing).toHaveLength(30)
  await page.evaluate(() => window.scrollTo(0, 600))
  await expect
    .poll(() =>
      header.evaluate((el) => Math.round(el.getBoundingClientRect().top)),
    )
    .toBe(0)
  await page.setViewportSize({ width: 320, height: 844 })
  await expect(explore).toBeVisible()
  await expect(page.locator('#header-explore-count')).toBeVisible()
  await expect(
    header.getByRole('link', { name: 'Your quizzes', exact: true }),
  ).toBeVisible()
  await expect(
    header.getByRole('link', { name: 'Create', exact: true }),
  ).toBeVisible()
  await expect
    .poll(() => page.locator('body').evaluate((el) => el.scrollWidth))
    .toBeLessThanOrEqual(320)
  await page.screenshot({
    path: test.info().outputPath('sticky-header-mobile.png'),
  })
  await context.clearCookies()
  await page.goto('/explore')
  await expect(page.locator('#header-explore-count')).toHaveAttribute(
    'title',
    `${count.toLocaleString('en')} published quizzes`,
  )
})
