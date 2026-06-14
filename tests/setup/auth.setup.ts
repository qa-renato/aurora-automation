import { test as setup, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import logger from '../../utils/logger';
import { getCredentials } from '../../config/credentials';
import { getEnvironmentConfig } from '../../config/environments';

// Fluxo real (verificado):
//   Aurora → Keycloak (#username/#kc-login)
//     ├─ Sessão SSO Keycloak viva → volta DIRETO para Aurora (sem MFA)
//     └─ Sessão SSO morta → Microsoft (#i0116/#i0118) → MFA → Aurora
const AUTH_FILE = path.join(process.cwd(), 'auth', 'storageState.json');

setup('autenticar e salvar sessão', async ({ page }) => {
  setup.setTimeout(180000); // acomoda MFA interativo
  const credentials = getCredentials();
  const envConfig = getEnvironmentConfig();
  const appHostname = new URL(envConfig.baseUrl).hostname;
  const colaboradoresUrl = envConfig.baseUrl + '/colaboradores';

  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });

  // Helper: tabela visível = sessão genuinamente autenticada
  const tabelaVisivel = async (timeout: number): Promise<boolean> => {
    try {
      await page.locator('tbody tr').first().waitFor({ state: 'visible', timeout });
      return page.url().includes(appHostname);
    } catch {
      return false;
    }
  };

  const salvar = async (origem: string) => {
    await page.context().storageState({ path: AUTH_FILE });
    logger.info(`StorageState salvo (${origem}): ${AUTH_FILE}`);
    logger.info('=== SETUP: Concluído ===');
  };

  logger.info('=== SETUP: Verificando sessão ===');
  await page.goto(colaboradoresUrl);
  await page.waitForLoadState('load');

  // 1) Sessão Aurora já válida?
  if (await tabelaVisivel(15000)) {
    logger.info('Sessão Aurora válida');
    await salvar('sessão reutilizada');
    return;
  }

  // 2) Caiu no Keycloak — preencher e-mail e Sign In
  if (!page.url().includes('keycloak')) {
    await page.goto(colaboradoresUrl);
  }
  await page.locator('#username').waitFor({ state: 'visible', timeout: 15000 });

  // Keycloak (realm stg-inprofile) agora mostra um form NATIVO (username/senha local).
  // O usuário é FEDERADO (sem senha local) → usar o broker "inbot (microsoft)"
  // que delega para o Azure AD. Se o broker não existir, cai no #kc-login nativo.
  const brokerMicrosoft = page.getByRole('link', { name: /microsoft/i });
  if (await brokerMicrosoft.isVisible().catch(() => false)) {
    await brokerMicrosoft.click();
    logger.info('[Keycloak] Broker "inbot (microsoft)" clicado — indo para Azure AD');
  } else {
    await page.locator('#username').fill(credentials.email);
    await page.locator('#kc-login').click();
    logger.info('[Keycloak] Sign In nativo clicado — aguardando SSO ou Microsoft');
  }

  // 3) Race: ou volta direto para Aurora (SSO Keycloak vivo) ou vai para Microsoft
  await page.waitForURL(
    url => url.hostname === appHostname || /microsoftonline/.test(url.href),
    { timeout: 30000 }
  );

  // 3a) SSO Keycloak resolveu sozinho → tabela deve carregar
  if (page.url().includes(appHostname)) {
    logger.info('[Keycloak] SSO direto — sem MFA');
    if (await tabelaVisivel(60000)) {
      await salvar('SSO Keycloak');
      return;
    }
    throw new Error('Voltou para Aurora mas a tabela não carregou.');
  }

  // 3b) Microsoft — fluxo completo com MFA
  logger.info('[Microsoft] Re-autenticação completa necessária');
  await page.locator('#i0116').waitFor({ state: 'visible', timeout: 15000 });
  await page.locator('#i0116').fill(credentials.email);
  await page.locator('#idSIButton9').click();
  await page.waitForLoadState('load');

  await page.locator('#i0118').waitFor({ state: 'visible', timeout: 15000 });
  await page.locator('#i0118').fill(credentials.password);
  await page.locator('#idSIButton9').click();
  logger.info('[Microsoft] Senha enviada — aguardando MFA (até 120s)');

  await page.waitForURL(
    url => url.hostname === appHostname || url.href.includes('kmsi'),
    { timeout: 120000 }
  );
  if (!page.url().includes(appHostname)) {
    await page.locator('#idSIButton9').click(); // "Continuar conectado?"
    await page.waitForURL(url => url.hostname === appHostname, { timeout: 30000 });
  }

  if (await tabelaVisivel(60000)) {
    await expect(page).toHaveURL(new RegExp(appHostname.replace(/\./g, '\\.')));
    await salvar('MFA completo');
    return;
  }
  throw new Error('Autenticação concluída mas a tabela não carregou.');
});
