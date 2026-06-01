import { test, expect, captureEvidenceOnFailure } from '../../fixtures/test-fixtures';
import { getCredentials } from '../../config/credentials';
import { getEnvironmentConfig } from '../../config/environments';
import { takeEvidenceScreenshot } from '../../utils/screenshots';
import logger from '../../utils/logger';

// ─── NOTA SOBRE ESTRATÉGIA DE AUTENTICAÇÃO ───────────────────────────────────
// A Aurora está protegida pela Vercel Deployment Protection.
// Testes que limpam completamente os cookies ficam bloqueados em vercel.com/login.
// Solução: manter os cookies Vercel (via storageState) e forçar re-autenticação
// Keycloak com prompt=login, que exige senha Microsoft + MFA.
//
// Testes abaixo usam o storageState completo (não limpam cookies Vercel).
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Login — Autenticação Aurora (Keycloak → Microsoft → MFA)', () => {

  test.afterEach(async ({ page }, testInfo) => {
    await captureEvidenceOnFailure(page, testInfo);
  });

  // ─── Teste 1: Sessão ativa — Aurora carrega sem re-login ─────────────────
  test('deve carregar o painel Aurora com sessão autenticada', async ({
    dashboardPage,
    page,
  }, testInfo) => {
    const envConfig = getEnvironmentConfig();

    logger.info(`[${testInfo.title}] Iniciando`);

    await page.goto(envConfig.baseUrl);
    await page.waitForLoadState('networkidle');

    // Deve estar na Aurora (sessão válida via storageState)
    await dashboardPage.validateSuccessfulLogin();
    await dashboardPage.waitForDashboardLoad();

    await takeEvidenceScreenshot(page, testInfo, 'sessao-autenticada');
    logger.info(`[${testInfo.title}] Concluído`);
  });

  // ─── Teste 2: Re-autenticação completa via prompt=login ──────────────────
  // Requer aprovação manual no Microsoft Authenticator.
  test('deve realizar re-autenticação completa (Keycloak → Microsoft → MFA)', async ({
    loginPage,
    dashboardPage,
    page,
  }, testInfo) => {
    test.setTimeout(180000);
    const credentials = getCredentials();
    const envConfig = getEnvironmentConfig();

    logger.info(`[${testInfo.title}] Iniciando re-autenticação forçada`);

    // Forçar login mesmo com sessão ativa (prompt=login)
    const keycloakForceLoginUrl =
      `https://keycloak.staging.e-auth.cloud/realms/stg-inprofile/protocol/openid-connect/auth` +
      `?client_id=app-admin` +
      `&redirect_uri=${encodeURIComponent(envConfig.baseUrl + '/')}` +
      `&response_type=code&scope=openid&prompt=login`;

    await page.goto(keycloakForceLoginUrl);
    await page.waitForLoadState('networkidle');

    // Detectar onde estamos: Keycloak direto (com senha) ou Microsoft
    const currentUrl = page.url();
    logger.info(`URL após force-login: ${currentUrl}`);

    if (currentUrl.includes('microsoftonline')) {
      // Keycloak redirecionou direto ao Microsoft — preencher email
      await page.locator('#i0116').waitFor({ state: 'visible', timeout: 15000 });
      await page.locator('#i0116').fill(credentials.email);
      await page.locator('#idSIButton9').click();
      await page.waitForLoadState('networkidle');
    }

    if (currentUrl.includes('keycloak') || page.url().includes('keycloak')) {
      // Está na tela de senha do Keycloak (re-auth)
      await page.locator('#password').waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    }

    // Se Microsoft password step
    if (page.url().includes('microsoftonline')) {
      await page.locator('#i0118').waitFor({ state: 'visible', timeout: 15000 });
      await page.locator('#i0118').fill(credentials.password);
      await page.locator('#idSIButton9').click();
      logger.info('[Microsoft] Senha submetida — aguardando MFA (até 120s)');
    }

    // Aguardar MFA e redirect final
    const hostname = new URL(envConfig.baseUrl).hostname;
    await page.waitForURL(
      url => url.hostname === hostname || url.href.includes('kmsi'),
      { timeout: 120000 }
    );
    if (!page.url().includes(hostname)) {
      await page.locator('#idSIButton9').click();
      await page.waitForURL(url => url.hostname === hostname, { timeout: 30000 });
    }

    await dashboardPage.validateSuccessfulLogin();
    await takeEvidenceScreenshot(page, testInfo, 're-autenticacao-sucesso');
    logger.info(`[${testInfo.title}] Concluído`);
  });

  // ─── Teste 3: Verificar elementos do dashboard pós-login ─────────────────
  test('deve exibir elementos do dashboard após autenticação', async ({
    dashboardPage,
    page,
  }, testInfo) => {
    const envConfig = getEnvironmentConfig();

    await page.goto(envConfig.baseUrl);
    await dashboardPage.waitForDashboardLoad();

    // Validar URL
    await dashboardPage.validateSuccessfulLogin();

    // Validar que sidebar está presente
    await dashboardPage.validateDashboardElements();

    await takeEvidenceScreenshot(page, testInfo, 'dashboard-elementos');
    logger.info(`[${testInfo.title}] Concluído`);
  });

});
