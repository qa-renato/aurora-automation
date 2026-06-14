import { test, expect } from '../../fixtures/test-fixtures';
import { PedidosPage } from '../../pages/PedidosPage';
import { takeEvidenceScreenshot } from '../../utils/screenshots';

// Módulo Pedidos de Protocolo (/pedidos) — Leitura, Tabela e Paginação.
// Colunas: Colaborador | Protocolo | Status | Criado em | Atendido em.
// OBS: a rota tem carregamento instável (token Keycloak); PedidosPage.navigate()
// aquece a sessão e tenta com retry.

test.describe('Pedidos — Tabela e Leitura', () => {

  test.beforeEach(async ({ page }) => {
    await new PedidosPage(page).navigate();
  });

  test('PD01 — deve exibir as 5 colunas corretas', async ({ page }) => {
    for (const col of ['Colaborador', 'Protocolo', 'Status', 'Criado em', 'Atendido em']) {
      await expect(page.locator('thead th').filter({ hasText: col })).toBeVisible();
    }
    await expect(page.locator('thead th')).toHaveCount(5);
  });

  test('PD02 — deve exibir a paginação inicial "Mostrando 1-10 de N itens"', async ({ page }) => {
    const p = new PedidosPage(page);
    expect(await p.getPaginationText()).toMatch(/^Mostrando 1-10 de \d+ itens$/);
    await takeEvidenceScreenshot(page, test.info(), 'pedidos-paginacao-inicial');
  });

  test('PD03 — coluna Colaborador deve exibir e-mails', async ({ page }) => {
    const p = new PedidosPage(page);
    const emails = await p.getColunaValores(1);
    expect(emails.length).toBeGreaterThan(0);
    for (const e of emails) expect(e).toContain('@');
  });

  test('PD04 — coluna Status deve exibir "Aberto" ou "Atendido"', async ({ page }) => {
    const p = new PedidosPage(page);
    const status = (await p.getStatusColuna()).filter(Boolean);
    expect(status.length).toBeGreaterThan(0);
    for (const s of status) expect(['Aberto', 'Atendido']).toContain(s);
  });

  test('PD05 — deve navegar para a próxima página', async ({ page }) => {
    const p = new PedidosPage(page);
    await p.irParaProximaPagina();
    expect(await p.getPaginationText()).toMatch(/^Mostrando 11-20 de \d+ itens$/);
    await expect(p.anteriorButton).toBeEnabled();
  });

  test('PD06 — deve voltar para a página anterior', async ({ page }) => {
    const p = new PedidosPage(page);
    await p.irParaProximaPagina();
    await p.irParaPaginaAnterior();
    expect(await p.getPaginationText()).toMatch(/^Mostrando 1-10 de \d+ itens$/);
    await expect(p.anteriorButton).toBeDisabled();
  });

  test('PD07 — deve alterar itens por página para 25', async ({ page }) => {
    const p = new PedidosPage(page);
    await p.selecionarItensPorPagina(25);
    expect(await p.getRowCount()).toBeGreaterThan(10);
    expect(await p.getPaginationText()).toMatch(/^Mostrando 1-/);
  });

  test('PD08 — deve alterar itens por página para 50', async ({ page }) => {
    const p = new PedidosPage(page);
    await p.selecionarItensPorPagina(50);
    expect(await p.getRowCount()).toBeGreaterThan(10);
  });

  test('PD09 — "Próxima" deve ficar desabilitada na última página', async ({ page }) => {
    const p = new PedidosPage(page);
    await p.irParaUltimaPagina();
    await expect(p.proximaButton).toBeDisabled();
  });

  test('PD10 — alterar itens por página deve voltar à página 1', async ({ page }) => {
    const p = new PedidosPage(page);
    await p.irParaProximaPagina();
    expect(await p.getPaginationText()).toMatch(/^Mostrando 11-/);
    await p.selecionarItensPorPagina(25);
    expect(await p.getPaginationText()).toMatch(/^Mostrando 1-/);
  });

});
