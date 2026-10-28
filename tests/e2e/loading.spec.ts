import { test, expect } from './fixtures'

test('Slow data loads show skeletons, and saving shows a spinner on the chosen action', async ({
  page,
  seedQuiz,
}) => {
  const { id } = await seedQuiz()
  let releaseDashboard!: () => void
  const dashboardGate = new Promise<void>((resolve) => {
    releaseDashboard = resolve
  })
  await page.route('**/api/dashboard', async (route) => {
    const response = await route.fetch()
    await dashboardGate
    await route.fulfill({ response })
  })
  await page.goto('/dashboard')
  const dashboardLoading = page.getByRole('status', {
    name: 'Loading your quizzes…',
    exact: true,
  })
  await expect(dashboardLoading).toBeVisible()
  await expect(dashboardLoading.locator('.loading-panel')).toHaveCount(3)
  await test
    .info()
    .attach('Quiz list skeletons', {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png',
    })
  releaseDashboard()
  await expect(dashboardLoading).toHaveCount(0)

  let releaseDimensions!: () => void
  const dimensionsGate = new Promise<void>((resolve) => {
    releaseDimensions = resolve
  })
  await page.route(`**/api/personames/${id}/dimensions`, async (route) => {
    const response = await route.fetch()
    if (route.request().method() === 'GET') await dimensionsGate
    await route.fulfill({ response })
  })
  await page.goto(`/create/${id}/dimensions`)
  await expect(
    page.getByRole('status', { name: 'Loading your dimensions…', exact: true }),
  ).toBeVisible()
  await expect(page.getByRole('button', { name: 'Add Dimension' })).toHaveCount(0)
  releaseDimensions()
  await expect(page.getByRole('button', { name: 'Add Dimension' })).toBeEnabled()
  await page.unroute(`**/api/personames/${id}/dimensions`)
  const dimensions = await (
    await page.request.get(`/api/personames/${id}/dimensions`)
  ).json()
  await page
    .getByRole('button', { name: `Edit ${dimensions[0].name}`, exact: true })
    .click()
  await page.getByPlaceholder('e.g., Extraversion').fill('Loading state check')
  let releaseSave!: () => void
  const saveGate = new Promise<void>((resolve) => {
    releaseSave = resolve
  })
  await page.route(`**/api/personames/${id}/dimensions`, async (route) => {
    const response = await route.fetch()
    if (route.request().method() === 'POST') await saveGate
    await route.fulfill({ response })
  })
  await page.getByRole('button', { name: 'Save', exact: true }).click()
  const saving = page.getByRole('button', { name: 'Saving…', exact: true })
  await expect(saving).toHaveAttribute('aria-busy', 'true')
  await expect(saving).toBeDisabled()
  await expect(saving.locator('.loading-spinner')).toBeVisible()
  await page.emulateMedia({ reducedMotion: 'reduce' })
  expect(
    await saving
      .locator('.loading-spinner')
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe('none')
  releaseSave()
  await expect(saving).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: 'Save', exact: true }),
  ).toBeDisabled()
})
