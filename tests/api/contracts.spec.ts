import { test, expect, APIRequestContext } from '@playwright/test';
import { criarApiContext } from './_apiAuth';

// ─── Contrato dos payloads (nível API) ──────────────────────────────────────
// Valida o SHAPE dos endpoints de tela + invariantes de dados, e guarda os bugs
// de contrato via test.fail. Roda em segundos (sem UI). Asserts manuais (sem
// dependência nova); migrar p/ zod é um TODO.

const ISO_DATE = /^\d{4}-\d{2}-\d{2}/;

test.describe('Contrato de API — payloads das telas', () => {
  let api: APIRequestContext;

  test.beforeAll(async ({ browser }) => {
    ({ api } = await criarApiContext(browser));
  });
  test.afterAll(async () => {
    await api?.dispose();
  });

  async function json(endpoint: string) {
    const res = await api.get(endpoint);
    expect(res.status(), `GET ${endpoint}`).toBe(200);
    return res.json();
  }

  // ─── Relatórios individuais ───────────────────────────────────────────────
  test('CT-IND-01 — BAI: shape do relatório individual', async () => {
    const b = await json('/screens/relatorios/protocolo/bai');
    expect(b.protocolo).toBeTruthy();
    expect(b.periodo.inicio).toMatch(ISO_DATE);
    expect(b.periodo.fim).toMatch(ISO_DATE);
    expect(typeof b.totalRespostas).toBe('number');
    expect(typeof b.mediaScore).toBe('number');
    expect(Array.isArray(b.resultados)).toBeTruthy();
    expect(Array.isArray(b.perguntas)).toBeTruthy();
    expect(b.perguntas[0]).toMatchObject({
      numero: expect.any(Number),
      descricao: expect.any(String),
      mediaValor: expect.any(Number),
      nivelLabel: expect.any(String),
    });
  });

  test('CT-IND-02 — resultados[] de protocolo trazem colaborador/score/nível', async () => {
    const b = await json('/screens/relatorios/protocolo/bai');
    expect(b.resultados[0]).toMatchObject({
      colaboradorId: expect.any(String),
      nome: expect.any(String),
      email: expect.any(String),
      score: expect.any(Number),
      nivel: expect.any(String),
    });
  });

  // BUG #691 (contrato ainda divergente) — a issue foi fechada porque o FRONT
  // passou a ler `perguntasBhs`, mas a API NÃO foi padronizada: BAI/BSS/BDI usam
  // a chave `perguntas` ({mediaValor,nivelLabel}) e o BHS usa `perguntasBhs`
  // ({percentualCritico,severidade}) — chave e shape diferentes. Este teste
  // afirma o comportamento CORRETO (BHS também sob `perguntas`) → falha enquanto
  // a API não padronizar. É a "dívida de contrato" que sobrou do #691.
  test.fail('CT-IND-03 — BHS deveria usar a chave padronizada `perguntas` [dívida de #691]', async () => {
    const bhs = await json('/screens/relatorios/protocolo/bhs');
    expect(Array.isArray(bhs.perguntas), 'BHS deveria ter `perguntas` como os demais').toBeTruthy();
  });

  // ─── COPSOQ ───────────────────────────────────────────────────────────────
  test('CT-COP-01 — COPSOQ: shape (kpis, pontos fortes/atenção, distribuições)', async () => {
    const c = await json('/screens/relatorios/protocolo/copsoq');
    expect(c.periodo.inicio).toMatch(ISO_DATE);
    expect(typeof c.totalJornadas).toBe('number');
    expect(c.kpis.bemEstar.valor).toEqual(expect.any(Number));
    expect(Array.isArray(c.pontosFortes)).toBeTruthy();
    expect(Array.isArray(c.pontosAtencao)).toBeTruthy();
    expect(c.pontosFortes[0]).toMatchObject({ dimensao: expect.any(String), label: expect.any(String) });
  });

  test('CT-COP-02 — COPSOQ: bemEstar e risco trazem label de status', async () => {
    const c = await json('/screens/relatorios/protocolo/copsoq');
    expect(c.kpis.bemEstar.label).toBeTruthy();
    expect(c.kpis.risco.label).toBeTruthy();
  });

  // BUG #689 — `balanca` vem sem `label` (bemEstar/risco têm).
  test.fail('CT-COP-03 — COPSOQ: balanca deveria ter label [BUG #689]', async () => {
    const c = await json('/screens/relatorios/protocolo/copsoq');
    expect(c.kpis.balanca.label).toBeTruthy();
  });

  // ─── Consolidado ──────────────────────────────────────────────────────────
  test('CT-CON-01 — Consolidado: shape (taxa, kpis, distribuições, resultados)', async () => {
    const c = await json('/screens/relatorios/consolidado');
    expect(c.periodo.inicio).toMatch(ISO_DATE);
    expect(c.taxaParticipacao).toMatchObject({
      participantes: expect.any(Number),
      total: expect.any(Number),
      percentual: expect.any(Number),
    });
    expect(Array.isArray(c.resultados)).toBeTruthy();
    expect(Array.isArray(c.casosGraves)).toBeTruthy();
  });

  // INVARIANTE DE DADOS — o percentual exibido deve bater com participantes/total.
  test('CT-CON-02 — Consolidado: taxaParticipacao.percentual = round(participantes/total)', async () => {
    const c = await json('/screens/relatorios/consolidado');
    const { participantes, total, percentual } = c.taxaParticipacao;
    expect(total).toBeGreaterThan(0);
    expect(percentual).toBe(Math.round((participantes / total) * 100));
  });

  // REGRESSÃO #690 — o período é uma janela real (datas ISO), não rótulo fixo.
  test('CT-CON-03 — Consolidado: período é uma janela de datas reais [regressão #690]', async () => {
    const c = await json('/screens/relatorios/consolidado');
    expect(c.periodo.inicio).toMatch(ISO_DATE);
    expect(c.periodo.fim).toMatch(ISO_DATE);
    expect(new Date(c.periodo.fim).getTime()).toBeGreaterThanOrEqual(new Date(c.periodo.inicio).getTime());
  });

  // BUG #689 (também no consolidado).
  test.fail('CT-CON-04 — Consolidado: balanca deveria ter label [BUG #689]', async () => {
    const c = await json('/screens/relatorios/consolidado');
    expect(c.kpis.balanca.label).toBeTruthy();
  });

  // ─── Dashboard (home) ─────────────────────────────────────────────────────
  test('CT-DASH-01 — Dashboard: 4 indicadores numéricos', async () => {
    const d = await json('/screens/dashboard');
    expect(typeof d.bemEstar).toBe('number');
    expect(typeof d.risco).toBe('number');
    expect(typeof d.balancaTrabalhoVida).toBe('number');
    expect(typeof d.casosGravesAbertos).toBe('number');
  });

  // ─── Métricas IA ──────────────────────────────────────────────────────────
  test('CT-MET-01 — Métricas IA: kpis + série temporal coerente com o período', async () => {
    const m = await json('/screens/metricas-ia?periodo=7');
    expect(typeof m.kpis.interacoes).toBe('number');
    expect(typeof m.kpis.quantidadeUsuarios).toBe('number');
    expect(Array.isArray(m.serie)).toBeTruthy();
    // período=7 → série de 7 pontos (1 por dia)
    expect(m.serie).toHaveLength(7);
    expect(m.serie[0]).toMatchObject({ name: expect.any(String), interacoes: expect.any(Number) });
  });

  // BUG #687 — a UI mostra variação "+12%/+8%", mas a API NÃO retorna nenhum
  // dado de variação/comparação (o % é fabricado no front). Afirma o
  // comportamento CORRETO (API fornece dados de variação) → falha enquanto
  // ausente.
  test.fail('CT-MET-02 — Métricas IA deveria retornar dados de variação [BUG #687]', async () => {
    const m = await json('/screens/metricas-ia?periodo=7');
    const txt = JSON.stringify(m).toLowerCase();
    expect(/varia|percentual|delta|comparativo|tendencia/.test(txt), 'payload deveria conter dado de variação').toBeTruthy();
  });

  // ─── Casos Graves ─────────────────────────────────────────────────────────
  test('CT-CG-01 — Casos Graves: shape (kpis + casos + agrupados)', async () => {
    const cg = await json('/screens/casos-graves?periodo=30');
    expect(cg.kpis).toMatchObject({
      total: expect.any(Number),
      abertos: expect.any(Number),
      emAndamento: expect.any(Number),
      concluidos: expect.any(Number),
      arquivados: expect.any(Number),
    });
    expect(Array.isArray(cg.casos)).toBeTruthy();
  });
});
