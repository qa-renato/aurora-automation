import { test, expect } from '../../fixtures/test-fixtures';
import { CasosGravesPage, KPIS, COLUNAS_DETALHAMENTO } from '../../pages/CasosGravesPage';
import { takeEvidenceScreenshot } from '../../utils/screenshots';

// Módulo Casos Graves — Painel "Gerenciar Casos".
// 5 KPIs + 2 gráficos + tabela "Detalhamento por Paciente". Apenas LEITURA.

test.describe('Casos Graves — Painel de Gestão', () => {
  test.beforeEach(async ({ page }) => {
    const cg = new CasosGravesPage(page);
    await cg.navigate();
    await cg.abrirGestao();
  });

  test('CG10 — "Gerenciar Casos" deve revelar os 5 KPIs', async ({ page }) => {
    const cg = new CasosGravesPage(page);
    for (const kpi of KPIS) {
      await expect(cg.kpiCard(kpi)).toBeVisible();
    }
    await takeEvidenceScreenshot(page, test.info(), 'casos-graves-gestao');
  });

  test('CG11 — tabela "Detalhamento por Paciente" deve exibir as colunas corretas', async ({ page }) => {
    const cg = new CasosGravesPage(page);
    await expect(cg.detalhamentoHeading).toBeVisible();
    for (const col of COLUNAS_DETALHAMENTO) {
      await expect(cg.colunaHeader(col)).toBeVisible();
    }
  });

  test('CG12 — deve listar ao menos um caso ou um estado vazio coerente', async ({ page }) => {
    const cg = new CasosGravesPage(page);
    const linhas = await cg.getRowCount();
    if (linhas === 0) {
      await expect(page.getByText(/nenhum|sem casos|não há/i).first()).toBeVisible();
    } else {
      expect(linhas).toBeGreaterThan(0);
      // a coluna Nível de Risco deve exibir um nível conhecido
      await expect(
        page.locator('tbody tr').first().getByText(/Grave|Moderado|Leve/i).first()
      ).toBeVisible();
    }
  });

  test('CG13 — filtro de Período deve aceitar troca de janela temporal', async ({ page }) => {
    const cg = new CasosGravesPage(page);
    await cg.selecionarPeriodo('Todo o histórico');
    // KPIs continuam renderizados após o filtro
    await expect(cg.kpiCard('CASOS GRAVES IDENTIFICADOS')).toBeVisible();
  });

  test('CG14 — KPI "Casos Graves Identificados" deve exibir um número', async ({ page }) => {
    const cg = new CasosGravesPage(page);
    await expect(cg.kpiCard('CASOS GRAVES IDENTIFICADOS')).toBeVisible();
    // o card do KPI (pai do rótulo) contém o valor numérico
    const card = page.getByText('Casos Graves Identificados', { exact: false }).locator('xpath=..');
    await expect(card).toContainText(/\d/);
  });
});
