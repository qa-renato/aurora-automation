import { test, expect, APIRequestContext } from '@playwright/test';
import { criarApiContext } from './_apiAuth';

// ─── Contrato de validação de Colaboradores (nível API) ─────────────────────
// Guards de bugs de validação. Status verificado no sandbox em 2026-06-13.

function cpfValido(): string {
  const n = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
  const calc = (arr: number[]) => {
    let s = 0;
    for (let i = 0; i < arr.length; i++) s += arr[i] * (arr.length + 1 - i);
    const r = s % 11;
    return r < 2 ? 0 : 11 - r;
  };
  const d1 = calc(n);
  const d2 = calc([...n, d1]);
  const a = [...n, d1, d2];
  return `${a.slice(0, 3).join('')}.${a.slice(3, 6).join('')}.${a.slice(6, 9).join('')}-${d1}${d2}`;
}

function payload(over: Record<string, unknown> = {}) {
  const u = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  return {
    ativo: true,
    nome: `QA-VALIDACAO ${u}`,
    cpf: cpfValido(),
    email: `qa.val.${u}@aurora-demo.com.br`,
    dataNascimento: '1990-03-15',
    departamento: 'Financeiro',
    cargo: 'Analista Júnior',
    ...over,
  };
}

test.describe('Contrato de validação — Colaboradores', () => {
  let api: APIRequestContext;
  const criados: number[] = [];

  test.beforeAll(async ({ browser }) => {
    ({ api } = await criarApiContext(browser));
  });
  test.afterAll(async () => {
    for (const id of new Set(criados)) await api.delete('/colaboradores/' + id).catch(() => {});
    await api?.dispose();
  });

  // REGRESSÃO #482 — import com CPF sem máscara não deve mais derrubar a API
  // (antes: 503 Service Unavailable + erro de CORS). Hoje retorna erro tratado.
  test('CV-01 — import com CPF sem máscara retorna erro tratado, não 5xx [regressão #482]', async () => {
    const csv =
      'nome,cpf,email,departamento,cargo,dataNascimento,telefone,escolaridade,estadoCivil,genero\n' +
      `QA-VALIDACAO IMPORT,12345678900,qa.val.imp.${Date.now()}@aurora-demo.com.br,Financeiro,Analista Júnior,01/01/1990,,,,\n`;
    const res = await api.post('/colaboradores/import', {
      multipart: { file: { name: 'x.csv', mimeType: 'text/csv', buffer: Buffer.from(csv) } },
    });
    expect(res.status(), `status ${res.status()}`).toBeLessThan(500);
    // resposta tratada (JSON com a estrutura de erros), não um crash
    const j = await res.json().catch(() => null);
    expect(j, 'resposta deve ser JSON tratado').not.toBeNull();
  });

  // BUG #497 — uma data de nascimento VÁLIDA e no passado (ex.: 21/06/1983) é
  // recusada com "não pode ser no futuro" / "must be a Date instance". A API só
  // aceita ISO (yyyy-mm-dd); o formato dd/mm/yyyy que o front envia na edição
  // quebra. Afirma o CORRETO (data passada válida é aceita) → falha hoje.
  test.fail('CV-02 — data de nascimento passada válida deveria ser aceita [BUG #497]', async () => {
    const res = await api.post('/colaboradores', { data: payload({ dataNascimento: '21/06/1983' }) });
    if (res.status() === 201) criados.push((await res.json()).id);
    expect(res.status(), `status ${res.status()}`).toBeLessThan(400);
  });

  // BUG #493 — e-mail excedendo o tamanho retorna a mensagem genérica "email
  // must be an email", sem indicar que o problema é o TAMANHO. Afirma o CORRETO
  // (mensagem específica de tamanho) → falha enquanto for genérica.
  test.fail('CV-03 — e-mail muito longo deveria ter mensagem de tamanho específica [BUG #493]', async () => {
    const longo = 'ana.' + 'a'.repeat(90) + '@aurora-demo.com.br';
    const res = await api.post('/colaboradores', { data: payload({ email: longo }) });
    if (res.status() === 201) criados.push((await res.json()).id);
    const j = await res.json().catch(() => ({}));
    const msg = JSON.stringify(j.message || '').toLowerCase();
    expect(msg, `mensagem: ${msg}`).toMatch(/tamanho|caracteres|longo|máximo|max|length/);
  });
});
