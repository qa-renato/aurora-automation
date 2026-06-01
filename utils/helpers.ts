import { Page, Locator } from '@playwright/test';
import logger from './logger';

// ─── Esperas ──────────────────────────────────────────────────────────────────

export async function waitForElement(locator: Locator, timeout = 10000): Promise<void> {
  await locator.waitFor({ state: 'visible', timeout });
}

export async function waitForElementHidden(locator: Locator, timeout = 10000): Promise<void> {
  await locator.waitFor({ state: 'hidden', timeout });
}

export async function waitForNavigation(
  page: Page,
  urlPattern: string | RegExp,
  timeout = 30000
): Promise<void> {
  await page.waitForURL(urlPattern, { timeout });
  logger.info(`Navegação concluída: ${page.url()}`);
}

// ─── Interações ───────────────────────────────────────────────────────────────

export async function isElementPresent(locator: Locator): Promise<boolean> {
  return locator.isVisible().catch(() => false);
}

export async function clearAndFill(locator: Locator, value: string): Promise<void> {
  await locator.clear();
  await locator.fill(value);
}

export async function retryAction(
  action: () => Promise<void>,
  retries = 3,
  delayMs = 1000
): Promise<void> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await action();
      return;
    } catch (error) {
      lastError = error as Error;
      logger.warn(`Tentativa ${attempt}/${retries} falhou: ${lastError.message}`);
      await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
    }
  }

  throw lastError;
}

// ─── Dados ────────────────────────────────────────────────────────────────────

export function generateTimestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

export function generateUniqueEmail(prefix: string, domain = 'test.aurora.com'): string {
  return `${prefix}+${Date.now()}@${domain}`;
}

export function maskSensitiveData(text: string): string {
  return text.replace(/(password|senha|secret|token|credential)[^,\s]*/gi, '***');
}

// ─── URL ──────────────────────────────────────────────────────────────────────

export function extractBaseUrl(url: string): string {
  try {
    const { protocol, hostname } = new URL(url);
    return `${protocol}//${hostname}`;
  } catch {
    return url;
  }
}

export function isOnPage(currentUrl: string, expectedHost: string): boolean {
  try {
    return new URL(currentUrl).hostname.includes(expectedHost);
  } catch {
    return currentUrl.includes(expectedHost);
  }
}

// ─── Formatação ───────────────────────────────────────────────────────────────

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
}
