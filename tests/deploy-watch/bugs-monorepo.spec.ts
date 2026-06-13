import { test, expect } from '../../fixtures/test-fixtures';
import { ColaboradoresPage } from '../../pages/ColaboradoresPage';
import { getEnvironmentConfig } from '../../config/environments';

// ─── Deploy-watch: cards do Aurora cobertos por correções no inbot-monorepo ──
// Para cada bug, o teste afirma o comportamento CORRETO. Status verificado no
// sandbox em 2026-06-13:
//   • Já corrigidos/no ar  → testes PASSANTES (regressão; se voltar, falha).
//   • Ainda não deployados → guards test.fail (viram verde quando o deploy sair).
// Assim a suíte funciona como painel de verificação de deploy.
//
// Não cobertos aqui (não automatizáveis de forma confiável): #271 (sem linha
// com 0 registros na base), #500 (alinhamento de ícone) e #504 (sobreposição de
// tooltip) — divergências visuais finas; verificar manualmente.

const BASE = getEnvironmentConfig().baseUrl;

// ╔═══ JÁ CORRIGIDOS (regressão passante) ═══╗

test.describe('Deploy-watch — corrigidos (regressão)', () => {
  test('#499 — os 3 cards de indicador da home ficam alinhados verticalmente', async ({ page }) => {
    await page.goto(BASE + '/', { waitUntil: 'load' });
    await page.getByText('Aurora: Empresa Demo', { exact: false }).first().waitFor({ timeout: 20000 });
    await page.waitForTimeout(1000);
    const tops = await page.evaluate(() =>
      ['Índice de Bem-Estar', 'Média Geral de Risco', 'Balança: Trabalho']
        .map((t) => [...document.querySelectorAll('h3')].find((h) => h.innerText.includes(t))?.closest('div'))
        .map((c) => (c ? Math.round(c.getBoundingClientRect().top) : -1)),
    );
    expect(tops.every((t) => t > 0)).toBeTruthy();
    expect(Math.max(...tops) - Math.min(...tops), `tops=${tops}`).toBeLessThanOrEqual(2);
  });

  test('#682 — buscar reseta a paginação para a 1ª página', async ({ page }) => {
    const cp = new ColaboradoresPage(page);
    await cp.navigate();
    const prox = page.getByRole('button', { name: 'Próxima' });
    if (await prox.isEnabled().catch(() => false)) {
      await prox.click();
      await page.waitForTimeout(1000);
    }
    await page.getByPlaceholder(/Buscar/i).fill('a');
    await page.waitForTimeout(1500);
    const faixa = await page.evaluate(
      () => ((document.querySelector('main') || document.body).innerText.match(/Mostrando\s+([\d-]+)/) || [, ''])[1],
    );
    expect(faixa, 'faixa de paginação após busca').toMatch(/^1-/);
  });

  test('#683 — formulário exibe a mensagem "CPF inválido" da API no campo', async ({ page }) => {
    const cp = new ColaboradoresPage(page);
    await cp.navigate();
    await cp.abrirDialogAdicionar();
    await cp.selecionarCadastroManual();
    await cp.preencherFormulario({
      nome: 'QA WATCH CPF',
      cpf: '111.111.111-11',
      email: `qa.watch.${Date.now()}@aurora-demo.com.br`,
      dataNascimento: '15/03/1990',
      departamento: 'Financeiro',
      cargo: 'Analista Júnior',
    });
    await cp.salvar();
    await page.waitForTimeout(2500);
    expect((await cp.getTextoDialog()).toLowerCase()).toContain('cpf inválido');
  });

  test('#492 — opções de departamento não extrapolam (nomes extensos)', async ({ page }) => {
    const cp = new ColaboradoresPage(page);
    await cp.navigate();
    await cp.abrirDialogAdicionar();
    await cp.selecionarCadastroManual();
    await page.getByRole('combobox', { name: 'Área de Trabalho (Depto) *' }).click();
    await page.waitForTimeout(500);
    const overflow = await page.evaluate(() =>
      [...document.querySelectorAll('[role=option]')].filter((o) => o.scrollWidth > o.clientWidth + 2).length,
    );
    expect(overflow, 'nº de opções que extrapolam a caixa').toBe(0);
  });

  test('#684 — tabelas não causam overflow horizontal do documento no mobile (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    for (const rota of ['/colaboradores', '/pedidos', '/configuracoes']) {
      await page.goto(BASE + rota, { waitUntil: 'load' });
      await page.waitForTimeout(3000);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2);
      expect(overflow, `overflow horizontal em ${rota}`).toBeFalsy();
    }
  });

  test('#685 — textarea de comentário da tratativa tem maxlength e não estoura o card', async ({ page }) => {
    await page.goto(BASE + '/casos-graves', { waitUntil: 'load' });
    await page.getByRole('button', { name: /Gerenciar Casos/i }).click();
    await page.waitForTimeout(2500);
    await page.locator('tbody tr').getByRole('button', { name: /Gerenciar/i }).first().click();
    const dlg = page.locator('[role=dialog]').last();
    await dlg.waitFor({ state: 'visible', timeout: 10000 });
    const ta = dlg.locator('textarea').first();
    expect(await ta.getAttribute('maxlength'), 'textarea deve ter maxlength').toBeTruthy();
    await ta.fill('X'.repeat(300));
    await page.waitForTimeout(500);
    const overflow = await dlg.evaluate((d) => d.scrollWidth > d.clientWidth + 2);
    expect(overflow, 'diálogo não deve estourar com texto longo').toBeFalsy();
  });
});

// ╔═══ AINDA NÃO DEPLOYADOS (test.fail — viram verde quando o deploy sair) ═══╗

test.describe('Deploy-watch — pendentes de deploy', () => {
  // #692 (fix monorepo #136) — gráficos de distribuição deveriam ser Pizza
  // (PieChart), mas no consolidado ainda são Barra.
  test.fail('#692 — distribuições deveriam ser gráficos de Pizza, não Barra', async ({ page }) => {
    await page.goto(BASE + '/', { waitUntil: 'load' });
    await page.waitForTimeout(3000);
    await page.getByRole('button', { name: 'Resultados Consolidados' }).click();
    await page.waitForTimeout(800);
    await page.getByText('Visualizar Dashboard').first().click();
    await page.getByText(/Taxa de Participação/i).first().waitFor({ timeout: 20000 });
    await page.waitForTimeout(1500);
    const chart = await page.evaluate(() => ({
      bars: document.querySelectorAll('.recharts-bar, rect.recharts-rectangle').length,
      pies: document.querySelectorAll('.recharts-pie, path.recharts-sector').length,
    }));
    expect(chart.pies > 0 && chart.bars === 0, `bars=${chart.bars} pies=${chart.pies}`).toBeTruthy();
  });

  // #423 (fix monorepo #140) — o diálogo "Tratativa de Caso Grave" deveria
  // fechar por Esc; hoje não fecha.
  test.fail('#423 — diálogo de Tratativa deveria fechar com Esc', async ({ page }) => {
    await page.goto(BASE + '/casos-graves', { waitUntil: 'load' });
    await page.getByRole('button', { name: /Gerenciar Casos/i }).click();
    await page.waitForTimeout(2500);
    await page.locator('tbody tr').getByRole('button', { name: /Gerenciar/i }).first().click();
    const dlg = page.locator('[role=dialog]').last();
    await dlg.waitFor({ state: 'visible', timeout: 10000 });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
    expect(await dlg.isVisible().catch(() => false), 'diálogo deveria ter fechado com Esc').toBeFalsy();
  });

  // #363 (fix monorepo #139) — células filtráveis deveriam ter destaque de hover
  // (cursor-pointer). Hoje o cursor é "auto".
  test.fail('#363 — células filtráveis deveriam ter cursor-pointer (hover)', async ({ page }) => {
    const cp = new ColaboradoresPage(page);
    await cp.navigate();
    const cursores = await page.evaluate(() =>
      [...document.querySelectorAll('tbody td')].slice(1, 5).map((td) => getComputedStyle(td).cursor),
    );
    expect(cursores.some((c) => c === 'pointer'), `cursores=${cursores}`).toBeTruthy();
  });
});
