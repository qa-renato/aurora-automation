import { test, expect, request as pwRequest, APIRequestContext, Browser } from '@playwright/test';
import * as path from 'path';
import { getEnvironmentConfig } from '../../config/environments';

// ─── RBAC / contrato de permissões (nível API) ──────────────────────────────
// Verifica que TODA permissão de leitura concedida no `/me.capabilities` é
// DE FATO honrada pelo endpoint correspondente — i.e., o backend não devolve
// 401/403 para algo que o próprio sistema declara autorizado.
//
// Foi exatamente assim que o BUG #688 se manifestou: o perfil `direcao` tem
// `auditoria.read` no /me, mas `GET /auditoria` responde 403 "Acesso negado".
// Esse cruzamento pega automaticamente qualquer caso desse tipo (capability
// concedida × endpoint que nega).
//
// Auth: o app autentica a API (`aurora-api-sandbox.inbot.com.br`) com um token
// Bearer obtido em runtime (não persistido). Capturamos o header `Authorization`
// de uma requisição real do app autenticado e o reusamos via APIRequestContext.

const AUTH_FILE = path.join(__dirname, '..', '..', 'auth', 'storageState.json');
const APP_URL = getEnvironmentConfig().baseUrl;
// host do backend Aurora (≠ apiUrl do config, que aponta p/ o /api do vercel)
const API_BASE = 'https://aurora-api-sandbox.inbot.com.br';

// Mapa permissão(read) → endpoint GET que ela habilita (verificado em 2026-06-12).
type Regra = { cap: string; endpoint: string; bug?: string };
const REGRAS: Regra[] = [
  { cap: 'colaborador.read', endpoint: '/colaboradores' },
  { cap: 'pedido.read', endpoint: '/pedidos' },
  { cap: 'relatorio.individual.read', endpoint: '/screens/relatorios/protocolo/bai' },
  { cap: 'relatorio.copsoq.read', endpoint: '/screens/relatorios/protocolo/copsoq' },
  { cap: 'relatorio.consolidado.read', endpoint: '/screens/relatorios/consolidado' },
  { cap: 'relatorio.adesao.read', endpoint: '/pedidos/lotes' },
  { cap: 'metricas-ia.read', endpoint: '/screens/metricas-ia?periodo=7' },
  { cap: 'caso-grave.read', endpoint: '/screens/casos-graves?periodo=30' },
  { cap: 'kpi.read', endpoint: '/screens/dashboard' },
  { cap: 'configuracao.read', endpoint: '/configuracoes' },
  { cap: 'configuracao.provisioning.read', endpoint: '/configuracoes/provisioning/status' },
  // BUG #688 — capability concedida, endpoint nega com 403 "Acesso negado".
  { cap: 'auditoria.read', endpoint: '/auditoria', bug: '#688' },
];

/** Abre o app autenticado e captura o token Bearer + as capabilities do /me. */
async function capturarAuth(browser: Browser): Promise<{ token: string; capabilities: string[] }> {
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

test.describe('RBAC — permissões concedidas devem ser honradas pelos endpoints', () => {
  let api: APIRequestContext;
  let capabilities: string[] = [];
  let token = '';

  test.beforeAll(async ({ browser }) => {
    ({ token, capabilities } = await capturarAuth(browser));
    api = await pwRequest.newContext({
      baseURL: API_BASE,
      extraHTTPHeaders: { Authorization: token },
    });
  });

  test.afterAll(async () => {
    await api?.dispose();
  });

  test('RBAC00 — /me deve retornar a lista de permissões (capabilities)', () => {
    expect(capabilities.length, 'capabilities não vazias').toBeGreaterThan(0);
    expect(capabilities).toContain('auditoria.read');
  });

  for (const { cap, endpoint, bug } of REGRAS) {
    const titulo = `RBAC ${cap} → GET ${endpoint} não deve ser negado (perfil tem a permissão)${bug ? ` [BUG ${bug}]` : ''}`;
    const corpo = async () => {
      // pré-condição: a permissão está de fato concedida ao perfil
      expect(capabilities, `perfil deveria ter ${cap}`).toContain(cap);
      const res = await api.get(endpoint);
      // comportamento CORRETO: endpoint NÃO nega algo autorizado
      expect([401, 403], `status ${res.status()} em GET ${endpoint}`).not.toContain(res.status());
    };
    if (bug) test.fail(titulo, corpo);
    else test(titulo, corpo);
  }
});
