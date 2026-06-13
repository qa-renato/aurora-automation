import { test, expect } from '../../fixtures/test-fixtures';
import { HomePage } from '../../pages/HomePage';
import { takeEvidenceScreenshot } from '../../utils/screenshots';

// Módulo Home / Dashboard (/) — leitura.
// 4 indicadores + acordeões de relatórios. Apenas leitura.

test.describe('Home / Dashboard', () => {
  let p: HomePage;

  test.beforeEach(async ({ page }) => {
    p = new HomePage(page);
    await p.navigate();
  });

  test('HM01 — deve carregar o dashboard "Aurora: Empresa Demo"', async ({ page }) => {
    await expect(p.titulo).toBeVisible();
    await takeEvidenceScreenshot(page, test.info(), 'home');
  });

  test('HM02 — deve exibir os 4 indicadores principais', async () => {
    await expect(p.indicador(/Índice de Bem-Estar/i)).toBeVisible();
    await expect(p.indicador(/Média Geral de Risco/i)).toBeVisible();
    await expect(p.indicador(/Balança: Trabalho vs\. Vida/i)).toBeVisible();
    await expect(p.indicador(/Casos Graves/i)).toBeVisible();
  });

  test('HM03 — a Balança exibe o rótulo de status na home (≠ relatórios, bug #689)', async () => {
    expect(await p.getBalancaStatus()).toMatch(/ATENÇÃO|REGULAR|MODERADO|BOM|RUIM|CRÍTICO|ALTO|BAIXO|ÓTIMO/i);
  });

  test('HM04 — deve exibir os 3 acordeões de relatórios e o botão Gerenciar Casos', async () => {
    await expect(p.acordeao('Relatórios das Entrevistas Individuais')).toBeVisible();
    await expect(p.acordeao('Relatório da Entrevista Ocupacional (COPSOQ)')).toBeVisible();
    await expect(p.acordeao('Resultados Consolidados')).toBeVisible();
    await expect(p.gerenciarCasos).toBeVisible();
  });

  test('HM05 — deve consultar a API do dashboard com sucesso (200)', async () => {
    expect(p.getApiStatus()).toBe(200);
  });
});
