import { Browser, request as pwRequest, APIRequestContext } from '@playwright/test';
import * as path from 'path';
import { getEnvironmentConfig } from '../../config/environments';

// Helper de autenticação para os testes de contrato/API.
// Não é um spec (sem .spec) → o Playwright não o coleta como teste.
//
// O app autentica a API (`aurora-api-sandbox.inbot.com.br`) com um token Bearer
// obtido em runtime e NÃO persistido (o storageState só tem cookies + prefs de
// UI). Por isso capturamos o header `Authorization` de uma requisição real do
// app autenticado e o reusamos num APIRequestContext.

export const AUTH_FILE = path.join(__dirname, '..', '..', 'auth', 'storageState.json');
export const APP_URL = getEnvironmentConfig().baseUrl;
// host do backend Aurora (≠ `apiUrl` do config, que aponta pro /api do vercel).
export const API_BASE = 'https://aurora-api-sandbox.inbot.com.br';

export async function capturarAuth(browser: Browser): Promise<{ token: string; capabilities: string[] }> {
  const ctx = await browser.newContext({ storageState: AUTH_FILE });
  const page = await ctx.newPage();
  let token = '';
  let capabilities: string[] = [];
  page.on('request', (r) => {
    if (/aurora-api/i.test(r.url())) {
      const h = r.headers()['authorization'];
      if (h && !token) token = h;
    }
  });
  page.on('response', async (r) => {
    if (/\/me(\?|$)/i.test(r.url())) {
      try {
        const j = await r.json();
        if (Array.isArray(j?.capabilities)) capabilities = j.capabilities;
      } catch {
        /* ignore */
      }
    }
  });
  await page.goto(APP_URL + '/', { waitUntil: 'load' });
  await page.waitForTimeout(5000);
  await ctx.close();
  if (!token) throw new Error('Não foi possível capturar o token Bearer do app.');
  return { token, capabilities };
}

/** Conveniência: já devolve um APIRequestContext autenticado + as capabilities. */
export async function criarApiContext(
  browser: Browser,
): Promise<{ api: APIRequestContext; capabilities: string[]; token: string }> {
  const { token, capabilities } = await capturarAuth(browser);
  const api = await pwRequest.newContext({
    baseURL: API_BASE,
    extraHTTPHeaders: { Authorization: token },
  });
  return { api, capabilities, token };
}
