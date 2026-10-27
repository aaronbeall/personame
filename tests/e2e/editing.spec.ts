import { test, expect } from './fixtures'

test('Saving earlier edits preserves targets and answer weights; unsaved navigation can be cancelled', async ({
  page,
  seedQuiz,
  db,
}) => {
  const { id } = await seedQuiz()
  const before = await db.dimension.findMany({
    where: { personaId: id },
    include: { archetypeDimensions: true, answerWeights: true },
    orderBy: { order: 'asc' },
  })
  await test.step('Change an existing dimension, then cancel leaving without saving', async () => {
    await page.goto(`/create/${id}/dimensions`)
    await page
      .getByRole('button', { name: `Edit ${before[0].name}`, exact: true })
      .first()
      .click()
    await page
      .getByPlaceholder('e.g., Extraversion')
      .first()
      .fill('Adventure revised')
    await page
      .getByRole('radio', { name: 'Bipolar: −100% to 100%', exact: true })
      .check()
    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toContain('unsaved')
      await dialog.dismiss()
    })
    await page.getByRole('link', { name: 'Archetypes', exact: false }).click()
    await expect(page).toHaveURL(/\/dimensions$/)
    await expect(
      page.getByPlaceholder('e.g., Extraversion').first(),
    ).toHaveValue('Adventure revised')
  })
  await test.step('Save the dimension and verify existing grading relationships survive', async () => {
    await page.getByRole('button', { name: 'Save & continue' }).click()
    await expect(page).toHaveURL(/\/archetypes$/)
    const after = await db.dimension.findMany({
      where: { personaId: id },
      include: { archetypeDimensions: true, answerWeights: true },
      orderBy: { order: 'asc' },
    })
    expect(after[0].id).toBe(before[0].id)
    expect(after[0].name).toBe('Adventure revised')
    expect(after[0].displayScale).toBe('BIPOLAR')
    expect(after[0].answerWeights).toEqual(before[0].answerWeights)
    expect(after[0].archetypeDimensions).toEqual(before[0].archetypeDimensions)
    await page.goto(`/create/${id}/dimensions`)
    await page
      .getByRole('button', { name: 'Edit Adventure revised', exact: true })
      .click()
    await expect(
      page.getByRole('radio', { name: 'Bipolar: −100% to 100%', exact: true }),
    ).toBeChecked()
  })
})

test('A changed quiz cannot silently grade answers against a new revision', async ({
  page,
  seedQuiz,
}) => {
  const { id, slug } = await seedQuiz()
  expect(
    (await page.request.post(`/api/personames/${id}/publish`)).ok(),
  ).toBeTruthy()
  await page.goto(`/quiz/${slug}`)
  await page.getByRole('button', { name: 'Let’s find out' }).click()
  for (let i = 0; i < 4; i++)
    await page.getByRole('group').nth(i).getByRole('button').last().click()
  await page.getByRole('button', { name: 'Use midpoint' }).click()
  await page.getByRole('group').nth(4).getByRole('button').last().click()
  await test.step('The creator changes and republishes while the participant is answering', async () => {
    expect(
      (
        await page.request.patch(`/api/personames/${id}`, {
          data: { title: 'Changed while answering' },
        })
      ).ok(),
    ).toBeTruthy()
    expect(
      (await page.request.post(`/api/personames/${id}/publish`)).ok(),
    ).toBeTruthy()
  })
  await test.step('Submission explains the change and asks the participant to reload', async () => {
    await page.getByRole('button', { name: 'See my results' }).click()
    await expect(
      page.getByRole('alert').filter({ hasText: 'changed' }),
    ).toContainText('Reload')
    await expect(page).not.toHaveURL(/\/results\//)
  })
})

test('Name saves style without advancing, resets drafts, and remains in every builder step', async ({
  page,
  db,
  account,
}) => {
  expect(account.id).toBeTruthy()
  await page.goto('/create')
  await page
    .getByLabel('Quiz title', { exact: true })
    .fill('A styled naming draft')
  await page.getByRole('button', { name: 'Edit style', exact: true }).click()
  await page.getByRole('button', { name: 'Choose icon', exact: true }).click()
  await page.getByPlaceholder('Search emojis...').fill('brain')
  await page.getByTitle('brain', { exact: true }).click()
  await page.getByRole('button', { name: /^Choose color/ }).click()
  await page.getByRole('button', { name: 'Teal', exact: true }).click()
  await page.keyboard.press('Escape')
  await test.info().attach('Name and appearance — desktop', {
    body: await page.screenshot({
      fullPage: true,
      path: test.info().outputPath('name-desktop.png'),
    }),
    contentType: 'image/png',
  })
  await page.setViewportSize({ width: 390, height: 844 })
  expect(
    await page.locator('body').evaluate((el) => el.scrollWidth),
  ).toBeLessThanOrEqual(390)
  await test.info().attach('Name and appearance — mobile', {
    body: await page.screenshot({
      fullPage: true,
      path: test.info().outputPath('name-mobile.png'),
    }),
    contentType: 'image/png',
  })
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.getByRole('button', { name: 'Save', exact: true }).click()
  await expect(page).toHaveURL(/\/name$/)
  const id = page.url().split('/')[4]
  const saved = await db.persona.findUniqueOrThrow({ where: { id } })
  expect(saved.emoji).toBe('🧠')
  expect(saved.color).toBe('#14b8a6')
  await expect(
    page.getByRole('button', { name: 'Save', exact: true }),
  ).toBeDisabled()
  await page
    .getByLabel('Quiz title', { exact: true })
    .fill('Discard this change')
  await page.getByRole('button', { name: 'Reset', exact: true }).click()
  await expect(page.getByLabel('Quiz title', { exact: true })).toHaveValue(
    saved.title,
  )
  await page
    .getByRole('button', { name: 'Save & continue', exact: true })
    .click()
  await expect(page).toHaveURL(/\/dimensions$/)
  await page.getByRole('link', { name: /Name/ }).click()
  await expect(page).toHaveURL(/\/name$/)
  await expect(page.getByLabel('Quiz title', { exact: true })).toHaveValue(
    saved.title,
  )
})

test('Page drafts retain closed editors, save in place, and reset to the latest saved version', async ({
  page,
  seedQuiz,
  db,
}) => {
  const { id } = await seedQuiz()
  await page.goto(`/create/${id}/dimensions`)
  let dimensions = await db.dimension.findMany({
    where: { personaId: id },
    orderBy: { order: 'asc' },
  })
  await page
    .getByRole('button', { name: `Edit ${dimensions[0].name}`, exact: true })
    .click()
  await page.getByPlaceholder('e.g., Extraversion').fill('Saved dimension name')
  await page
    .getByRole('button', { name: 'Done Saved dimension name', exact: true })
    .click()
  await page.getByRole('button', { name: 'Save', exact: true }).click()
  await expect(
    page.getByRole('button', { name: 'Save', exact: true }),
  ).toBeDisabled()
  await expect(page).toHaveURL(/\/dimensions$/)
  await page
    .getByRole('button', { name: 'Edit Saved dimension name', exact: true })
    .click()
  await page
    .getByPlaceholder('e.g., Extraversion')
    .fill('Unwanted edit after saving')
  await expect(
    page.getByRole('button', { name: 'Reset', exact: true }),
  ).toBeEnabled()
  await page.getByRole('button', { name: 'Reset', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'Saved dimension name', exact: true }),
  ).toBeVisible()
  await page
    .getByRole('button', { name: 'Save & continue', exact: true })
    .click()
  await expect(page).toHaveURL(/\/archetypes$/)
  const archetypes = await db.archetype.findMany({
    where: { personaId: id },
    orderBy: { order: 'asc' },
  })
  await expect(page.locator('.archetype-view').first()).toBeVisible()
  await page.screenshot({
    fullPage: true,
    path: test.info().outputPath('profiles-desktop.png'),
  })
  await page.setViewportSize({ width: 390, height: 844 })
  expect(
    await page.locator('body').evaluate((el) => el.scrollWidth),
  ).toBeLessThanOrEqual(390)
  await page.screenshot({
    fullPage: true,
    path: test.info().outputPath('profiles-mobile.png'),
  })
  expect(
    await page
      .locator('.archetype-view-identity p')
      .evaluateAll((elements) =>
        elements.every(
          (el) =>
            el.clientHeight > 0 &&
            el.scrollHeight <= el.clientHeight + 1 &&
            el.scrollWidth <= el.clientWidth + 1,
        ),
      ),
  ).toBe(true)
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.getByRole('button', { name: 'Edit', exact: true }).first().click()
  await page.getByPlaceholder('e.g., The Explorer').fill('Saved archetype name')
  await page.getByRole('button', { name: 'Done', exact: true }).click()
  await page.getByRole('button', { name: 'Save', exact: true }).click()
  await expect(
    page.getByRole('button', { name: 'Save', exact: true }),
  ).toBeDisabled()
  await expect(page).toHaveURL(/\/archetypes$/)
  expect(
    (await db.archetype.findUniqueOrThrow({ where: { id: archetypes[0].id } }))
      .name,
  ).toBe('Saved archetype name')
  await page.getByRole('button', { name: 'Edit', exact: true }).first().click()
  await page
    .getByPlaceholder('e.g., The Explorer')
    .fill('Discard archetype edit')
  await page.getByRole('button', { name: 'Reset', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'Saved archetype name', exact: true }),
  ).toBeVisible()
  dimensions = await db.dimension.findMany({
    where: { personaId: id },
    orderBy: { order: 'asc' },
  })
  expect(dimensions[0].name).toBe('Saved dimension name')
})

test('New quiz starts fresh and unsaved navigation can be cancelled or discarded', async ({
  page,
  account,
}) => {
  expect(account.id).toBeTruthy()
  await page.goto('/dashboard')
  await page.evaluate(() =>
    localStorage.setItem(
      'personame-draft',
      JSON.stringify({
        title: 'Stale browser draft',
        description: 'Old description',
        emoji: '🦖',
        color: '#f43f5e',
      }),
    ),
  )
  await page.getByRole('button', { name: 'Create', exact: true }).click()
  await expect(page).toHaveURL(/\/create$/)
  await expect(page.getByLabel('Quiz title', { exact: true })).toBeEmpty()
  await expect(page.getByLabel('Description (optional)')).toBeEmpty()
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('personame-draft')))
    .toBeNull()
  await page.getByLabel('Quiz title', { exact: true }).fill('An unsaved idea')
  await test.step('Cancel an internal link and keep the current editor', async () => {
    page.once('dialog', async (dialog) => {
      expect(dialog.type()).toBe('confirm')
      await dialog.dismiss()
    })
    await page.getByRole('link', { name: 'Your quizzes', exact: true }).click()
    await expect(page).toHaveURL(/\/create$/)
    await expect(page.getByLabel('Quiz title', { exact: true })).toHaveValue(
      'An unsaved idea',
    )
  })
  await test.step('Cancel browser Back without unmounting the editor', async () => {
    const prompted = page.waitForEvent('dialog')
    await page.evaluate(() => history.back())
    await (await prompted).dismiss()
    await expect(page).toHaveURL(/\/create$/)
    await expect(page.getByLabel('Quiz title', { exact: true })).toHaveValue(
      'An unsaved idea',
    )
  })
  await test.step('Reload uses the native unsaved-changes prompt', async () => {
    const prompted = page.waitForEvent('dialog')
    await page.evaluate(() => {
      setTimeout(() => location.reload(), 0)
    })
    const dialog = await prompted
    expect(dialog.type()).toBe('beforeunload')
    await dialog.dismiss()
    await expect(page.getByLabel('Quiz title', { exact: true })).toHaveValue(
      'An unsaved idea',
    )
  })
  await test.step('Confirm leaving and return to a completely fresh quiz', async () => {
    page.once('dialog', async (dialog) => dialog.accept())
    await page.getByRole('link', { name: 'Your quizzes', exact: true }).click()
    await expect(page).toHaveURL(/\/dashboard$/)
    await page.getByRole('button', { name: 'Create', exact: true }).click()
    await expect(page.getByLabel('Quiz title', { exact: true })).toBeEmpty()
  })
})

test('Browser Forward cancellation keeps changes, while a successful save clears the guard', async ({
  page,
  seedQuiz,
}) => {
  const { id } = await seedQuiz()
  await page.goto(`/create/${id}/name`)
  await page
    .getByRole('button', { name: 'Save & continue', exact: true })
    .click()
  await expect(page).toHaveURL(/\/dimensions$/)
  await page.goBack()
  await expect(page).toHaveURL(/\/name$/)
  await page.getByLabel('Quiz title', { exact: true }).fill('Keep this title')
  const prompted = page.waitForEvent('dialog')
  await page.evaluate(() => history.forward())
  await (await prompted).dismiss()
  await expect(page).toHaveURL(/\/name$/)
  await expect(page.getByLabel('Quiz title', { exact: true })).toHaveValue(
    'Keep this title',
  )
  await page.getByRole('button', { name: 'Save', exact: true }).click()
  await expect(
    page.getByRole('button', { name: 'Save', exact: true }),
  ).toBeDisabled()
  page.on('dialog', async (dialog) => {
    await dialog.dismiss()
    throw new Error('Saved edits should not prompt')
  })
  await page.getByRole('link', { name: /Dimensions/ }).click()
  await expect(page).toHaveURL(/\/dimensions$/)
})

test('Done retains local edits, Cancel restores the item, and Delete only appears while editing', async ({
  page,
  seedQuiz,
  db,
}) => {
  const { id } = await seedQuiz()
  const original = await db.dimension.findFirstOrThrow({
    where: { personaId: id },
    orderBy: { order: 'asc' },
  })
  await page.goto(`/create/${id}/dimensions`)
  await expect(
    page.getByRole('button', { name: `Edit ${original.name}`, exact: true }),
  ).toBeVisible()
  await expect(page.getByRole('button', { name: /^Delete / })).toHaveCount(0)
  await page
    .getByRole('button', { name: `Edit ${original.name}`, exact: true })
    .click()
  await expect(
    page.getByRole('button', { name: `Delete ${original.name}`, exact: true }),
  ).toBeVisible()
  await page
    .getByPlaceholder('e.g., Extraversion')
    .fill('Discard this dimension name')
  await page
    .getByRole('button', {
      name: 'Cancel Discard this dimension name',
      exact: true,
    })
    .click()
  await expect(
    page.getByRole('heading', { name: original.name, exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Save', exact: true }),
  ).toBeDisabled()
  await page
    .getByRole('button', { name: `Edit ${original.name}`, exact: true })
    .click()
  await page
    .getByPlaceholder('e.g., Extraversion')
    .fill('Keep in the page draft')
  await page
    .getByRole('button', { name: 'Done Keep in the page draft', exact: true })
    .click()
  await expect(page.getByRole('button', { name: /^Delete / })).toHaveCount(0)
  await page
    .getByRole('button', { name: 'Edit Keep in the page draft', exact: true })
    .click()
  await page.getByPlaceholder('e.g., Extraversion').fill('Discard later edit')
  await page
    .getByRole('button', { name: 'Cancel Discard later edit', exact: true })
    .click()
  await expect(
    page.getByRole('heading', { name: 'Keep in the page draft', exact: true }),
  ).toBeVisible()
  expect(
    (await db.dimension.findUniqueOrThrow({ where: { id: original.id } })).name,
  ).toBe(original.name)
  await page.getByRole('button', { name: 'Reset', exact: true }).click()
  await page.getByRole('button', { name: 'Add Dimension' }).click()
  await page.getByRole('button', { name: /^Cancel Dimension / }).click()
  await expect(page.getByPlaceholder('e.g., Extraversion')).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: 'Save', exact: true }),
  ).toBeDisabled()

  await page
    .getByRole('button', { name: 'Save & continue', exact: true })
    .click()
  await expect(page).toHaveURL(/\/archetypes$/)
  await expect(page.getByRole('button', { name: /^Delete/ })).toHaveCount(0)
  await page.getByRole('button', { name: 'Edit', exact: true }).first().click()
  await expect(
    page.getByRole('button', { name: 'Delete', exact: true }),
  ).toBeVisible()
  const archetypeName = await page
    .getByPlaceholder('e.g., The Explorer')
    .inputValue()
  await page.getByPlaceholder('e.g., The Explorer').fill('Discard archetype')
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: archetypeName, exact: true }),
  ).toBeVisible()
  await expect(page.getByRole('button', { name: /^Delete/ })).toHaveCount(0)
  await page.getByRole('button', { name: 'Add Archetype' }).click()
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  await expect(page.getByPlaceholder('e.g., The Explorer')).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: 'Save', exact: true }),
  ).toBeDisabled()
})

test('Custom hex colors save and reload without becoming a palette default', async ({
  page,
  seedQuiz,
  db,
}) => {
  const { id } = await seedQuiz()
  await page.goto(`/create/${id}/name`)
  await page.getByRole('button', { name: 'Edit style', exact: true }).click()
  await page.getByRole('button', { name: /^Choose color/ }).click()
  await page.getByLabel('Custom color', { exact: true }).fill('#123456')
  await page.keyboard.press('Escape')
  await expect(
    page.getByRole('button', { name: 'Choose color: #123456', exact: true }),
  ).toBeVisible()
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: 'Save', exact: true }).click()
  await expect(
    page.getByText('Saved. Your changes are in the draft.', { exact: true }),
  ).toBeVisible()
  expect((await db.persona.findUniqueOrThrow({ where: { id } })).color).toBe(
    '#123456',
  )
  await page.reload()
  await page.getByRole('button', { name: 'Edit style', exact: true }).click()
  await expect(
    page.getByRole('button', { name: 'Choose color: #123456', exact: true }),
  ).toBeVisible()
})

test('Editor footers explain required fields and clear feedback as fields are completed', async ({
  page,
  seedQuiz,
}) => {
  const { id } = await seedQuiz()
  await test.step('Name explains why saving is unavailable', async () => {
    await page.goto(`/create/${id}/name`)
    const title = page.getByLabel('Quiz title', { exact: true })
    const original = await title.inputValue()
    await title.fill('   ')
    await expect(
      page.getByText('Enter a quiz name to continue.', { exact: true }),
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Save & continue', exact: true }),
    ).toBeDisabled()
    await title.fill(original)
    await expect(
      page.getByText('Enter a quiz name to continue.', { exact: true }),
    ).toHaveCount(0)
  })
  await test.step('Dimension lists only the endpoints still missing', async () => {
    await page.goto(`/create/${id}/dimensions`)
    await page
      .getByRole('button', { name: 'Add Dimension', exact: false })
      .click()
    const record = page.locator('.dimension-record').last()
    await expect(record.getByRole('status')).toHaveText(
      'Enter a name, a low end label, and a high end label.',
    )
    await record.getByPlaceholder('e.g., Extraversion').fill('Curiosity')
    await expect(record.getByRole('status')).toHaveText(
      'Enter a low end label and a high end label.',
    )
    await record.getByPlaceholder('e.g., Introverted').fill('Familiar')
    await expect(record.getByRole('status')).toHaveText(
      'Enter a high end label.',
    )
    await record.getByPlaceholder('e.g., Extraverted').fill('New')
    await expect(record.getByRole('status')).toHaveCount(0)
    await expect(
      record.getByRole('button', { name: 'Done Curiosity', exact: true }),
    ).toBeEnabled()
    await record
      .getByRole('button', { name: 'Cancel Curiosity', exact: true })
      .click()
  })
  await test.step('Archetype explains its missing name', async () => {
    await page.goto(`/create/${id}/archetypes`)
    await page
      .getByRole('button', { name: 'Add Archetype', exact: false })
      .click()
    const editor = page.locator('.archetype-editor')
    await expect(editor.getByRole('status')).toHaveText('Enter a name.')
    await expect(
      editor.getByRole('button', { name: 'Done', exact: true }),
    ).toBeDisabled()
    await editor.getByPlaceholder('e.g., The Explorer').fill('Explorer')
    await expect(editor.getByRole('status')).toHaveCount(0)
    await expect(
      editor.getByRole('button', { name: 'Done', exact: true }),
    ).toBeEnabled()
    await editor.getByRole('button', { name: 'Cancel', exact: true }).click()
  })
})
