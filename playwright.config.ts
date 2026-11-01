import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  fullyParallel: true,
  reporter: 'list',
  use: {
    ...devices['iPhone 12 Pro'],
    baseURL: 'http://localhost:4173/forja/',
    defaultBrowserType: 'chromium',
  },
  webServer: {
    command: 'npm run preview -- --port 4173 --strictPort',
    url: 'http://localhost:4173/forja/',
    reuseExistingServer: true,
  },
})
