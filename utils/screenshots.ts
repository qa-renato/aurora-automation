import { Page, TestInfo } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import logger from './logger';

const screenshotsDir = path.join(process.cwd(), 'reports', 'screenshots');

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-z0-9-_]/gi, '_').toLowerCase();
}

function buildTimestamp(): string {
  return new Date().toISOString().replace(/:/g, '-').replace('.', '-');
}

export async function takeScreenshot(
  page: Page,
  name: string,
  fullPage = true
): Promise<string> {
  ensureDir(screenshotsDir);

  const fileName = `${sanitizeFileName(name)}-${buildTimestamp()}.png`;
  const filePath = path.join(screenshotsDir, fileName);

  await page.screenshot({ path: filePath, fullPage });
  logger.info(`Screenshot salvo: ${filePath}`);

  return filePath;
}

export async function takeScreenshotOnFailure(
  page: Page,
  testInfo: TestInfo
): Promise<void> {
  if (testInfo.status !== 'passed') {
    const testName = sanitizeFileName(testInfo.title);
    const filePath = await takeScreenshot(page, `failure-${testName}`);
    await testInfo.attach('screenshot-on-failure', {
      path: filePath,
      contentType: 'image/png',
    });
    logger.warn(`Screenshot de falha anexado: ${filePath}`);
  }
}

export async function takeEvidenceScreenshot(
  page: Page,
  testInfo: TestInfo,
  label: string
): Promise<void> {
  ensureDir(screenshotsDir);

  const testName = sanitizeFileName(testInfo.title);
  const fileName = `${testName}-${sanitizeFileName(label)}-${buildTimestamp()}.png`;
  const filePath = path.join(screenshotsDir, fileName);

  await page.screenshot({ path: filePath, fullPage: true });
  await testInfo.attach(`evidence-${label}`, {
    path: filePath,
    contentType: 'image/png',
  });

  logger.info(`Evidência "${label}" salva: ${filePath}`);
}
