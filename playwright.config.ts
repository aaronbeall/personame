import 'dotenv/config'
import { defineConfig, devices } from '@playwright/test'
// A separate production server avoids disrupting the regular localhost:3000 preview.
const baseURL = 'http://127.0.0.1:3100'
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 90_000,
  expect: { timeout: 10_000 },
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'on',
    video: 'on',
    screenshot: 'only-on-failure',
    launchOptions: { slowMo: Number(process.env.PW_SLOW_MO || 0) },
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 1000 },
      },
    },
  ],
  webServer: {
    command: 'npm run start -- --hostname 127.0.0.1 --port 3100',
    url: baseURL,
    reuseExistingServer: false,
    timeout: 30_000,
    env: { NEXTAUTH_URL: baseURL, PERSONAME_E2E: '1' },
  },
})
