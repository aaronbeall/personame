import { test, expect } from './fixtures'

test('Archetype value markers show reusable score descriptions and endpoint labels remain readable', async ({
  page,
  seedQuiz,
  db,
}) => {
  const { id } = await seedQuiz()
  const dimension = await db.dimension.findFirstOrThrow({
    where: { personaId: id },
    orderBy: { order: 'asc' },
  })
  const archetype = await db.archetype.findFirstOrThrow({
    where: { personaId: id },
    orderBy: { order: 'asc' },
  })
  await db.dimension.update({
    where: { id: dimension.id },
    data: {
      minLabel: 'Serious',
      maxLabel: 'Silly',
      minEmoji: '🧊',
      maxEmoji: '🤪',
    },
  })
  await db.archetypeDimension.update({
    where: {
      archetypeId_dimensionId: {
        archetypeId: archetype.id,
        dimensionId: dimension.id,
      },
    },
    data: { targetValue: 90, relevance: 1 },
  })
  await page.goto(`/create/${id}/archetypes`)
  const record = page.locator('.archetype-view').first()
  const marker = record.locator('.dimension-value-marker').first()
  await expect(record.getByText('Target', { exact: true })).toHaveCount(0)
  const importance = record.getByRole('meter', {
    name: `${dimension.name} importance`,
    exact: true,
  })
  await expect(importance).toHaveAttribute('aria-valuenow', '100')
  await expect(importance.locator(':scope > span > span')).toHaveCount(5)
  expect(
    await importance
      .locator(':scope > span > span')
      .evaluateAll((segments) =>
        segments.every(
          (segment) => (segment as HTMLElement).style.height === '100%',
        ),
      ),
  ).toBeTruthy()

  await expect(marker).toContainText('Very Silly')
  await expect(marker).toContainText('90/100')
  await expect(marker).toContainText('🤪')
  await expect(marker.locator('.dimension-value-callout')).toBeVisible()
  const ends = record.locator('.archetype-target-ends').first()
  await expect(ends.getByText('Serious', { exact: true })).toBeVisible()
  await expect(ends.getByText('Silly', { exact: true })).toBeVisible()
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 })
    await expect
      .poll(() => page.locator('body').evaluate((el) => el.scrollWidth))
      .toBeLessThanOrEqual(width)
    const callout = await marker
      .locator('.dimension-value-callout')
      .boundingBox()
    const track = await record
      .locator('.archetype-target-track')
      .first()
      .boundingBox()
    expect(callout).not.toBeNull()
    expect(track).not.toBeNull()
    expect(callout!.x).toBeGreaterThanOrEqual(track!.x - 1)
    expect(callout!.x + callout!.width).toBeLessThanOrEqual(
      track!.x + track!.width + 1,
    )
    expect(callout!.y + callout!.height).toBeLessThan(track!.y)
    const labels = await ends
      .locator('.dimension-endpoint-label > span:last-child')
      .evaluateAll((elements) =>
        elements.map((element) => ({
          height: element.getBoundingClientRect().height,
          maxWidth: getComputedStyle(element).maxWidth,
        })),
      )
    expect(
      labels.every((label) => label.height < 20 && label.maxWidth === 'none'),
    ).toBeTruthy()
  }
  await page.setViewportSize({ width: 1440, height: 1000 })
  await record.screenshot({
    path: test.info().outputPath('archetype-value-markers.png'),
  })
  await record.getByRole('button', { name: 'Edit', exact: true }).click()
  const editor = page.locator('.dimension-target-editor').first()
  const targetSlider = editor.getByRole('slider', {
    name: `${dimension.name} target value`,
    exact: true,
  })
  const weightSlider = editor.getByRole('slider', {
    name: `${dimension.name} importance weight`,
    exact: true,
  })
  await expect(editor.locator('.dimension-value-label')).toContainText(
    'Very Silly',
  )
  const targetBox = await targetSlider.boundingBox()
  const weightBox = await weightSlider.boundingBox()
  expect(
    Math.abs(
      targetBox!.y +
        targetBox!.height / 2 -
        (weightBox!.y + weightBox!.height / 2),
    ),
  ).toBeLessThan(2)
  await weightSlider.focus()
  await page.keyboard.press('Home')
  await expect(
    editor.getByText('Not used in matching', { exact: true }),
  ).toBeVisible()
  await page.setViewportSize({ width: 390, height: 1000 })
  await expect(editor.locator('.dimension-value-label')).toBeVisible()
  await expect
    .poll(() => page.locator('body').evaluate((el) => el.scrollWidth))
    .toBeLessThanOrEqual(390)
  await editor.screenshot({
    path: test.info().outputPath('dimension-target-editor-mobile.png'),
  })
})
