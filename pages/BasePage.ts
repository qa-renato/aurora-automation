import { Page, Locator } from '@playwright/test';
import logger from '../utils/logger';
import { takeScreenshot } from '../utils/screenshots';

export abstract class BasePage {
  protected readonly page: Page;
  protected abstract readonly pageUrl: string;

  constructor(page: Page) {
    this.page = page;
  }

  async navigate(): Promise<void> {
    logger.info(`Navegando para: ${this.pageUrl}`);
    await this.page.goto(this.pageUrl);
    await this.waitForPageLoad();
  }

  async waitForPageLoad(): Promise<void> {
    // 'networkidle' falha em SPAs com polling — usar 'load' como padrão
    await this.page.waitForLoadState('load');
  }

  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  async takeScreenshot(name: string): Promise<string> {
    return await takeScreenshot(this.page, name);
  }

  async waitForElement(locator: Locator, timeout = 10000): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  async isElementVisible(locator: Locator): Promise<boolean> {
    return await locator.isVisible().catch(() => false);
  }

  async isElementEnabled(locator: Locator): Promise<boolean> {
    return await locator.isEnabled().catch(() => false);
  }

  async clearAndFill(locator: Locator, value: string): Promise<void> {
    await locator.clear();
    await locator.fill(value);
  }

  async clickWithRetry(locator: Locator, maxRetries = 3): Promise<void> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await locator.click();
        return;
      } catch (error) {
        lastError = error as Error;
        logger.warn(`Tentativa ${attempt}/${maxRetries} de click falhou: ${lastError.message}`);
        await this.page.waitForTimeout(500 * attempt);
      }
    }

    throw lastError;
  }

  async scrollToElement(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  async getTextContent(locator: Locator): Promise<string> {
    return (await locator.textContent()) ?? '';
  }

  async waitForUrl(urlPattern: string | RegExp, timeout = 30000): Promise<void> {
    await this.page.waitForURL(urlPattern, { timeout });
    logger.info(`URL atual: ${this.page.url()}`);
  }
}
