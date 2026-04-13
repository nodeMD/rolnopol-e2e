import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';

config();

const baseURL = process.env.BASE_URL ?? 'http://localhost:3000';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 3,
  reporter: [
    ['html', { open: 'never' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list'],
  ],
  use: {
    baseURL,
    trace: 'on',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      grepInvert: /@api/,
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      grepInvert: /@api/,
    },
    {
      name: 'safari',
      use: { ...devices['Desktop Safari'] },
      grepInvert: /@api/,
    },
    {
      name: 'api-tests',
      use: {
        baseURL: process.env.API_URL,
      },
      grep: /@api/,
    },
  ],
});
