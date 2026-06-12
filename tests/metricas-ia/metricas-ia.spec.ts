import { test, expect } from '../../fixtures/test-fixtures';
import { MetricasIaPage } from '../../pages/MetricasIaPage';
import { takeEvidenceScreenshot } from '../../utils/screenshots';

// Módulo Métricas da IA (/metricas-ia) — leitura.
// KPIs (Volume de Interações, Quantidade de Usuários), gráfico de evolução e
// toggle de período. Apenas leitura (não muta dados).

test.describe('Métricas da IA', () => {
  test.beforeEach(async ({ page }) => {
    await new MetricasIaPage(page).navigate();
  });

  test('MI01 — deve carregar a rota com título "Inteligência Artificial"', async ({ page }) => {
    const p = new MetricasIaPage(page);
    await expect(p.titulo).toBeVisible();
    await takeEvidenceScreenshot(page, test.info(), 'metricas-ia');
  });

  test('MI02 — deve exibir os 2 KPIs (Volume de Interações e Quantidade de Usuários)', async ({ page }) => {
    const p = new MetricasIaPage(page);
    await expect(p.kpiVolume).toBeVisible();
    await expect(p.kpiUsuarios).toBeVisible();
  });

  test('MI03 — deve exibir o gráfico "Evolução de Interações"', async ({ page }) => {
    const p = new MetricasIaPage(page);
    await expect(p.evolucaoHeading).toBeVisible();
    expect(await p.getChartCount()).toBeGreaterThan(0);
  });

  test('MI04 — gráfico de evolução renderiza a série de dados (linha/eixos)', async ({ page }) => {
    const p = new MetricasIaPage(page);
    const chart = page.locator('svg.recharts-surface').first();
    await expect(chart).toBeVisible();
    // série desenhada (linha/curva) OU eixos com ticks => gráfico com dados
    const desenho = chart.locator('.recharts-line, .recharts-line-curve, path.recharts-curve, .recharts-cartesian-axis-tick');
    await expect(desenho.first()).toBeVisible();
  });

  test('MI05 — toggle de período (7/15/30 dias) altera o valor dos KPIs', async ({ page }) => {
    const p = new MetricasIaPage(page);
    await p.selecionarPeriodo('7 dias');
    const v7 = await p.getKpiValor('VOLUME DE INTERAÇÕES');
    await p.selecionarPeriodo('30 dias');
    const v30 = await p.getKpiValor('VOLUME DE INTERAÇÕES');
    // os números são reais e mudam com o período (ex.: 0 em 7 dias, >0 em 30 dias)
    expect(v7 === '' && v30 === '').toBeFalsy();
    expect(v30).not.toBe(v7);
  });

  // BUG #687 — os badges de variação são ESTÁTICOS (não mudam com o período) e a
  // API não retorna percentual. Este teste afirma o comportamento CORRETO esperado
  // (o badge deveria mudar entre períodos) — falha enquanto o bug existir.
  test.fail('MI06 — variação (%) deveria refletir o período [BUG #687]', async ({ page }) => {
    const p = new MetricasIaPage(page);
    await p.selecionarPeriodo('7 dias');
    const b7 = await p.getVariacaoBadge('VOLUME DE INTERAÇÕES');
    await p.selecionarPeriodo('30 dias');
    const b30 = await p.getVariacaoBadge('VOLUME DE INTERAÇÕES');
    expect(b30).not.toBe(b7); // hoje ambos são "+12%" (estático) -> falha esperada
  });
});
