import { test, expect } from './fixtures'

test('Required inputs, midpoint, back navigation, and reload keep participant answers', async ({
  page,
  seedQuiz,
}) => {
  const { id, slug } = await seedQuiz()
  expect(
    (await page.request.post(`/api/personames/${id}/publish`)).ok(),
  ).toBeTruthy()
  await test.step('Begin the quiz and verify unanswered questions block submission', async () => {
    await page.goto(`/quiz/${slug}`)
    await page.getByRole('button', { name: 'Let’s find out' }).click()
    await page.getByRole('button', { name: 'See my results' }).click()
    await expect(
      page.getByRole('alert').filter({ hasText: 'Answer' }),
    ).toContainText('Answer')
  })
  await test.step('Answer each kind of question; midpoint requires explicit confirmation', async () => {
    const groups = page.getByRole('group')
    for (let i = 0; i < 4; i++)
      await groups.nth(i).getByRole('button').last().click()
    await page.getByRole('button', { name: 'See my results' }).click()
    await expect(
      page.getByRole('alert').filter({ hasText: 'Answer' }),
    ).toContainText('How far from your usual routine')
    await page.getByRole('button', { name: 'Use midpoint' }).click()
    await groups.nth(4).getByRole('button').last().click()
    await page.reload()
    await page.getByRole('button', { name: 'Let’s find out' }).click()
    await expect(groups.nth(0).getByRole('button').last()).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await expect(
      page.getByRole('button', { name: 'Use midpoint' }),
    ).toHaveCount(0)
    await page.getByRole('button', { name: 'Back', exact: true }).click()
    await page.getByRole('button', { name: 'Let’s find out' }).click()
    await expect(groups.nth(4).getByRole('button').last()).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })
  await test.step('Submit once and reopen the saved result', async () => {
    await page.getByRole('button', { name: 'See my results' }).click()
    await expect(page).toHaveURL(/\/results\//)
    await expect(
      page.getByRole('heading', { name: 'The Detour Captain', exact: true }),
    ).toBeVisible()
    await page.reload()
    await expect(
      page.getByRole('button', { name: 'Copy result link' }),
    ).toBeVisible()
  })
})

test('Editing a published quiz returns it to draft and old result links still work', async ({
  page,
  seedQuiz,
  db,
}) => {
  const { id, slug } = await seedQuiz()
  expect(
    (await page.request.post(`/api/personames/${id}/publish`)).ok(),
  ).toBeTruthy()
  const quiz = await (await page.request.get(`/api/quiz/${slug}`)).json()
  const responses = Object.fromEntries(
    quiz.pages[1].questions.map(
      (q: { id: string; type: string; answers: { id: string }[] }) => [
        q.id,
        q.type === 'SLIDER'
          ? { value: 100 }
          : { answerId: q.answers.at(-1)!.id },
      ],
    ),
  )
  const submitted = await page.request.post(`/api/quiz/${slug}/submit`, {
    data: {
      responses,
      revision: quiz.revision,
      submissionKey: crypto.randomUUID(),
    },
  })
  expect(submitted.ok()).toBeTruthy()
  const result = await submitted.json()
  await test.step('Edit the quiz title and save it as a draft', async () => {
    await page.goto(`/create/${id}/name`)
    await page
      .getByLabel('Quiz title', { exact: true })
      .fill('Revised browser fixture')
    await page.getByRole('button', { name: 'Save', exact: true }).click()
    await expect
      .poll(
        async () =>
          (await db.persona.findUniqueOrThrow({ where: { id } })).status,
      )
      .toBe('DRAFT')
  })
  await test.step('Public quiz is unavailable while historical result is preserved', async () => {
    await page.goto(`/quiz/${slug}`)
    await expect(
      page.getByRole('heading', { name: 'Quiz unavailable' }),
    ).toBeVisible()
    await page.goto(`/quiz/${slug}/results/${result.id}`)
    await expect(
      page.getByRole('heading', { name: 'The Detour Captain', exact: true }),
    ).toBeVisible()
  })
})

test('Anonymous visitors cannot open a creator editor or publish a private draft', async ({
  seedQuiz,
  browser,
  baseURL,
}) => {
  const { id, slug } = await seedQuiz()
  const context = await browser.newContext({ baseURL })
  try {
    const visitor = await context.newPage()
    await visitor.goto(`/create/${id}/dimensions`)
    await expect(visitor).toHaveURL(/\/auth\/signin/)
    await expect(
      visitor.getByRole('heading', { name: 'Welcome to Personame' }),
    ).toBeVisible()
    await visitor.screenshot({
      fullPage: true,
      path: test.info().outputPath('signin.png'),
    })
    expect(
      (await context.request.post(`/api/personames/${id}/publish`)).status(),
    ).toBe(401)
    expect((await context.request.get(`/api/quiz/${slug}`)).status()).toBe(404)
  } finally {
    await context.close()
  }
})
