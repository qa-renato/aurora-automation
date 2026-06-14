import { test, expect } from '../../fixtures/test-fixtures';
import { CasosGravesPage } from '../../pages/CasosGravesPage';
import { takeEvidenceScreenshot } from '../../utils/screenshots';

// Módulo Casos Graves (/casos-graves) — Dashboard de entrada.
// 3 gauges + card "Casos Graves" + 3 acordeões com dashboards por protocolo.
// Apenas LEITURA/navegação — não muta dados.

test.describe('Casos Graves — Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await new CasosGravesPage(page).navigate();
  });

  test('CG01 — deve carregar a rota com título e seção Casos Graves', async ({ page }) => {
    await expect(page.getByText('Aurora: Empresa Demo')).toBeVisible();
    await expect(page.getByText('Casos Graves').first()).toBeVisible();
    await takeEvidenceScreenshot(page, test.info(), 'casos-graves-dashboard');
  });

  test('CG02 — deve exibir os 3 medidores (gauges)', async ({ page }) => {
    const cg = new CasosGravesPage(page);
    for (const g of ['Índice de Bem-Estar', 'Média Geral de Risco', 'Balança: Trabalho vs. Vida'] as const) {
      await expect(cg.gauge(g)).toBeVisible();
    }
  });

  test('CG03 — card Casos Graves deve ter botão "Gerenciar Casos"', async ({ page }) => {
    const cg = new CasosGravesPage(page);
    await expect(cg.gerenciarCasosButton).toBeVisible();
    await expect(page.getByText('Requerem atenção imediata')).toBeVisible();
  });

  test('CG04 — acordeão "Entrevistas Individuais" deve listar BAI/BHS/BSS/BDI', async ({ page }) => {
    const cg = new CasosGravesPage(page);
    await cg.expandirAcordeao('Relatórios das Entrevistas Individuais');
    for (const item of ['Ansiedade (BAI)', 'Desesperança (BHS)', 'Ideação Suicida (BSS)', 'Depressão (BDI)']) {
      await expect(cg.itemAcordeao(item)).toBeVisible();
    }
    await expect(cg.itemAcordeao('Visualizar Dashboard')).toBeVisible();
  });

  test('CG05 — acordeão COPSOQ deve listar Copenhague', async ({ page }) => {
    const cg = new CasosGravesPage(page);
    await cg.expandirAcordeao('Relatório da Entrevista Ocupacional (COPSOQ)');
    await expect(cg.itemAcordeao('Copenhague')).toBeVisible();
  });

  test('CG06 — acordeão Resultados Consolidados deve listar Dashboard Consolidado', async ({ page }) => {
    const cg = new CasosGravesPage(page);
    await cg.expandirAcordeao('Resultados Consolidados');
    await expect(cg.itemAcordeao('Dashboard Consolidado')).toBeVisible();
  });
});
