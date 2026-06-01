import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import logger from '../utils/logger';
import { getEnvironmentConfig } from '../config/environments';

export class DashboardPage extends BasePage {
  protected readonly pageUrl: string;

  // ─── Seletores do Dashboard Aurora ──────────────────────────────────────────
  // Ajuste os seletores conforme a estrutura real da aplicação Aurora
  private readonly sidebar: Locator;
  private readonly userMenuButton: Locator;
  private readonly mainContent: Locator;
  private readonly loadingOverlay: Locator;
  private readonly pageTitle: Locator;
  private readonly logoutButton: Locator;

  constructor(page: Page) {
    super(page);
    const envConfig = getEnvironmentConfig();
    this.pageUrl = envConfig.baseUrl;

    // Seletores priorizando data-testid → role → semântica → classe estável
    this.sidebar = page.locator(
      '[data-testid="sidebar"], nav[aria-label="Sidebar"], aside[role="navigation"], .sidebar, nav.sidebar'
    );
    this.userMenuButton = page.locator(
      '[data-testid="user-menu"], button[aria-label="User menu"], [aria-label="Menu do usuário"], .avatar-button'
    );
    this.mainContent = page.locator(
      '[data-testid="main-content"], main[role="main"], main, #root > div'
    );
    this.loadingOverlay = page.locator(
      '[data-testid="loading"], [aria-label="Carregando"], .loading-overlay, .spinner'
    );
    this.pageTitle = page.locator(
      '[data-testid="page-title"], h1, [role="heading"][aria-level="1"]'
    );
    this.logoutButton = page.getByRole('button', { name: /sair|logout|sign out/i });
  }

  // ─── Esperas ─────────────────────────────────────────────────────────────────

  async waitForDashboardLoad(): Promise<void> {
    await this.page.waitForLoadState('load');
    await this.loadingOverlay.waitFor({ state: 'hidden' }).catch(() => {});
    logger.info('Dashboard carregado');
  }

  // ─── Validações ──────────────────────────────────────────────────────────────

  async validateSuccessfulLogin(): Promise<void> {
    logger.info('Validando login bem-sucedido');

    const envConfig = getEnvironmentConfig();
    const urlPattern = new RegExp(
      envConfig.baseUrl.replace('https://', '').replace(/\./g, '\\.')
    );
    await expect(this.page).toHaveURL(urlPattern);

    logger.info(`Validação de URL passou: ${this.page.url()}`);
  }

  async validateDashboardElements(): Promise<void> {
    logger.info('Validando elementos do dashboard');

    await this.waitForDashboardLoad();

    const isSidebarVisible = await this.isElementVisible(this.sidebar);
    if (isSidebarVisible) {
      logger.info('Sidebar encontrada e visível');
    } else {
      logger.warn('Sidebar não encontrada - verifique os seletores em DashboardPage.ts');
    }
  }

  // ─── Ações ───────────────────────────────────────────────────────────────────

  async getPageTitle(): Promise<string> {
    const isVisible = await this.isElementVisible(this.pageTitle);
    if (!isVisible) return await this.page.title();
    return this.getTextContent(this.pageTitle);
  }

  async openUserMenu(): Promise<void> {
    logger.info('Abrindo menu do usuário');
    await this.userMenuButton.click();
  }

  async logout(): Promise<void> {
    logger.info('Realizando logout');
    await this.openUserMenu();
    await this.logoutButton.click();
    await this.page.waitForURL(/keycloak/, { timeout: 15000 });
    logger.info('Logout realizado com sucesso');
  }

  async isOnDashboard(): Promise<boolean> {
    const envConfig = getEnvironmentConfig();
    return this.page.url().includes(
      new URL(envConfig.baseUrl).hostname
    );
  }
}
