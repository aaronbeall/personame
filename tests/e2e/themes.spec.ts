import { test, expect } from './fixtures'

test('Themes persist through quiz, dimension and archetype editors and render all colors', async ({
  page,
  seedQuiz,
  db,
}) => {
  const { id } = await seedQuiz()
  const chooseTheme = async (name: string) => {
    await page.getByRole('button', { name: /^Choose color/ }).click()
    await page.getByRole('tab', { name: 'Themes', exact: true }).click()
    await expect(page.getByLabel('Custom color', { exact: true })).toHaveCount(
      0,
    )
    await page.getByRole('button', { name, exact: true }).click()
    await page.keyboard.press('Escape')
  }
  await test.step('Quiz theme saves its full list and reopens the Themes tab', async () => {
    await page.goto(`/create/${id}/name`)
    await page.getByRole('button', { name: 'Edit style', exact: true }).click()
    await chooseTheme('Aurora')
    await page.getByRole('button', { name: 'Save', exact: true }).click()
    await expect(
      page.getByText('Saved. Your changes are in the draft.', { exact: true }),
    ).toBeVisible()
    expect((await db.persona.findUniqueOrThrow({ where: { id } })).color).toBe(
      '#2563eb,#7c3aed',
    )
    await page.reload()
    await page.getByRole('button', { name: 'Edit style', exact: true }).click()
    await page
      .getByRole('button', { name: 'Choose color: Aurora', exact: true })
      .click()
    await expect(
      page.getByRole('tab', { name: 'Themes', exact: true }),
    ).toHaveAttribute('aria-selected', 'true')
    await expect(
      page.getByRole('button', { name: 'Aurora', exact: true }),
    ).toHaveAttribute('aria-pressed', 'true')
    await page.getByRole('tab', { name: 'Themes', exact: true }).focus()
    await page.keyboard.press('ArrowLeft')
    await expect(
      page.getByRole('tab', { name: 'Solid colors', exact: true }),
    ).toBeFocused()
    await expect(page.getByLabel('Custom color', { exact: true })).toBeVisible()
    await page.keyboard.press('Escape')
    await page.keyboard.press('Escape')
  })
  await test.step('Dimension scale and symbol use the entire theme', async () => {
    await page.goto(`/create/${id}/dimensions`)
    const record = page.locator('.dimension-record').first()
    await record
      .getByRole('button', { name: /^Edit / })
      .filter({ hasText: 'Edit' })
      .last()
      .click()
    await record
      .getByRole('button', { name: 'Edit style', exact: true })
      .click()
    await chooseTheme('Wildflower')
    await page.getByRole('button', { name: 'Save', exact: true }).click()
    await expect(
      page.getByText('Changes saved.', { exact: true }),
    ).toBeVisible()
    const dimensions = await db.dimension.findMany({
      where: { personaId: id },
      orderBy: { order: 'asc' },
    })
    expect(dimensions[0].color).toBe('#7c3aed,#db2777')
    await expect(record.locator('.dimension-scale-track')).toHaveCSS(
      'background-image',
      /rgb\(124, 58, 237\).*rgb\(219, 39, 119\)/,
    )
    await expect(record.locator('.dimension-symbol')).toHaveCSS(
      '--dimension-surface',
      /linear-gradient/,
    )
    await page.reload()
    await expect(page.locator('.dimension-scale-track').first()).toHaveCSS(
      'background-image',
      /rgb\(124, 58, 237\).*rgb\(219, 39, 119\)/,
    )
  })
  await test.step('Archetype theme assigns its accent to frame, ring and texture', async () => {
    await page.goto(`/create/${id}/archetypes`)
    const record = page.locator('.archetype-view').first()
    await record
      .getByRole('button', { name: 'Edit style', exact: true })
      .click()
    await chooseTheme('Ember')
    await page.getByRole('button', { name: 'Save', exact: true }).click()
    await expect(
      page.getByText('Changes saved.', { exact: true }),
    ).toBeVisible()
    const archetypes = await db.archetype.findMany({
      where: { personaId: id },
      orderBy: { order: 'asc' },
    })
    expect(archetypes[0].color).toBe('#c2410c,#f59e0b')
    const badge = record.locator('.archetype-badge-themed')
    await expect(badge).toHaveCSS('--badge-color', '#c2410c')
    await expect(badge).toHaveCSS('--badge-ring', '#f59e0b')
    await page.screenshot({
      path: test.info().outputPath('themed-archetypes.png'),
      fullPage: true,
    })
  })
})
