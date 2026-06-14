import { test, expect } from '../../fixtures/test-fixtures';
import { ColaboradoresPage } from '../../pages/ColaboradoresPage';
import { novoColaboradorValido } from '../../test-data/colaboradores';
import { takeEvidenceScreenshot } from '../../utils/screenshots';

// Cobertura não-funcional: acessibilidade, responsividade e segurança (XSS).

test.describe('Colaboradores — Não-funcional', () => {

  test.beforeEach(async ({ page }) => {
    await new ColaboradoresPage(page).navigate();
  });

  test('CT68 — a11y: ações têm aria-label e o dialog contém o foco', async ({ page }) => {
    const p = new ColaboradoresPage(page);
    // botões de ação da tabela expõem aria-label descritivo (auto-wait)
    await expect(page.locator('tbody button[aria-label]').first()).toBeVisible();
    // ao abrir o formulário, o foco fica contido no dialog (focus trap)
    await p.abrirDialogAdicionar();
    await p.selecionarCadastroManual();
    const focoDentroDoDialog = await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'));
    expect(focoDentroDoDialog).toBe(true);
    await p.fecharViaX();
  });

  test('CT69 — responsivo: tabela utilizável em viewport mobile', async ({ page }) => {
    const p = new ColaboradoresPage(page);
    await page.setViewportSize({ width: 375, height: 812 });
    await page.reload();
    await page.locator('tbody tr').first().waitFor({ state: 'visible', timeout: 60000 });
    expect(await p.getRowCount()).toBeGreaterThan(0);
    await expect(p.searchInput).toBeVisible();
    await expect(p.adicionarButton).toBeVisible();
    await takeEvidenceScreenshot(page, test.info(), 'responsivo-mobile');
  });

  test('CT70 — segurança: entrada com HTML/script não deve executar (XSS)', async ({ page }) => {
    let alertouNativo = false;
    page.on('dialog', async d => { alertouNativo = true; await d.dismiss().catch(() => {}); });

    const p = new ColaboradoresPage(page);
    const dados = { ...novoColaboradorValido(), nome: '<img src=x onerror="window.__xss=1">XSS Teste' };
    await p.cadastrarColaborador(dados);
    await p.validarCadastroSucesso().catch(() => {});

    // nenhum alerta JS deve disparar e o flag de execução não pode existir
    expect(alertouNativo).toBe(false);
    const executou = await page.evaluate(() => (window as unknown as { __xss?: number }).__xss);
    expect(executou).toBeFalsy();
    await takeEvidenceScreenshot(page, test.info(), 'xss-nao-executado');
  });

});
