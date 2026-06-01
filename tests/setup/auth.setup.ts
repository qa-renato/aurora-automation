import { test as setup, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import logger from '../../utils/logger';
import { getCredentials } from '../../config/credentials';
import { getEnvironmentConfig } from '../../config/environments';

// Fluxo real: Aurora → Keycloak (#username/#kc-login) → Microsoft (#i0116/#i0118/#idSIButton9) → MFA → Aurora
const AUTH_FILE = path.join(process.cwd(), 'auth', 'storageState.json');

setup('autenticar e salvar sessão', async ({ page }) => {
  const credentials = getCredentials();
  const envConfig = getEnvironmentConfig();
  const appHostname = new URL(envConfig.baseUrl).hostname;

  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });

  logger.info('=== SETUP: Iniciando autenticação ===');

  // ── Verificar se já há sessão válida (cookies do storageState) ───────────
  await page.goto(envConfig.baseUrl);
  await page.waitForLoadState('networkidle');

  if (page.url().includes(appHostname)) {
    logger.info('Sessão ainda válida — salvando storageState atualizado');
    await page.context().storageState({ path: AUTH_FILE });
    logger.info(`StorageState salvo: ${AUTH_FILE}`);
    logger.info('=== SETUP: Concluído (sessão reutilizada) ===');
    return;
  }

  // ── Se redirecionou para Vercel login, não conseguimos autenticar automaticamente ─
  if (page.url().includes('vercel.com/login')) {
    throw new Error(
      'Bloqueado pela Vercel Deployment Protection. ' +
      'Execute o script manual de login (scripts/manual-login.ts) e salve o storageState, ' +
      'ou configure VERCEL_BYPASS_SECRET no .env.'
    );
  }

  // ── Step 1: Aurora → Keycloak ────────────────────────────────────────────
  if (!page.url().includes('keycloak')) {
    await page.goto(envConfig.baseUrl);
    await page.waitForURL(/keycloak/, { timeout: 30000 });
  }
  logger.info('Keycloak carregado');

  await page.locator('#username').waitFor({ state: 'visible', timeout: 15000 });
  await page.locator('#username').fill(credentials.email);
  await page.locator('#kc-login').click();
  logger.info('[Keycloak] Sign In clicado');

  // ── Step 2: Microsoft — e-mail ───────────────────────────────────────────
  await page.waitForURL(/microsoftonline/, { timeout: 30000 });
  logger.info('Microsoft login carregado');

  await page.locator('#i0116').waitFor({ state: 'visible', timeout: 15000 });
  await page.locator('#i0116').fill(credentials.email);
  await page.locator('#idSIButton9').click();
  await page.waitForLoadState('networkidle');
  logger.info('[Microsoft] E-mail preenchido, Avançar clicado');

  // ── Step 3: Microsoft — senha ────────────────────────────────────────────
  await page.locator('#i0118').waitFor({ state: 'visible', timeout: 15000 });
  await page.locator('#i0118').fill(credentials.password);
  await page.locator('#idSIButton9').click();
  logger.info('[Microsoft] Senha preenchida, Entrar clicado');

  // ── Step 4: Aguardar MFA e redirect para Aurora ──────────────────────────
  // MFA via Microsoft Authenticator: aprovação manual necessária.
  // Timeout de 120s para acomodar a interação do usuário.
  logger.info('[MFA] Aguardando aprovação no Microsoft Authenticator (até 120s)...');

  await page.waitForURL(
    url => url.hostname === appHostname || url.href.includes('kmsi'),
    { timeout: 120000 }
  );

  // ── Step 5: "Continuar conectado?" (opcional) ────────────────────────────
  if (!page.url().includes(appHostname)) {
    logger.info('[Microsoft] Página "Continuar conectado?" – clicando Sim');
    await page.locator('#idSIButton9').click();
    await page.waitForURL(url => url.hostname === appHostname, { timeout: 30000 });
  }

  logger.info(`Autenticado: ${page.url()}`);

  // ── Step 6: Validar que estamos na Aurora ────────────────────────────────
  await expect(page).toHaveURL(new RegExp(appHostname.replace(/\./g, '\\.')));

  // ── Step 7: Salvar storageState ──────────────────────────────────────────
  await page.context().storageState({ path: AUTH_FILE });
  logger.info(`StorageState salvo: ${AUTH_FILE}`);
  logger.info('=== SETUP: Concluído ===');
});
