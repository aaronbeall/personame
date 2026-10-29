import { test, expect } from './fixtures'

test('Your quizzes separates live quizzes and drafts, and shows accurate visual composition and next steps', async ({
  page,
  seedQuiz,
  db,
}) => {
  const ready = await seedQuiz()
  const live = await seedQuiz()
  const closed = await seedQuiz()
  await db.persona.update({
    where: { id: closed.id },
    data: { status: 'CLOSED', publishedAt: new Date(), visibility: 'PUBLIC' },
  })
  expect(
    (await page.request.post(`/api/personames/${live.id}/publish`)).ok(),
  ).toBeTruthy()
  const response = await page.request.post('/api/personames', {
    data: { title: 'An unfinished idea' },
  })
  expect(response.ok()).toBeTruthy()
  const partial = await response.json()
  await page.goto('/quizzes')
  await expect(page.locator('#header-quiz-count')).toHaveText('4 quizzes')
  expect(await (await page.request.get('/api/me/counts')).json()).toEqual({
    count: 4,
    selvesCount: 0,
  })
  const drafts = page.getByRole('tabpanel', { name: /^Drafts/ })
  const published = page.getByRole('tabpanel', { name: /^Published/ })
  await expect(drafts.getByRole('article')).toHaveCount(2)
  const partialCard = drafts.getByRole('article').filter({
    has: page.getByRole('heading', {
      name: 'An unfinished idea',
      exact: true,
    }),
  })
  await expect(
    partialCard.getByRole('link', { name: 'Continue: Dimensions' }),
  ).toHaveAttribute('href', `/create/${partial.id}/dimensions`)
  await expect(
    partialCard.getByRole('link', {
      name: 'Dimensions: 0, incomplete',
      exact: true,
    }),
  ).toBeVisible()
  await expect(partialCard.locator('li[data-state=complete]')).toHaveCount(0)
  await expect(partialCard.locator('li[data-state=incomplete]')).toHaveCount(3)
  const readyCard = drafts
    .getByRole('article')
    .filter({ has: page.locator(`a[href="/create/${ready.id}/preview?tab=publish"]`) })
  await expect(
    readyCard.getByRole('link', { name: 'Review & publish', exact: true }),
  ).toBeVisible()
  await expect(readyCard.locator('li[data-state=complete]')).toHaveCount(3)
  expect(
    await drafts.evaluate((el) => getComputedStyle(el).backgroundColor),
  ).toBe('rgba(0, 0, 0, 0)')
  expect(
    await partialCard.evaluate((el) => getComputedStyle(el).backgroundImage),
  ).toContain('linear-gradient')
  expect(
    await partialCard.evaluate((el) => getComputedStyle(el).borderStyle),
  ).toBe('dashed')
  await page.getByRole('tab', { name: /^Drafts/ }).focus()
  await page.keyboard.press('End')
  await expect(page.getByRole('tab', { name: /^Published/ })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  await expect(published.getByRole('article')).toHaveCount(2)
  await expect(published.getByText('Live', { exact: true })).toBeVisible()
  await expect(published.getByText('Closed', { exact: true })).toBeVisible()
  await expect(published.locator('.dashboard-live')).toHaveCount(1)
  await expect(published.locator('.dashboard-closed')).toHaveCount(1)
  await expect(published.locator('.draft-composition')).toHaveCount(0)
  await page
    .getByRole('searchbox', { name: 'Search quizzes' })
    .fill('no such quiz')
  await expect(published.getByRole('article')).toHaveCount(0)
  await expect(
    published.getByText('No quizzes match your search.'),
  ).toBeVisible()
  await page.getByRole('searchbox', { name: 'Search quizzes' }).fill('')
  await page.getByRole('tab', { name: /^Drafts/ }).click()
  await page
    .getByRole('searchbox', { name: 'Search quizzes' })
    .fill('UNFINISHED')
  await expect(drafts.getByRole('article')).toHaveCount(1)
  await page.getByRole('searchbox', { name: 'Search quizzes' }).fill('')
  const summaries = await (await page.request.get('/api/me/quizzes')).json().then(data => data.items)
  expect(
    summaries.find((q: { id: string }) => q.id === partial.id).composition.next,
  ).toBe('dimensions')
  expect(
    summaries.every((q: object) => !('pages' in q) && !('archetypes' in q)),
  ).toBeTruthy()
  await page.screenshot({
    path: test.info().outputPath('dashboard-composition-desktop.png'),
    fullPage: true,
  })
  await page.setViewportSize({ width: 390, height: 844 })
  await expect
    .poll(() => page.locator('body').evaluate((el) => el.scrollWidth))
    .toBeLessThanOrEqual(390)
  await expect(
    partialCard.getByRole('link', { name: 'Continue: Dimensions' }),
  ).toBeVisible()
  await page.screenshot({
    path: test.info().outputPath('dashboard-composition-mobile.png'),
    fullPage: true,
  })
  await partialCard.getByRole('link', { name: 'Continue: Dimensions' }).click()
  await expect(page).toHaveURL(new RegExp(`/create/${partial.id}/dimensions$`))
})

test('Your many selves is a separate space with your latest archetypes and search', async ({
  page,
  seedQuiz,
  db,
  account,
}) => {
  const { id, slug } = await seedQuiz()
  expect(
    (await page.request.post(`/api/personames/${id}/publish`)).ok(),
  ).toBeTruthy()
  const quiz = await (await page.request.get(`/api/quiz/${slug}`)).json()
  const responses = Object.fromEntries(
    quiz.pages
      .flatMap(
        (p: {
          questions: { id: string; type: string; answers: { id: string }[] }[]
        }) => p.questions,
      )
      .map((q: { id: string; type: string; answers: { id: string }[] }) => [
        q.id,
        q.type === 'SLIDER'
          ? { value: 75 }
          : { answerId: q.answers.at(-1)!.id },
      ]),
  )
  let latest = ''
  for (let i = 0; i < 2; i++) {
    const response = await page.request.post(`/api/quiz/${slug}/submit`, {
      data: {
        responses,
        revision: quiz.revision,
        submissionKey: crypto.randomUUID(),
      },
    })
    expect(response.ok()).toBeTruthy()
    latest = (await response.json()).id
  }
  // Anonymous completions and another account's results must not enter this history.
  await db.quizResult.create({ data: { personaId: id } })
  const other = await db.user.create({
    data: { email: `history-${crypto.randomUUID()}@example.test` },
  })
  try {
    await db.quizResult.create({ data: { personaId: id, userId: other.id } })
    await page.goto('/quizzes')
    const header = page.locator('header').first()
    await header
      .getByRole('link', { name: 'Your many selves', exact: true })
      .click()
    await expect(page).toHaveURL(/\/selves$/)
    await expect(
      header.getByRole('link', { name: 'Your many selves', exact: true }),
    ).toHaveAttribute('aria-current', 'page')
    await expect(
      page.getByRole('heading', { name: 'Your many selves', exact: true }),
    ).toBeVisible()
    await expect(
      page.getByRole('tab', { name: /^Discovered/ }),
    ).toHaveAttribute('aria-selected', 'true')
    const panel = page.getByRole('region', { name: 'Your discoveries' })
    await expect(panel.getByRole('article')).toHaveCount(1)
    await expect(
      panel.getByRole('link', { name: 'Revisit this self' }),
    ).toHaveAttribute('href', `/quiz/${slug}/results/${latest}`)
    const history = await (await page.request.get('/api/me/discoveries')).json().then(data => data.items)
    expect(history).toHaveLength(1)
    await expect(page.locator('#header-selves-count')).toHaveText('1 discovery')
    expect(history[0].id).toBe(latest)
    await expect(
      panel.getByRole('link', {
        name: `Take ${history[0].persona.title} again`,
        exact: true,
      }),
    ).toHaveAttribute('href', `/quiz/${slug}`)
    await expect(
      panel.getByRole('heading', {
        name: history[0].archetype.name,
        exact: true,
      }),
    ).toBeVisible()
    expect(history[0]).not.toHaveProperty('snapshot')
    await page.getByRole('searchbox').fill('no match here')
    await expect(panel.getByText('No selves match your search.')).toBeVisible()
    await page.getByRole('searchbox').fill('')
    await page.setViewportSize({ width: 390, height: 844 })
    await expect
      .poll(() => page.locator('body').evaluate((el) => el.scrollWidth))
      .toBeLessThanOrEqual(390)
    await page.screenshot({
      path: test.info().outputPath('your-many-selves-mobile.png'),
      fullPage: true,
    })
    await panel.getByRole('link', { name: 'Revisit this self' }).click()
    await expect(page).toHaveURL(new RegExp(`/results/${latest}$`))
    expect(
      await db.quizResult.count({
        where: { userId: account.id, personaId: id },
      }),
    ).toBe(2)
  } finally {
    await db.quizResult.deleteMany({ where: { userId: other.id } })
    await db.user.delete({ where: { id: other.id } })
  }
})

test('Separate creator and discovery spaces have clear navigation, empty states, and sign-in protection', async ({
  page,
  account,
  context,
}) => {
  expect(account.id).toBeTruthy()
  await page.goto('/quizzes')
  await expect(
    page.getByRole('heading', { name: 'Your quizzes', exact: true }),
  ).toBeVisible()
  await expect(page.getByRole('tab')).toHaveCount(2)
  await expect(
    page.getByText('A fresh idea? Create a quiz to start your next draft.'),
  ).toBeVisible()
  const header = page.locator('header').first()
  await header.getByRole('button', { name: 'User menu' }).click()
  await expect(
    page.getByRole('link', { name: 'Dashboard', exact: true }),
  ).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible()
  await page.keyboard.press('Escape')
  await header
    .getByRole('link', { name: 'Your many selves', exact: true })
    .click()
  await expect(
    page.getByRole('link', { name: 'Explore quizzes', exact: true }).first(),
  ).toBeVisible()
  await expect(
    page.getByText('There’s more than one way to be you.', { exact: false }),
  ).toBeVisible()
  await page.reload()
  await expect(page).toHaveURL(/\/selves$/)
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(
    header.getByRole('link', { name: 'Your many selves', exact: true }),
  ).toBeVisible()
  await header.getByRole('link', { name: 'Your quizzes', exact: true }).click()
  await expect(page).toHaveURL(/\/quizzes$/)
  await expect
    .poll(() => page.locator('body').evaluate((el) => el.scrollWidth))
    .toBeLessThanOrEqual(390)
  await context.clearCookies()
  await page.goto('/selves')
  await expect(page).toHaveURL(/auth\/signin\?callbackUrl=%2Fselves/)
})

test('Still exploring lists started quizzes, resumes saved answers, and clears finished attempts', async ({
  page,
  seedQuiz,
}) => {
  const { id, slug } = await seedQuiz()
  expect(
    (await page.request.post(`/api/personames/${id}/publish`)).ok(),
  ).toBeTruthy()
  const header = page.locator('header').first()
  await page.goto(`/quiz/${slug}`)
  await page.getByRole('button', { name: 'Let’s find out' }).click()
  await page.getByRole('group').first().getByRole('button').last().click()
  await header
    .getByRole('link', { name: 'Your many selves', exact: true })
    .click()
  await page.getByRole('tab', { name: /^Discovered/ }).focus()
  await page.keyboard.press('End')
  const exploring = page.getByRole('tabpanel', { name: /^Still exploring/ })
  await expect(exploring.getByRole('article')).toHaveCount(1)
  await expect(exploring.getByText('1 of 6 answered')).toBeVisible()
  await page.getByRole('searchbox').fill('no matching quiz')
  await expect(
    exploring.getByText('No unfinished discoveries match your search.'),
  ).toBeVisible()
  await page.getByRole('searchbox').fill('')
  await page.reload()
  await page.getByRole('tab', { name: /^Still exploring/ }).click()
  await exploring.getByRole('link', { name: 'Resume discovery' }).click()
  await expect(page).toHaveURL(new RegExp(`/quiz/${slug}$`))
  await page.getByRole('button', { name: 'Let’s find out' }).click()
  const groups = page.getByRole('group')
  await expect(groups.first().getByRole('button').last()).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  for (let i = 1; i < 4; i++)
    await groups.nth(i).getByRole('button').last().click()
  await page.getByRole('button', { name: 'Use midpoint' }).click()
  await groups.nth(4).getByRole('button').last().click()
  await page.getByRole('button', { name: 'See my results' }).click()
  await expect(page).toHaveURL(/\/results\//)
  await header
    .getByRole('link', { name: 'Your many selves', exact: true })
    .click()
  await expect(
    page.getByRole('tabpanel', { name: /^Discovered/ }).getByRole('article'),
  ).toHaveCount(1)
  await page.getByRole('tab', { name: /^Still exploring/ }).click()
  await expect(exploring.getByRole('article')).toHaveCount(0)
  await expect(
    exploring.getByText('No unfinished discoveries.', { exact: false }),
  ).toBeVisible()
})

test('Legacy dashboard bookmarks redirect to Your quizzes', async ({
  page,
  account,
}) => {
  expect(account.id).toBeTruthy()
  await page.goto('/dashboard')
  await expect(page).toHaveURL(/\/quizzes$/)
  await expect(
    page.getByRole('heading', { name: 'Your quizzes', exact: true }),
  ).toBeVisible()
})
