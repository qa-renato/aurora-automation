import { test, expect, APIRequestContext } from '@playwright/test';
import { criarApiContext } from './_apiAuth';

// ─── Contrato da API de Colaboradores (leitura) ─────────────────────────────
// `GET /colaboradores` → { data[], page, limit, total }. Suporta server-side:
//   • paginação: ?page=&limit=
//   • busca: ?search=  (atenção: só `search` funciona — q/nome/busca/filter são ignorados)
//   • filtro: ?departamento=
// Guarda um bug novo: o filtro ?ativo= retorna 0 para qualquer valor.
// (Sem mutação de dados — apenas leitura. Testes de escrita ficam à parte.)

const CAMPOS_ITEM = ['id', 'nome', 'email', 'cpf', 'departamento', 'cargo', 'ativo'];

test.describe('Contrato de API — Colaboradores', () => {
  let api: APIRequestContext;
  let totalGeral = 0;

  test.beforeAll(async ({ browser }) => {
    ({ api } = await criarApiContext(browser));
    totalGeral = (await (await api.get('/colaboradores')).json()).total;
  });
  test.afterAll(async () => {
    await api?.dispose();
  });

  test('CC-API-01 — GET /colaboradores devolve { data[], page, limit, total }', async () => {
    const res = await api.get('/colaboradores');
    expect(res.status()).toBe(200);
    const j = await res.json();
    expect(Array.isArray(j.data)).toBeTruthy();
    expect(typeof j.page).toBe('number');
    expect(typeof j.limit).toBe('number');
    expect(j.total).toBeGreaterThan(0);
    expect(j.data.length).toBeLessThanOrEqual(j.limit);
  });

  test('CC-API-02 — cada colaborador traz os campos essenciais', async () => {
    const j = await (await api.get('/colaboradores?limit=1')).json();
    const item = j.data[0];
    for (const campo of CAMPOS_ITEM) {
      expect(item, `campo "${campo}" ausente`).toHaveProperty(campo);
    }
  });

  test('CC-API-03 — paginação honra page e limit', async () => {
    const j = await (await api.get('/colaboradores?page=2&limit=10')).json();
    expect(j.page).toBe(2);
    expect(j.limit).toBe(10);
    expect(j.data.length).toBe(10);
    // o total não muda com a paginação
    expect(j.total).toBe(totalGeral);
  });

  test('CC-API-04 — limit controla o tamanho da página (total constante)', async () => {
    const j5 = await (await api.get('/colaboradores?limit=5')).json();
    expect(j5.data.length).toBe(5);
    expect(j5.total).toBe(totalGeral);
  });

  test('CC-API-05 — busca server-side (?search=) filtra os resultados', async () => {
    const j = await (await api.get('/colaboradores?search=Bruno')).json();
    expect(j.total).toBeGreaterThan(0);
    expect(j.total).toBeLessThan(totalGeral);
    // os resultados de fato batem com o termo (nome ou e-mail)
    for (const c of j.data) {
      expect(`${c.nome} ${c.email}`.toLowerCase()).toContain('bruno');
    }
  });

  test('CC-API-06 — filtro por departamento retorna só o departamento pedido', async () => {
    const j = await (await api.get('/colaboradores?departamento=Financeiro')).json();
    expect(j.total).toBeGreaterThan(0);
    expect(j.total).toBeLessThan(totalGeral);
    for (const c of j.data) {
      expect(c.departamento).toBe('Financeiro');
    }
  });

  test('CC-API-07 — busca inexistente devolve lista vazia (não erro)', async () => {
    const res = await api.get('/colaboradores?search=zzzznaoexiste123');
    expect(res.status()).toBe(200);
    const j = await res.json();
    expect(j.total).toBe(0);
    expect(j.data).toHaveLength(0);
  });

  // BUG #697 — o filtro ?ativo= retorna 0 para QUALQUER valor (true/false/1/0/
  // Ativo), embora existam 116 colaboradores (ativos e inativos). O filtro de
  // status está quebrado. Afirma o comportamento CORRETO (ativo=true traz os
  // ativos) → falha enquanto o bug existir.
  test.fail('CC-API-08 — filtro ?ativo=true deveria retornar colaboradores ativos [BUG #697]', async () => {
    const j = await (await api.get('/colaboradores?ativo=true')).json();
    expect(j.total, 'deveria haver colaboradores ativos').toBeGreaterThan(0);
    for (const c of j.data) expect(c.ativo).toBe(true);
  });
});
