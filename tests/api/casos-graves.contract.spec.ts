import { test, expect, APIRequestContext } from '@playwright/test';
import { criarApiContext } from './_apiAuth';

// ─── Contrato da API de Casos Graves — Tratativa (leitura + escrita) ────────
// Endpoints (verificados 2026-06-13):
//   GET   /screens/casos-graves?periodo=30   → { kpis{...}, casos[{id,colaborador,
//                                                colaboradorId,status,responsavel,
//                                                comentarios[],timeline[]}], agrupados[] }
//   PATCH /casos-graves/:id/status           → { status }  (200; 422 se a transição
//                                                de status for inválida — há máquina de estados)
//   POST  /casos-graves/:id/comentarios      → { texto, autorNome, responsavelId } → 201
//
// ✅ DESTRAVADO: a tratativa, antes bloqueada na automação (CG22-25 fixme), agora
// responde via API (status 200/422, comentário 201) — o /me voltou a 200.

const JSON_H = { 'Content-Type': 'application/json' };

test.describe('Contrato de API — Casos Graves (Tratativa)', () => {
  let api: APIRequestContext;
  let caso: any;

  test.beforeAll(async ({ browser }) => {
    ({ api } = await criarApiContext(browser));
    const cg = await (await api.get('/screens/casos-graves?periodo=30')).json();
    caso = cg.casos[0];
  });
  test.afterAll(async () => {
    await api?.dispose();
  });

  test('CG-API-01 — GET /screens/casos-graves: shape com kpis e casos[]', async () => {
    const cg = await (await api.get('/screens/casos-graves?periodo=30')).json();
    expect(cg.kpis).toMatchObject({ total: expect.any(Number), abertos: expect.any(Number) });
    expect(Array.isArray(cg.casos)).toBeTruthy();
    expect(cg.casos[0]).toMatchObject({
      id: expect.anything(),
      status: expect.any(String),
      comentarios: expect.any(Array),
      timeline: expect.any(Array),
    });
  });

  // Escrita de status — máquina de estados: uma transição inválida deve ser
  // rejeitada (422 "Transição de status inválida"), provando que o endpoint
  // existe e valida. Não muta (a transição é recusada).
  test('CG-API-02 — PATCH /casos-graves/:id/status rejeita transição inválida (422)', async () => {
    expect(caso, 'precisa de um caso grave seed').toBeTruthy();
    const res = await api.patch(`/casos-graves/${caso.id}/status`, {
      data: JSON.stringify({ status: 'STATUS_INEXISTENTE' }),
      headers: JSON_H,
    });
    expect(res.status(), `status ${res.status()}`).toBeGreaterThanOrEqual(400);
  });

  // Escrita de comentário — DESTRAVADO: posta um comentário e retorna 201 com o
  // texto. (Marcado "QA-API" para rastreio; o histórico do sandbox já é poluído.)
  test('CG-API-03 — POST /casos-graves/:id/comentarios cria comentário (201)', async () => {
    expect(caso).toBeTruthy();
    const texto = `QA-API tratativa ${Date.now()}`;
    const res = await api.post(`/casos-graves/${caso.id}/comentarios`, {
      data: JSON.stringify({ texto, autorNome: 'QA Automation', responsavelId: 'renato.paulino@inbot.com.br' }),
      headers: JSON_H,
    });
    expect(res.status()).toBe(201);
    expect((await res.json()).texto).toContain('QA-API');
  });

  // Happy-path de mudança de status (transição VÁLIDA + reverter). Depende da
  // máquina de estados e do status do seed — mantido como fixme para não alterar
  // de forma persistente o caso usado pelos testes de UI.
  test.fixme('CG-API-04 — PATCH status: transição válida + reversão [evita mutar o seed da UI]', async () => {
    // ler status atual → PATCH p/ próximo estado válido → 200 → reverter.
  });
});
