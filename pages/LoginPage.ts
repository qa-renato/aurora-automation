import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import logger from '../utils/logger';
import { getEnvironmentConfig } from '../config/environments';

// ─── Fluxo real verificado via MCP Playwright ────────────────────────────────
//
// Aurora → Keycloak (step 1: email) → Microsoft Azure AD (step 2: email, step 3: senha+MFA)
//
// Step 1 – Keycloak:
//   input#username         (email)
//   button#kc-login        ("Sign In")
//
// Step 2 – Microsoft (email):
//   input#i0116            (email, name="loginfmt")
//   input#idSIButton9      (submit, value="Avançar")
//
// Step 3 – Microsoft (senha):
//   input#i0118            (password, name="passwd")
//   input#idSIButton9      (submit, value="Entrar")
//
// Step 4 – MFA:
//   Microsoft Authenticator (aprovação manual) → redirect para Aurora
//
// ─────────────────────────────────────────────────────────────────────────────

export class LoginPage extends BasePage {
  protected readonly pageUrl: string;

  // ─── Keycloak ─────────────────────────────────────────────────────────────
  private readonly kcEmailInput: Locator;
  private readonly kcSubmitButton: Locator;
  private readonly kcErrorMessage: Locator;

  // ─── Microsoft Azure AD ───────────────────────────────────────────────────
  private readonly msEmailInput: Locator;
  private readonly msPasswordInput: Locator;
  private readonly msSubmitButton: Locator;
  private readonly msErrorText: Locator;

  constructor(page: Page) {
    super(page);
    const envConfig = getEnvironmentConfig();
    this.pageUrl = envConfig.baseUrl;

    // Keycloak – IDs verificados via DOM inspection
    this.kcEmailInput = page.locator('#username');
    this.kcSubmitButton = page.locator('#kc-login');
    this.kcErrorMessage = page.locator(
      '#input-error-password, #input-error-container-password, .kc-feedback-text'
    );

    // Microsoft – IDs verificados via DOM inspection
    this.msEmailInput = page.locator('#i0116');
    this.msPasswordInput = page.locator('#i0118');
    this.msSubmitButton = page.locator('#idSIButton9');
    this.msErrorText = page.locator('#errorText, [id*="Error"]:not([type="hidden"])');
  }

  // ─── Navegação ───────────────────────────────────────────────────────────────

  async navigate(): Promise<void> {
    logger.info(`Acessando Aurora: ${this.pageUrl}`);
    await this.page.goto(this.pageUrl);
    await this.waitForKeycloakLoginPage();
  }

  async waitForKeycloakLoginPage(): Promise<void> {
    await this.page.waitForURL(/keycloak/, { timeout: 30000 });
    await this.kcEmailInput.waitFor({ state: 'visible', timeout: 15000 });
    logger.info(`Keycloak carregado: ${this.page.url()}`);
  }

  async waitForMicrosoftLoginPage(): Promise<void> {
    await this.page.waitForURL(/microsoftonline/, { timeout: 30000 });
    await this.msEmailInput.waitFor({ state: 'visible', timeout: 15000 });
    logger.info(`Microsoft login carregado: ${this.page.url()}`);
  }

  // ─── Step 1: Keycloak ────────────────────────────────────────────────────────

  async fillEmail(email: string): Promise<void> {
    logger.info(`[Keycloak] Preenchendo e-mail: ${email}`);
    await this.kcEmailInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.kcEmailInput.fill(email);
  }

  async clickSignIn(): Promise<void> {
    logger.info('[Keycloak] Clicando Sign In → aguardando redirect Microsoft');
    await this.kcSubmitButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.kcSubmitButton.click();
    await this.page.waitForURL(/microsoftonline/, { timeout: 30000 });
  }

  // ─── Step 2: Microsoft email ──────────────────────────────────────────────────

  async fillMicrosoftEmail(email: string): Promise<void> {
    logger.info(`[Microsoft] Preenchendo e-mail: ${email}`);
    await this.msEmailInput.waitFor({ state: 'visible', timeout: 15000 });
    await this.msEmailInput.fill(email);
  }

  async clickAvancar(): Promise<void> {
    logger.info('[Microsoft] Clicando Avançar');
    await this.msSubmitButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.msSubmitButton.click();
    await this.page.waitForLoadState('load');
  }

  // ─── Step 3: Microsoft senha ──────────────────────────────────────────────────

  async fillPassword(password: string): Promise<void> {
    logger.info('[Microsoft] Preenchendo senha');
    await this.msPasswordInput.waitFor({ state: 'visible', timeout: 15000 });
    await this.msPasswordInput.fill(password);
  }

  async clickEntrar(): Promise<void> {
    logger.info('[Microsoft] Clicando Entrar → aguardando MFA ou redirect');
    await this.msSubmitButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.msSubmitButton.click();
  }

  // ─── Fluxo completo ───────────────────────────────────────────────────────────

  async login(email: string, password: string, mfaTimeoutMs = 120000): Promise<void> {
    logger.info(`Iniciando login completo para: ${email}`);

    // Step 1: Keycloak
    await this.fillEmail(email);
    await this.clickSignIn();

    // Step 2: Microsoft — e-mail
    await this.fillMicrosoftEmail(email);
    await this.clickAvancar();

    // Step 3: Microsoft — senha
    await this.fillPassword(password);
    await this.clickEntrar();

    // Step 4: Aguardar MFA e redirect final para Aurora
    // Se o MFA estiver habilitado, requer aprovação manual no Microsoft Authenticator.
    // Timeout de 120s para acomodar a aprovação interativa.
    await this.waitForLoginSuccess(this.pageUrl, mfaTimeoutMs);
  }

  // ─── Esperas e validações ──────────────────────────────────────────────────────

  async waitForLoginSuccess(baseUrl: string, timeout = 120000): Promise<void> {
    const hostname = new URL(baseUrl).hostname;
    logger.info(`Aguardando redirect para ${hostname} (timeout ${timeout}ms)`);

    // Aguarda URL de Aurora OU página "Continuar conectado?" (KMSI) do Microsoft
    await this.page.waitForURL(
      url => url.hostname === hostname || url.href.includes('kmsi'),
      { timeout }
    );

    // Se parou na página "Continuar conectado?", clicar em "Sim"
    if (!this.page.url().includes(hostname)) {
      logger.info('[Microsoft] Página "Continuar conectado?" detectada – clicando Sim');
      await this.msSubmitButton.click();
      await this.page.waitForURL(url => url.hostname === hostname, { timeout: 30000 });
    }

    logger.info(`Login concluído – URL: ${this.page.url()}`);
  }

  async getErrorMessage(): Promise<string | null> {
    // Tenta primeiro o erro Keycloak, depois o erro Microsoft
    for (const locator of [this.kcErrorMessage, this.msErrorText]) {
      const isVisible = await locator.isVisible().catch(() => false);
      if (isVisible) {
        const text = await locator.textContent();
        return text?.trim() ?? null;
      }
    }
    return null;
  }

  async isLoginPageVisible(): Promise<boolean> {
    return this.kcEmailInput.isVisible().catch(() => false);
  }

  async getPageHeading(): Promise<string> {
    const h = this.page.locator('h1').first();
    const visible = await h.isVisible().catch(() => false);
    if (!visible) return '';
    return (await h.textContent())?.trim() ?? '';
  }
}
