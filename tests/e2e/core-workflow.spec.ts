import { test, expect } from './fixtures'

test('Create, grade, preview, publish, and complete a quiz through the UI', async ({
  page,
  account,
  db,
  context,
}) => {
  let quizId = '',
    slug = ''
  await test.step('Name a new quiz and create its first dimension', async () => {
    await page.goto('/create')
    await page
      .getByLabel('Quiz title', { exact: true })
      .fill('The browser adventure')
    await page
      .getByLabel('Description (optional)')
      .fill('A real UI walkthrough, using disposable test data.')
    await test.info().attach('New quiz setup — desktop', {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png',
    })
    await page.setViewportSize({ width: 390, height: 844 })
    await test.info().attach('New quiz setup — mobile', {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png',
    })
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.getByRole('button', { name: 'Save & continue' }).click()
    await expect(page).toHaveURL(/\/dimensions$/)
    quizId = page.url().split('/')[4]
    await expect(
      page.getByRole('button', { name: 'Add Dimension' }),
    ).toBeEnabled()
    await test.info().attach('Dimensions page layout', {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png',
    })
    await page.getByRole('button', { name: 'Add Dimension' }).click()
    await page.getByPlaceholder('e.g., Extraversion').fill('Curiosity')
    await page.getByPlaceholder('e.g., Introverted').fill('Grounded')
    await page.getByPlaceholder('e.g., Extraverted').fill('Exploratory')
    await page
      .getByRole('button', { name: 'Choose low end icon', exact: true })
      .click()
    await page.getByPlaceholder('Search emojis...').fill('seedling')
    await page.getByTitle('seedling', { exact: true }).click()
    await page
      .getByRole('button', { name: 'Choose high end icon', exact: true })
      .click()
    await page.getByPlaceholder('Search emojis...').fill('rocket')
    await page.getByTitle('rocket', { exact: true }).click()
    await page
      .getByRole('button', { name: 'Choose high end icon', exact: true })
      .click()
    await page.getByTitle('Remove emoji', { exact: true }).click()
    await expect(
      page
        .getByRole('button', { name: 'Choose high end icon', exact: true })
        .locator('svg'),
    ).toHaveCount(1)
    await page
      .getByRole('button', { name: 'Choose high end icon', exact: true })
      .click()
    await page.getByPlaceholder('Search emojis...').fill('rocket')
    await page.getByTitle('rocket', { exact: true }).click()
    await page.getByRole('button', { name: 'Edit style', exact: true }).click()
    await page.getByRole('button', { name: 'Choose icon', exact: true }).click()
    await page.getByPlaceholder('Search emojis...').fill('brain')
    await page.getByTitle('brain', { exact: true }).click()
    await page.getByRole('button', { name: /^Choose color/ }).click()
    await page.getByRole('button', { name: 'Purple', exact: true }).click()
    await expect(
      page.getByRole('button', { name: 'Choose color: Purple' }),
    ).toBeVisible()
    await test.info().attach('Portrait edit popover', {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png',
    })
    await page.keyboard.press('Escape')
    await page.getByRole('button', { name: 'Save & continue' }).click()
    await expect(page).toHaveURL(/\/archetypes$/)
    const styledDimension = await db.dimension.findFirstOrThrow({
      where: { personaId: quizId },
    })
    expect(styledDimension.emoji).toBe('🧠')
    expect(styledDimension.color).toBe('#8b5cf6')
    await expect(page.locator('.dimension-tag').filter({ hasText: 'Curiosity' }).first()).toHaveCSS('background-image', /linear-gradient/)
    await expect(page.locator('.dimension-tag').filter({ hasText: 'Curiosity' }).first()).toHaveCSS('color', 'rgb(255, 255, 255)')
    expect(styledDimension.minEmoji).toBe('🌱')
    expect(styledDimension.maxEmoji).toBe('🚀')
  })
  await test.step('Define two archetypes with opposite dimension targets', async () => {
    for (const [name, target] of [
      ['Grounded', '0'],
      ['Explorer', '100'],
    ]) {
      await page.getByRole('button', { name: 'Add Archetype' }).click()
      await page.getByPlaceholder('e.g., The Explorer').fill(name)
      await page
        .getByRole('spinbutton', { name: 'Curiosity target', exact: true })
        .fill(target)
      await page.getByPlaceholder('Describe this archetype...').click() // Commit target on blur.
      await expect(
        page.getByRole('spinbutton', { name: 'Curiosity target', exact: true }),
      ).toHaveValue(target)
      await page.getByRole('button', { name: 'Done', exact: true }).click()
    }
    await test.info().attach('Archetypes — refined profiles', {
      body: await page.screenshot({
        fullPage: true,
        path: test.info().outputPath('archetypes.png'),
      }),
      contentType: 'image/png',
    })
    await page.getByRole('button', { name: 'Save & continue' }).click()
    await expect(page).toHaveURL(/\/questions$/)
  })
  await test.step('Build a question page with multiple choice, slider, and scale', async () => {
    await page.getByRole('button', { name: 'Add Page' }).click()
    await page
      .getByRole('button', { name: 'Add Question', exact: true })
      .click()
    await page
      .getByPlaceholder('Enter your question')
      .fill('Which path do you choose?')
    await page.getByPlaceholder('Answer text').nth(0).fill('The familiar path')
    await page.getByPlaceholder('Answer text').nth(1).fill('The unmarked path')
    await page
      .getByRole('spinbutton', { name: 'The familiar path: Curiosity weight' })
      .fill('-20')
    await page
      .getByRole('spinbutton', { name: 'The unmarked path: Curiosity weight' })
      .fill('20')
    await page
      .getByRole('button', { name: 'Add Question', exact: true })
      .click()
    await page
      .getByPlaceholder('Enter your question')
      .fill('How curious are you today?')
    await page.getByRole('button', { name: 'Slider', exact: true }).click()
    await page
      .getByRole('spinbutton', { name: 'Min: Curiosity weight' })
      .fill('-20')
    await page
      .getByRole('spinbutton', { name: 'Max: Curiosity weight' })
      .fill('20')
    await page
      .getByRole('button', { name: 'Add Question', exact: true })
      .click()
    await page
      .getByPlaceholder('Enter your question')
      .fill('How much do you like surprises?')
    await page.getByRole('button', { name: 'Scale', exact: true }).click()
    await page
      .getByRole('spinbutton', { name: 'Low: Curiosity weight' })
      .fill('-20')
    await page
      .getByRole('spinbutton', { name: 'High: Curiosity weight' })
      .fill('20')
    await test.info().attach('Question editor — desktop', {
      body: await page.screenshot({
        fullPage: true,
        path: test.info().outputPath('questions.png'),
      }),
      contentType: 'image/png',
    })
    await page.setViewportSize({ width: 390, height: 844 })
    await test.info().attach('Question editor — mobile', {
      body: await page.screenshot({
        fullPage: true,
        path: test.info().outputPath('questions-mobile.png'),
      }),
      contentType: 'image/png',
    })
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.getByRole('button', { name: 'Continue to Preview' }).click()
    await expect(page).toHaveURL(/\/preview$/)
  })
  await test.step('Try the complete participant preview without recording a result', async () => {
    await page.getByRole('tab', { name: 'Try the quiz' }).click()
    await page.getByRole('button', { name: 'Let’s find out' }).click()
    await page
      .getByRole('group', { name: 'Which path do you choose?' })
      .getByRole('button', { name: 'The unmarked path' })
      .click()
    await page
      .getByRole('slider', { name: 'How curious are you today?' })
      .fill('100')
    await page
      .getByRole('group', { name: 'How much do you like surprises?' })
      .getByRole('button', { name: '5', exact: true })
      .click()
    await page.getByRole('button', { name: 'See my results' }).click()
    await expect(
      page.getByRole('heading', { name: 'Explorer', exact: true }),
    ).toBeVisible()
    expect(await db.quizResult.count({ where: { personaId: quizId } })).toBe(0)
  })
  await test.step('Publish and verify the creator dashboard', async () => {
    await page.getByRole('tab', { name: 'Review & publish' }).click()
    await page
      .getByRole('button', { name: 'Publish quiz', exact: true })
      .waitFor()
    await page.screenshot({
      fullPage: true,
      path: test.info().outputPath('review.png'),
    })
    await page
      .getByRole('button', { name: 'Publish quiz', exact: true })
      .click()
    await expect(page.getByRole('link', { name: 'Open quiz' })).toBeVisible()
    const quiz = await db.persona.findUniqueOrThrow({ where: { id: quizId } })
    slug = quiz.slug
    await page.goto('/dashboard')
    await expect(
      page.getByRole('heading', { name: 'The browser adventure' }),
    ).toBeVisible()
    await test.info().attach('Creator dashboard', {
      body: await page.screenshot({
        fullPage: true,
        path: test.info().outputPath('dashboard.png'),
      }),
      contentType: 'image/png',
    })
    expect(quiz.creatorId).toBe(account.id)
  })
  await test.step('An anonymous participant answers and opens a persistent, shareable result', async () => {
    await context.clearCookies()
    const participant = await context.newPage()
    try {
      await participant.goto(`/quiz/${slug}`)
      await participant.getByRole('button', { name: 'Let’s find out' }).click()
      await participant.getByRole('button', { name: 'See my results' }).click()
      await expect(
        participant.getByRole('alert').filter({ hasText: 'Answer' }),
      ).toContainText('Answer')
      await participant
        .getByRole('group', { name: 'Which path do you choose?' })
        .getByRole('button', { name: 'The unmarked path' })
        .click()
      await participant
        .getByRole('slider', { name: 'How curious are you today?' })
        .fill('100')
      await participant
        .getByRole('group', { name: 'How much do you like surprises?' })
        .getByRole('button', { name: '5', exact: true })
        .click()
      await participant.screenshot({
        fullPage: true,
        path: test.info().outputPath('participant.png'),
      })
      await participant.getByRole('button', { name: 'See my results' }).click()
      await expect(participant).toHaveURL(/\/results\//)
      await expect(
        participant.getByRole('heading', { name: 'Explorer', exact: true }),
      ).toBeVisible()
      await expect(
        participant.getByRole('meter', { name: 'Curiosity: 100 out of 100' }),
      ).toBeVisible()
      await participant.screenshot({
        fullPage: true,
        path: test.info().outputPath('result.png'),
      })
      await participant.reload()
      await expect(
        participant.getByRole('heading', { name: 'Explorer', exact: true }),
      ).toBeVisible()
      expect(await db.quizResult.count({ where: { personaId: quizId } })).toBe(
        1,
      )
      await test.step('Retake with opposite answers and obtain the other archetype', async () => {
        await participant.getByRole('link', { name: 'Retake quiz' }).click()
        await participant
          .getByRole('button', { name: 'Let’s find out' })
          .click()
        await participant
          .getByRole('group', { name: 'Which path do you choose?' })
          .getByRole('button', { name: 'The familiar path' })
          .click()
        await participant
          .getByRole('slider', { name: 'How curious are you today?' })
          .fill('0')
        await participant
          .getByRole('group', { name: 'How much do you like surprises?' })
          .getByRole('button', { name: '1', exact: true })
          .click()
        await participant
          .getByRole('button', { name: 'See my results' })
          .click()
        await expect(
          participant.getByRole('heading', { name: 'Grounded', exact: true }),
        ).toBeVisible()
        await expect(
          participant.getByRole('meter', { name: 'Curiosity: 0 out of 100' }),
        ).toBeVisible()
        expect(
          await db.quizResult.count({ where: { personaId: quizId } }),
        ).toBe(2)
      })
    } finally {
      await participant.close()
    }
  })
})
