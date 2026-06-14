import { test, expect } from '../../fixtures/test-fixtures';
import { PedidosPage } from '../../pages/PedidosPage';
import { getEnvironmentConfig } from '../../config/environments';
import { takeEvidenceScreenshot } from '../../utils/screenshots';

// Filtro por protocolo (cards de resumo), navegação e cobertura não-funcional.

test.describe('Pedidos — Filtro por Protocolo (cards de adesão)', () => {

  test.beforeEach(async ({ page }) => {
    await new PedidosPage(page).navigate();
  });

  // Os cards de adesão por protocolo no topo PARECEM clicáveis, mas clicar não
  // filtra a tabela (ex.: clicar "BHS" mantém linhas "BAI"). test.fail afirma o
  // comportamento esperado (card deveria filtrar) → falha enquanto não funcionar;
  // vira verde se/quando o filtro por card for implementado.
  // (Pendente de confirmação de produto: os cards devem ser filtros ou só resumo?)
  test.fail('PD34 — clicar no card de um protocolo deveria filtrar a tabela [BUG: card não filtra]', async ({ page }) => {
    const p = new PedidosPage(page);
    await p.filtrarPorProtocolo('BHS');
    const protocolos = (await p.getColunaValores(2)).filter(Boolean);
    expect(protocolos.length, 'tabela deve ter linhas após o filtro').toBeGreaterThan(0);
    for (const proto of protocolos) expect(proto).toBe('BHS');
    await takeEvidenceScreenshot(page, test.info(), 'pedidos-filtro-protocolo');
  });

  test('PD35 — cards de protocolo exibem adesão (% e fração)', async ({ page }) => {
    const p = new PedidosPage(page);
    // Ex.: "BAI 75% 3 / 4" — % e razão atendidos/total
    await expect(page.getByText(/\b(BAI|BHS|BDI|BSI|COPSOQ)\b/).first()).toBeVisible();
    const temPercentual = await page.getByText(/\d+%/).first().isVisible().catch(() => false);
    expect(temPercentual).toBe(true);
  });

});

test.describe('Pedidos — Navegação e Não-funcional', () => {

  test('PD36 — deve acessar /pedidos pelo menu lateral', async ({ page }) => {
    const base = getEnvironmentConfig().baseUrl;
    await page.goto(base + '/colaboradores');
    await page.locator('tbody button[aria-label]').first().waitFor({ state: 'visible', timeout: 60000 }).catch(() => {});
    await page.getByRole('link', { name: /Pedidos de Protocolo/i })
      .or(page.getByText(/Pedidos de Protocolo/i)).first().click();
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('/pedidos');
  });

  test('PD37 — responsivo: página utilizável em viewport mobile', async ({ page }) => {
    const p = new PedidosPage(page);
    await p.navigate();
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(800);
    await expect(p.novoPedidoButton).toBeVisible();
    await expect(p.searchInput).toBeVisible();
    await takeEvidenceScreenshot(page, test.info(), 'pedidos-responsivo-mobile');
  });

  test('PD38 — a11y: colunas ordenáveis têm aria-sort e dialog prende o foco', async ({ page }) => {
    const p = new PedidosPage(page);
    await p.navigate();
    // colunas ordenáveis expõem aria-sort
    expect(await p.getAriaSort('Colaborador')).not.toBeNull();
    expect(await p.getAriaSort('Status')).not.toBeNull();
    // ao abrir o dialog, o foco fica contido nele
    await p.abrirNovoPedido();
    const focoDentro = await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'));
    expect(focoDentro).toBe(true);
    await p.fecharViaX();
  });

});
