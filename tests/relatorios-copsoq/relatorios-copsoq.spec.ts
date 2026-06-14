import { test, expect } from '../../fixtures/test-fixtures';
import { RelatoriosCopsoqPage } from '../../pages/RelatoriosCopsoqPage';
import { takeEvidenceScreenshot } from '../../utils/screenshots';

// Módulo Relatório COPSOQ (/relatorios/copsoq) — leitura.
// 3 KPIs (Bem-Estar/Risco/Balança) + seções de distribuição, pontuações e
// risco por grupos. Cobre a estrutura + 2 guards test.fail (#689 Balança sem
// label, #693 KPIs como medidor em vez de doughnut).

test.describe('Relatório COPSOQ', () => {
  let p: RelatoriosCopsoqPage;

  test.beforeEach(async ({ page }) => {
    p = new RelatoriosCopsoqPage(page);
    await p.navigate();
  });

  test('CP01 — deve carregar a rota com título "Relatório COPSOQ"', async ({ page }) => {
    await expect(p.titulo).toBeVisible();
    await takeEvidenceScreenshot(page, test.info(), 'relatorios-copsoq');
  });

  test('CP02 — deve exibir os 3 KPIs (Bem-Estar, Risco, Balança)', async () => {
    await expect(p.kpiCard(/BEM-ESTAR/i)).toBeVisible();
    await expect(p.kpiCard(/RISCO/i)).toBeVisible();
    await expect(p.kpiCard(/BALAN/i)).toBeVisible();
  });

  test('CP03 — Bem-Estar e Risco exibem o rótulo de status (Regular/Moderado)', async () => {
    await expect(p.kpiCard(/BEM-ESTAR/i)).toContainText(/Regular|Bom|Ruim|Crítico|Ótimo/i);
    await expect(p.kpiCard(/RISCO/i)).toContainText(/Moderado|Baixo|Alto|Crítico/i);
  });

  test('CP04 — exibe a seção "Distribuições Demográficas" com subgrupos', async () => {
    await expect(p.secaoHeading(/Distribuições Demográficas/i)).toBeVisible();
    await expect(p.subgrupoHeading(/GÊNERO/i)).toBeVisible();
    await expect(p.subgrupoHeading(/FAIXA ETÁRIA/i)).toBeVisible();
  });

  test('CP05 — exibe a seção "Análise de Pontuações" (pontos fortes e riscos)', async () => {
    await expect(p.secaoHeading(/Análise de Pontuações/i)).toBeVisible();
    await expect(p.subgrupoHeading(/PONTOS FORTES/i)).toBeVisible();
    await expect(p.subgrupoHeading(/RISCOS/i)).toBeVisible();
  });

  test('CP06 — exibe a seção "Análise de Risco por Grupos"', async () => {
    await expect(p.secaoHeading(/Análise de Risco por Grupos/i)).toBeVisible();
  });

  test('CP07 — consulta a API (200) e renderiza os gráficos demográficos', async () => {
    expect(p.getApiStatus()).toBe(200);
    expect(await p.getRechartsCount()).toBeGreaterThan(0);
  });

  // BUG #689 — a API retorna `label` de status para bemEstar e risco, mas NÃO
  // para `balanca`; logo o card "Balança" fica sem o descritor qualitativo.
  // Este teste afirma o comportamento CORRETO (balanca deveria ter label, como
  // os demais KPIs) — falha enquanto o bug existir.
  test.fail('CP08 — a Balança deveria ter rótulo de status como os demais KPIs [BUG #689]', async () => {
    const kpis = p.getKpis();
    expect(kpis, 'payload kpis capturado').not.toBeNull();
    // sanidade: os outros dois têm label
    expect(kpis?.bemEstar?.label, 'bemEstar.label').toBeTruthy();
    expect(kpis?.risco?.label, 'risco.label').toBeTruthy();
    // o que está quebrado: balanca.label ausente
    expect(kpis?.balanca?.label, 'balanca.label').toBeTruthy();
  });

  // BUG #693 — os 3 indicadores deveriam ser gráficos de ROSCA (doughnut),
  // como no protótipo aprovado. Hoje são medidores semicirculares (svg
  // viewBox 120×60, razão ~0.5) sem doughnut. Este teste afirma o comportamento
  // CORRETO (KPI como rosca: gráfico de pizza recharts OU svg ~quadrado) —
  // falha enquanto forem medidores.
  test.fail('CP09 — os 3 KPIs deveriam ser gráficos de rosca (doughnut) [BUG #693]', async () => {
    const doughnuts = await p.getKpiDoughnutCount();
    const aspect = await p.getKpiChartAspect();
    // rosca = pizza recharts presente OU medidor com proporção ~quadrada
    expect(doughnuts > 0 || aspect >= 0.8, `doughnuts=${doughnuts} aspect=${aspect}`).toBeTruthy();
  });
});
