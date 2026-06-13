import { test, expect, APIRequestContext } from '@playwright/test';
import { criarApiContext } from './_apiAuth';

// ─── Contrato da API de Configurações (leitura + escrita) ───────────────────
// Endpoints (verificados 2026-06-13):
//   GET   /configuracoes                    → { botId, syncEnabled, intableApiKeyConfigured,
//                                               visual:{logoBase64,corPrincipal}, datasources[],
//                                               departamentos[], cargos[] }
//   GET   /configuracoes/campos/uso         → { departamentos:{nome:count}, cargos:{nome:count} }
//   GET   /configuracoes/provisioning/status→ { items[{id,status,actionable}],
//                                               tables[{tableName,exists,active,rowsCount,lastUpdated}] }
//   PATCH /configuracoes/visual             → atualiza visual (corPrincipal/logo); ecoa a config
//   PATCH /configuracoes/departamentos      → atualiza a lista de departamentos; ecoa a config
//
// As escritas são REVERSÍVEIS: capturamos o estado original no beforeAll e
// restauramos no afterAll; a verificação usa o corpo de resposta do PATCH
// (estado autoritativo), evitando depender de re-leitura.

const JSON_H = { 'Content-Type': 'application/json' };

test.describe('Contrato de API — Configurações', () => {
  let api: APIRequestContext;
  let original: any;

  test.beforeAll(async ({ browser }) => {
    ({ api } = await criarApiContext(browser));
    original = await (await api.get('/configuracoes')).json();
  });

  test.afterAll(async () => {
    // restaura visual e departamentos ao estado original (rede de segurança)
    if (original) {
      await api
        .patch('/configuracoes/visual', { data: JSON.stringify(original.visual), headers: JSON_H })
        .catch(() => {});
      await api
        .patch('/configuracoes/departamentos', {
          data: JSON.stringify({ departamentos: original.departamentos }),
          headers: JSON_H,
        })
        .catch(() => {});
    }
    await api?.dispose();
  });

  // ─── Leitura ──────────────────────────────────────────────────────────────
  test('CFG-API-01 — GET /configuracoes tem o shape esperado', async () => {
    const c = await (await api.get('/configuracoes')).json();
    expect(typeof c.botId).toBe('string');
    expect(typeof c.syncEnabled).toBe('boolean');
    expect(typeof c.intableApiKeyConfigured).toBe('boolean');
    expect(c.visual).toMatchObject({ corPrincipal: expect.any(String) });
    expect(Array.isArray(c.datasources)).toBeTruthy();
    expect(Array.isArray(c.departamentos)).toBeTruthy();
    expect(Array.isArray(c.cargos)).toBeTruthy();
  });

  test('CFG-API-02 — GET /configuracoes/campos/uso retorna contagens por depto/cargo', async () => {
    const res = await api.get('/configuracoes/campos/uso');
    expect(res.status()).toBe(200);
    const j = await res.json();
    expect(j.departamentos && typeof j.departamentos).toBe('object');
    expect(j.cargos && typeof j.cargos).toBe('object');
    const algumDepto = Object.values(j.departamentos)[0];
    expect(typeof algumDepto).toBe('number');
  });

  test('CFG-API-03 — GET /configuracoes/provisioning/status: items[] e tables[]', async () => {
    const res = await api.get('/configuracoes/provisioning/status');
    expect(res.status()).toBe(200);
    const j = await res.json();
    expect(Array.isArray(j.items)).toBeTruthy();
    expect(Array.isArray(j.tables)).toBeTruthy();
    expect(j.tables[0]).toMatchObject({
      tableName: expect.any(String),
      exists: expect.any(Boolean),
      active: expect.any(Boolean),
      rowsCount: expect.any(Number),
    });
  });

  // ─── Escrita ────────────────────────────────────────────────────────────────
  // O endpoint de escrita RESPONDE 200, mas o estado é o caminho-feliz a validar.
  test('CFG-API-04 — PATCH /configuracoes/visual responde 200', async () => {
    const res = await api.patch('/configuracoes/visual', {
      data: JSON.stringify({ logoBase64: original.visual.logoBase64, corPrincipal: '#123456' }),
      headers: JSON_H,
    });
    expect(res.status()).toBe(200);
  });

  test('CFG-API-05 — PATCH /configuracoes/departamentos responde 200', async () => {
    const res = await api.patch('/configuracoes/departamentos', {
      data: JSON.stringify({ departamentos: original.departamentos }),
      headers: JSON_H,
    });
    expect(res.status()).toBe(200);
  });

  // BUG NOVO — a escrita de configuração é um NO-OP: PATCH /configuracoes/visual
  // retorna 200 mas a `corPrincipal` NÃO muda (resposta e leituras subsequentes,
  // por >15s, mantêm o valor antigo). O "Salvar" da tela engana o usuário —
  // parece salvar, mas nada persiste. Afirma o CORRETO (a cor persiste) → falha
  // enquanto a escrita não tiver efeito.
  test.fail('CFG-API-06 — PATCH visual deveria PERSISTIR a nova cor [BUG #700]', async () => {
    const novaCor = '#123456';
    const r = await api.patch('/configuracoes/visual', {
      data: JSON.stringify({ logoBase64: original.visual.logoBase64, corPrincipal: novaCor }),
      headers: JSON_H,
    });
    expect((await r.json()).visual.corPrincipal).toBe(novaCor);
    // reverte (inócuo enquanto a escrita for no-op)
    await api.patch('/configuracoes/visual', { data: JSON.stringify(original.visual), headers: JSON_H }).catch(() => {});
  });

  // BUG NOVO (mesmo problema) — PATCH /configuracoes/departamentos retorna 200
  // mas o novo departamento não é incluído (write no-op).
  test.fail('CFG-API-07 — PATCH departamentos deveria PERSISTIR o novo depto [BUG #700]', async () => {
    const novo = `QA-CFG-${Date.now()}`;
    const r = await api.patch('/configuracoes/departamentos', {
      data: JSON.stringify({ departamentos: [...original.departamentos, novo] }),
      headers: JSON_H,
    });
    expect((await r.json()).departamentos).toContain(novo);
    await api
      .patch('/configuracoes/departamentos', { data: JSON.stringify({ departamentos: original.departamentos }), headers: JSON_H })
      .catch(() => {});
  });
});
