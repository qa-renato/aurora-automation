import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const AUTH_FILE = path.join(__dirname, 'auth', 'storageState.json');
const authFileExists = fs.existsSync(AUTH_FILE);

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : 2,
  // O SPA da Aurora faz init via Keycloak SSO + polling de API; a carga da
  // tabela pode levar dezenas de segundos. O timeout padrão (30s) é menor que
  // os waits do navigate() — elevamos para evitar "test timeout" durante a carga.
  timeout: 90_000,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/html', open: 'never' }],
    ['json', { outputFile: 'reports/json/results.json' }],
  ],

  use: {
    baseURL: process.env.AURORA_BASE_URL || 'https://sandbox-inbot-aurora.vercel.app',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 30000,
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
  },

  projects: [
    {
      name: 'setup',
      testMatch: 'tests/setup/auth.setup.ts',
      use: authFileExists ? { storageState: AUTH_FILE } : {},
    },

    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: AUTH_FILE,
      },
      dependencies: ['setup'],
    },

    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: AUTH_FILE,
      },
      dependencies: ['setup'],
    },

    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        storageState: AUTH_FILE,
      },
      dependencies: ['setup'],
    },
  ],

  outputDir: 'reports/test-results',
});
