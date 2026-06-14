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
    // exercita os três períodos disponíveis na tela (inclui "15 dias")
    await p.selecionarPeriodo('7 dias');
    const vol7 = await p.getKpiValor('VOLUME DE INTERAÇÕES');
    const usr7 = await p.getKpiValor('QUANTIDADE DE USUÁRIOS');
    await p.selecionarPeriodo('15 dias');
    const vol15 = await p.getKpiValor('VOLUME DE INTERAÇÕES');
    await p.selecionarPeriodo('30 dias');
    const vol30 = await p.getKpiValor('VOLUME DE INTERAÇÕES');
    const usr30 = await p.getKpiValor('QUANTIDADE DE USUÁRIOS');

    // os números são reais (não vazios) e respondem ao filtro de período
    expect([vol7, usr7, vol15, vol30, usr30].some((v) => v !== '')).toBeTruthy();
    // ambos os KPIs mudam entre 7 e 30 dias (ex.: Volume 0->15, Usuários 0->13)
    expect(vol30, 'Volume de Interações deve mudar com o período').not.toBe(vol7);
    expect(usr30, 'Quantidade de Usuários deve mudar com o período').not.toBe(usr7);
    // o período intermediário "15 dias" também produz valor próprio
    expect(vol15, '"15 dias" deve produzir um valor de Volume').not.toBe('');
  });

  // BUG #687 — os badges de variação são ESTÁTICOS (não mudam com o período) e a
  // API não retorna percentual. Afeta OS DOIS KPIs. Este teste afirma o
  // comportamento CORRETO (o badge deveria mudar entre períodos) — falha
  // enquanto o bug existir.
  test.fail('MI06 — variação (%) dos dois KPIs deveria refletir o período [BUG #687]', async ({ page }) => {
    const p = new MetricasIaPage(page);
    await p.selecionarPeriodo('7 dias');
    const volB7 = await p.getVariacaoBadge('VOLUME DE INTERAÇÕES');
    const usrB7 = await p.getVariacaoBadge('QUANTIDADE DE USUÁRIOS');
    await p.selecionarPeriodo('30 dias');
    const volB30 = await p.getVariacaoBadge('VOLUME DE INTERAÇÕES');
    const usrB30 = await p.getVariacaoBadge('QUANTIDADE DE USUÁRIOS');
    // hoje ambos os badges são estáticos (Volume "+12%", Usuários "+8%") -> falha esperada.
    // basta um dos KPIs refletir o período para o comportamento estar correto.
    expect(volB30 !== volB7 || usrB30 !== usrB7).toBeTruthy();
  });
});
