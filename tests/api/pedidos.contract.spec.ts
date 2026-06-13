import { test, expect, APIRequestContext } from '@playwright/test';
import { criarApiContext } from './_apiAuth';

// ─── Contrato da API de Pedidos (leitura + escrita) ─────────────────────────
// Endpoints (verificados 2026-06-13):
//   GET  /pedidos          → { data:[{id,protocolo,colaboradorEmail,status,criadoEm,
//                              atendidoEm,entrevistaId}], page, limit, total }
//   GET  /pedidos/lotes    → [{ protocolo, data, total, atendidos, percentual }]
//   GET  /pedidos/adesao   → [{ protocolo, total, atendidos, percentual }]
//   POST /pedidos          → cria pedido INDIVIDUAL { colaboradorId, protocolo }
//                            (409 se já há pedido aberto do protocolo p/ o colaborador)
//   POST /pedidos/lote     → cria pedido EM LOTE p/ TODOS os ativos { protocolo }
//
// ⚠️ As escritas que MUTAM em massa não são executadas: o "Em Lote" cria pedidos
// para todos os colaboradores ativos (~150) e o happy-path individual depende da
// consistência eventual do cadastro — ambos ficam como fixme (documentados).

const JSON_H = { 'Content-Type': 'application/json' };

test.describe('Contrato de API — Pedidos', () => {
  let api: APIRequestContext;

  test.beforeAll(async ({ browser }) => {
    ({ api } = await criarApiContext(browser));
  });
  test.afterAll(async () => {
    await api?.dispose();
  });

  // ─── Leitura ──────────────────────────────────────────────────────────────
  test('PD-API-01 — GET /pedidos: { data[], page, limit, total } com o shape do item', async () => {
    const res = await api.get('/pedidos');
    expect(res.status()).toBe(200);
    const j = await res.json();
    expect(Array.isArray(j.data)).toBeTruthy();
    expect(typeof j.total).toBe('number');
    expect(j.data[0]).toMatchObject({
      id: expect.any(Number),
      protocolo: expect.any(String),
      colaboradorEmail: expect.any(String),
      status: expect.any(String),
    });
  });

  test('PD-API-02 — GET /pedidos/lotes: lista de lotes por protocolo', async () => {
    const res = await api.get('/pedidos/lotes');
    expect(res.status()).toBe(200);
    const j = await res.json();
    expect(Array.isArray(j)).toBeTruthy();
    expect(j[0]).toMatchObject({
      protocolo: expect.any(String),
      total: expect.any(Number),
      atendidos: expect.any(Number),
      percentual: expect.any(Number),
    });
  });

  test('PD-API-03 — GET /pedidos/adesao: adesão por protocolo', async () => {
    const res = await api.get('/pedidos/adesao');
    expect(res.status()).toBe(200);
    const j = await res.json();
    expect(Array.isArray(j)).toBeTruthy();
    expect(j[0]).toMatchObject({ protocolo: expect.any(String), percentual: expect.any(Number) });
  });

  test('PD-API-04 — GET /pedidos honra page e limit', async () => {
    const j = await (await api.get('/pedidos?page=2&limit=10')).json();
    expect(j.page).toBe(2);
    expect(j.limit).toBe(10);
    expect(j.data.length).toBeLessThanOrEqual(10);
  });

  // ─── Escrita (determinística, sem mutar em massa) ──────────────────────────
  // O endpoint de criação individual é funcional: para um pedido bem-formado ele
  // CRIA (201) ou rejeita por já existir aberto (409) — nunca erra. (colaborador
  // id 1 costuma já ter um BAI aberto → 409, sem criar nada.)
  test('PD-API-05 — POST /pedidos (individual) é um endpoint de criação funcional', async () => {
    const res = await api.post('/pedidos', {
      data: JSON.stringify({ colaboradorId: 1, protocolo: 'BAI' }),
      headers: JSON_H,
    });
    expect([201, 409], `status ${res.status()}`).toContain(res.status());
  });

  // BUG (validação) — POST /pedidos sem corpo deveria responder 400, mas retorna
  // 409 "Já existe um pedido aberto de undefined para undefined". Afirma o
  // CORRETO (400 de validação) → falha enquanto a validação for fraca.
  test.fail('PD-API-06 — POST /pedidos sem dados deveria validar com 400 [BUG validação]', async () => {
    const res = await api.post('/pedidos', { data: JSON.stringify({}), headers: JSON_H });
    expect(res.status()).toBe(400);
  });

  // BUG (erro 500) — POST /pedidos/lote com corpo inválido deveria responder 400,
  // mas retorna 500 Internal Server Error. Afirma o CORRETO → falha hoje.
  // (Não enviamos protocolo válido de propósito: isso criaria pedidos em massa.)
  test.fail('PD-API-07 — POST /pedidos/lote inválido deveria validar com 400, não 500 [BUG]', async () => {
    const res = await api.post('/pedidos/lote', { data: JSON.stringify({}), headers: JSON_H });
    expect(res.status()).toBe(400);
  });

  // Happy-path individual (201): criar para um colaborador SEM pedido aberto.
  // Bloqueado por consistência eventual do cadastro (id novo demora a ficar
  // utilizável). Executável sob demanda quando o ambiente estabilizar.
  test.fixme('PD-API-08 — POST /pedidos cria pedido individual (201) [bloqueado: consistência eventual]', async () => {
    // criar colaborador novo, obter id, POST /pedidos {colaboradorId, protocolo} → 201
  });

  // Em Lote (happy-path): NÃO executar — cria pedidos para TODOS os colaboradores
  // ativos (~150) no sandbox compartilhado. Mantido como fixme documentado.
  test.fixme('PD-API-09 — POST /pedidos/lote cria em lote [NÃO executar: mutação em massa]', async () => {
    // POST /pedidos/lote { protocolo } criaria pedidos p/ todos os ativos.
  });
});
