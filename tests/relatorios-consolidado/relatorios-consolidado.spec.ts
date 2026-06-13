import { test, expect } from '../../fixtures/test-fixtures';
import { RelatoriosConsolidadoPage } from '../../pages/RelatoriosConsolidadoPage';
import { takeEvidenceScreenshot } from '../../utils/screenshots';

// Módulo Resultados Consolidados (/relatorios/consolidado) — leitura.
// Carrega via home → acordeão → "Visualizar Dashboard" (deep-link direto cai
// na home). Cobre estrutura + regressão #690 (período reflete a janela real)
// + guard test.fail #689 (Balança sem rótulo de status).

test.describe('Resultados Consolidados', () => {
  let p: RelatoriosConsolidadoPage;

  test.beforeEach(async ({ page }) => {
    p = new RelatoriosConsolidadoPage(page);
    await p.navigate();
  });

  test('CO01 — deve montar o relatório "Resultados Consolidados"', async ({ page }) => {
    await expect(p.titulo).toBeVisible();
    await expect(p.taxaParticipacao).toBeVisible();
    await takeEvidenceScreenshot(page, test.info(), 'relatorios-consolidado');
  });

  test('CO02 — deve exibir o período como intervalo de datas reais', async () => {
    expect(await p.getPeriodoExibido()).toMatch(/\d{4}-\d{2}-\d{2}\s*[–-]\s*\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}/);
  });

  test('CO03 — deve exibir a Taxa de Participação ("X de Y colaboradores (Z%)")', async () => {
    expect(await p.getTaxaTexto()).toMatch(/\d+\s+de\s+\d+\s+colaboradores\s*\(\d+%\)/i);
  });

  test('CO04 — deve exibir os Níveis BAI e BHS com gráficos', async () => {
    await expect(p.nivelHeading('BAI')).toBeVisible();
    await expect(p.nivelHeading('BHS')).toBeVisible();
    expect(await p.getRechartsCount()).toBeGreaterThanOrEqual(2);
  });

  test('CO05 — deve exibir os 3 indicadores (Bem-Estar, Risco, Balança)', async () => {
    await expect(p.indicador(/ÍNDICE DE BEM-ESTAR/i)).toBeVisible();
    await expect(p.indicador(/MÉDIA GERAL DE RISCO/i)).toBeVisible();
    await expect(p.indicador(/BALANÇA/i)).toBeVisible();
  });

  test('CO06 — Resultados Individuais: tabela com colunas Colaborador/Protocolo/Score/Nível', async () => {
    for (const col of ['COLABORADOR', 'PROTOCOLO', 'SCORE', 'NÍVEL']) {
      await expect(p.colunaTabela(col)).toBeVisible();
    }
    expect(await p.tabelaRows.count()).toBeGreaterThan(0);
  });

  test('CO07 — botão "Exportar CSV" deve gerar o download', async ({ page }) => {
    await expect(p.exportarCsv).toBeVisible();
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 10000 }),
      p.exportarCsv.click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/consolidad.*\.csv$/i);
  });

  test('CO08 — deve consultar a API de consolidado com sucesso (200)', async () => {
    expect(p.getApiStatus()).toBe(200);
  });

  // REGRESSÃO BUG #690 — antes a UI exibia "Últimos 30 dias" divergindo da
  // janela real (a API devolvia ~7 dias). Agora o período exibido reflete as
  // datas reais da API (inicio–fim). Este teste TRAVA a correção: deve PASSAR.
  test('CO09 — o período exibido corresponde à janela real da API [regressão #690]', async () => {
    const periodo = p.getPeriodoApi();
    expect(periodo?.inicio, 'API deve retornar periodo.inicio').toBeTruthy();
    expect(periodo?.fim, 'API deve retornar periodo.fim').toBeTruthy();
    const exibido = await p.getPeriodoExibido();
    // a faixa mostrada contém as datas reais da API (não um rótulo fixo "30 dias")
    expect(exibido).toContain(periodo!.inicio!);
    expect(exibido).toContain(periodo!.fim!);
  });

  // BUG #689 — a API retorna `label` de status para bemEstar e risco, mas NÃO
  // para `balanca`; o indicador "Balança Trabalho vs. Vida" fica sem o
  // descritor qualitativo. Afirma o comportamento CORRETO — falha enquanto o
  // bug existir.
  test.fail('CO10 — a Balança deveria ter rótulo de status como os demais indicadores [BUG #689]', async () => {
    const kpis = p.getKpis();
    expect(kpis, 'payload kpis capturado').not.toBeNull();
    expect(kpis?.bemEstar?.label, 'bemEstar.label').toBeTruthy();
    expect(kpis?.risco?.label, 'risco.label').toBeTruthy();
    expect(kpis?.balanca?.label, 'balanca.label').toBeTruthy();
  });
});
