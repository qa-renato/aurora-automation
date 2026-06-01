import { test as base, expect, Page, TestInfo } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { takeScreenshotOnFailure } from '../utils/screenshots';
import logger from '../utils/logger';

export type AuroraFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  authenticatedPage: Page;
};

export const test = base.extend<AuroraFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  dashboardPage: async ({ page }, use) => {
    const dashboardPage = new DashboardPage(page);
    await use(dashboardPage);
  },

  // Fixture que garante que a página está autenticada via storageState
  // configurado em playwright.config.ts. Use nos testes que precisam
  // de uma sessão já iniciada.
  authenticatedPage: async ({ page }, use) => {
    logger.info('Fixture authenticatedPage: sessão carregada do storageState');
    await use(page);
  },
});

// Hook de pós-teste para capturar screenshot e log em caso de falha
// Adicione test.afterEach nos spec files que precisam desse comportamento,
// ou estenda o fixture para cobrir todos os testes do projeto.
export async function captureEvidenceOnFailure(page: Page, testInfo: TestInfo): Promise<void> {
  if (testInfo.status !== 'passed') {
    logger.error(`Teste falhou: "${testInfo.title}" — Status: ${testInfo.status}`);
    await takeScreenshotOnFailure(page, testInfo);
  }
}

export { expect };
