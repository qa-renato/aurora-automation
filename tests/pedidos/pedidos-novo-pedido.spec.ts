import { test, expect } from '../../fixtures/test-fixtures';
import { PedidosPage } from '../../pages/PedidosPage';
import { takeEvidenceScreenshot } from '../../utils/screenshots';

// Criação de pedidos: escolha de tipo (Individual / Em Lote) e cada fluxo.
// Protocolos disponíveis: BAI, BHS, BDI, BSI, COPSOQ.

test.describe('Pedidos — Novo Pedido (escolha de tipo)', () => {

  test.beforeEach(async ({ page }) => {
    await new PedidosPage(page).navigate();
  });

  test('PD22 — dialog deve oferecer "Individual" e "Em Lote"', async ({ page }) => {
    const p = new PedidosPage(page);
    await p.abrirNovoPedido();
    await expect(page.getByText(/^Individual/).first()).toBeVisible();
    await expect(page.getByText(/^Em Lote/).first()).toBeVisible();
    await takeEvidenceScreenshot(page, test.info(), 'pedidos-novo-tipos');
    await p.fecharViaX();
  });

  test('PD29 — dialog deve fechar pelo botão X', async ({ page }) => {
    const p = new PedidosPage(page);
    await p.abrirNovoPedido();
    await p.fecharViaX();
    expect(await p.isDialogAberto()).toBe(false);
  });

});

test.describe('Pedidos — Novo Pedido Individual', () => {

  test.beforeEach(async ({ page }) => {
    await new PedidosPage(page).navigate();
  });

  test('PD23 — formulário exibe os campos Protocolo e Colaborador', async ({ page }) => {
    const p = new PedidosPage(page);
    await p.abrirNovoPedido();
    await p.selecionarIndividual();
    await expect(p.protocoloCombobox).toBeVisible();
    await expect(p.colaboradorCombobox).toBeVisible();
    await expect(p.criarPedidoButton).toBeVisible();
    await p.fecharViaX();
  });

  test('PD24 — combobox Protocolo lista os 5 protocolos', async ({ page }) => {
    const p = new PedidosPage(page);
    await p.abrirNovoPedido();
    await p.selecionarIndividual();
    await p.protocoloCombobox.click();
    for (const proto of ['BAI', 'BHS', 'BDI', 'BSI', 'COPSOQ']) {
      await expect(page.getByRole('option', { name: proto, exact: true })).toBeVisible();
    }
    await page.keyboard.press('Escape');
    await p.fecharViaX();
  });

  test('PD25 — combobox Colaborador lista colaboradores', async ({ page }) => {
    const p = new PedidosPage(page);
    await p.abrirNovoPedido();
    await p.selecionarIndividual();
    await p.colaboradorCombobox.click();
    const opts = await page.getByRole('option').allInnerTexts();
    expect(opts.length).toBeGreaterThan(0);
    expect(opts.some(o => o.includes('@'))).toBe(true);
    await page.keyboard.press('Escape');
    await p.fecharViaX();
  });

  test('PD26 — "Criar Pedido" deve exigir protocolo e colaborador', async ({ page }) => {
    const p = new PedidosPage(page);
    await p.abrirNovoPedido();
    await p.selecionarIndividual();
    // sem preencher: criação não deve prosseguir (botão desabilitado ou dialog continua aberto)
    const habilitadoVazio = await p.criarPedidoButton.isEnabled().catch(() => true);
    if (habilitadoVazio) {
      await p.criarPedidoButton.click();
      await page.waitForTimeout(800);
      expect(await p.isDialogAberto()).toBe(true); // permaneceu no formulário
    } else {
      expect(habilitadoVazio).toBe(false);
    }
    await p.fecharViaX();
  });

  test('PD27 — criar pedido individual envia escrita processada pela API', async ({ page }) => {
    const p = new PedidosPage(page);
    await p.abrirNovoPedido();
    await p.selecionarIndividual();
    await p.selecionarProtocoloNoForm('COPSOQ');
    // escolhe o 1º colaborador da lista (dinâmico, sem nome fixo)
    await p.colaboradorCombobox.click();
    await page.getByRole('option').first().click();
    const [resp] = await Promise.all([
      page.waitForResponse(
        (r) => /\/pedidos(\/|$|\?)/.test(r.url()) && r.request().method() === 'POST',
        { timeout: 10000 },
      ),
      p.criarPedidoButton.click(),
    ]);
    // 201 = pedido criado; 409 = colaborador já tem pedido aberto p/ o protocolo
    // (regra de negócio). Ambos provam que o fluxo de criação chega à API e é
    // processado (escrita não bloqueada na sessão automatizada).
    expect([201, 409], `POST /pedidos retornou ${resp.status()}`).toContain(resp.status());
    if (resp.status() === 201) await expect(p.dialog).toBeHidden({ timeout: 10000 });
    await takeEvidenceScreenshot(page, test.info(), 'pedidos-individual-criado');
    await p.fecharViaX().catch(() => {});
  });

  test('PD28 — "Voltar" retorna à escolha de tipo', async ({ page }) => {
    const p = new PedidosPage(page);
    await p.abrirNovoPedido();
    await p.selecionarIndividual();
    await p.voltar();
    await expect(page.getByText(/^Individual/).first()).toBeVisible();
    await expect(page.getByText(/^Em Lote/).first()).toBeVisible();
    await p.fecharViaX();
  });

});

test.describe('Pedidos — Novo Pedido Em Lote', () => {

  test.beforeEach(async ({ page }) => {
    await new PedidosPage(page).navigate();
  });

  test('PD30 — Em Lote exibe Protocolo e aviso de criação em massa', async ({ page }) => {
    const p = new PedidosPage(page);
    await p.abrirNovoPedido();
    await p.selecionarEmLote();
    await expect(p.protocoloCombobox).toBeVisible();
    await expect(page.getByText(/todos os \d+ colaboradores ativos/i)).toBeVisible();
    await expect(page.getByText(/já possuem pedido aberto.*ignorados/i)).toBeVisible();
    await takeEvidenceScreenshot(page, test.info(), 'pedidos-em-lote-aviso');
    await p.fecharViaX();
  });

  test('PD31 — Em Lote: combobox Protocolo lista os protocolos', async ({ page }) => {
    const p = new PedidosPage(page);
    await p.abrirNovoPedido();
    await p.selecionarEmLote();
    await p.protocoloCombobox.click();
    for (const proto of ['BAI', 'BHS', 'BDI', 'BSI', 'COPSOQ']) {
      await expect(page.getByRole('option', { name: proto, exact: true })).toBeVisible();
    }
    await page.keyboard.press('Escape');
    await p.fecharViaX();
  });

  test('PD32 — Em Lote: "Criar em Lote" habilita após selecionar protocolo', async ({ page }) => {
    const p = new PedidosPage(page);
    await p.abrirNovoPedido();
    await p.selecionarEmLote();
    // NÃO submetemos (criação em lote afeta todos os ativos — destrutivo p/ a base).
    await p.selecionarProtocoloNoForm('BAI');
    await expect(p.criarEmLoteButton).toBeEnabled();
    await p.fecharViaX();
  });

  test('PD33 — Em Lote: "Voltar" retorna à escolha de tipo', async ({ page }) => {
    const p = new PedidosPage(page);
    await p.abrirNovoPedido();
    await p.selecionarEmLote();
    await p.voltar();
    await expect(page.getByText(/^Individual/).first()).toBeVisible();
    await p.fecharViaX();
  });

});
