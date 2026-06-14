import { test, expect } from '../../fixtures/test-fixtures';
import { PedidosPage } from '../../pages/PedidosPage';
import { takeEvidenceScreenshot } from '../../utils/screenshots';

// Busca (por e-mail do colaborador) e Ordenação de colunas.

test.describe('Pedidos — Busca por e-mail', () => {

  test.beforeEach(async ({ page }) => {
    await new PedidosPage(page).navigate();
  });

  test('PD11 — buscar por e-mail deve filtrar a tabela', async ({ page }) => {
    const p = new PedidosPage(page);
    await p.buscar('bruno.souza');
    const emails = (await p.getColunaValores(1)).filter(Boolean);
    expect(emails.length).toBeGreaterThan(0);
    for (const e of emails) expect(e).toContain('bruno.souza');
    await takeEvidenceScreenshot(page, test.info(), 'pedidos-busca-email');
  });

  test('PD12 — buscar por e-mail parcial deve retornar resultados', async ({ page }) => {
    const p = new PedidosPage(page);
    await p.buscar('aurora-demo.com.br');
    expect(await p.getRowCount()).toBeGreaterThan(0);
  });

  test('PD13 — busca deve ser case-insensitive', async ({ page }) => {
    const p = new PedidosPage(page);
    await p.buscar('BRUNO.SOUZA');
    const emails = (await p.getColunaValores(1)).filter(Boolean);
    expect(emails.length).toBeGreaterThan(0);
    for (const e of emails) expect(e.toLowerCase()).toContain('bruno.souza');
  });

  test('PD14 — busca sem resultado deve esvaziar a tabela', async ({ page }) => {
    const p = new PedidosPage(page);
    await p.buscar('xxxxxx-inexistente-999@nada.com');
    const emails = (await p.getColunaValores(1)).filter(Boolean);
    const vazio = emails.length === 0 || await p.emptyStateRow.isVisible().catch(() => false);
    expect(vazio).toBe(true);
  });

  test('PD15 — limpar busca deve restaurar a lista', async ({ page }) => {
    const p = new PedidosPage(page);
    await p.buscar('bruno.souza');
    const filtrado = await p.getRowCount();
    await p.limparBusca();
    expect(await p.getRowCount()).toBeGreaterThanOrEqual(filtrado);
  });

});

test.describe('Pedidos — Ordenação', () => {

  test.beforeEach(async ({ page }) => {
    await new PedidosPage(page).navigate();
  });

  test('PD16 — ordenar por Colaborador (asc/desc)', async ({ page }) => {
    const p = new PedidosPage(page);
    await p.ordenarPorColuna('Colaborador');
    expect(await p.getAriaSort('Colaborador')).toBe('ascending');
    const asc = (await p.getColunaValores(1))[0];
    await p.ordenarPorColuna('Colaborador');
    expect(await p.getAriaSort('Colaborador')).toBe('descending');
    const desc = (await p.getColunaValores(1))[0];
    expect(asc).not.toBe(desc);
  });

  test('PD17 — ordenar por Protocolo (asc/desc)', async ({ page }) => {
    const p = new PedidosPage(page);
    await p.ordenarPorColuna('Protocolo');
    expect(await p.getAriaSort('Protocolo')).toBe('ascending');
    const asc = (await p.getColunaValores(2))[0];
    await p.ordenarPorColuna('Protocolo');
    expect(await p.getAriaSort('Protocolo')).toBe('descending');
    expect(asc).not.toBe((await p.getColunaValores(2))[0]);
  });

  test('PD18 — ordenar por Status (asc/desc)', async ({ page }) => {
    const p = new PedidosPage(page);
    await p.ordenarPorColuna('Status');
    expect(await p.getAriaSort('Status')).toBe('ascending');
    const asc = await p.getStatusColuna();
    await p.ordenarPorColuna('Status');
    expect(await p.getAriaSort('Status')).toBe('descending');
    const desc = await p.getStatusColuna();
    const temMix = new Set([...asc, ...desc].filter(Boolean)).size > 1;
    test.skip(!temMix, 'Sem mistura de status para validar ordenação');
    expect(asc[0]).not.toBe(desc[0]);
  });

  test('PD19 — ordenar por Criado em (asc/desc)', async ({ page }) => {
    const p = new PedidosPage(page);
    await p.ordenarPorColuna('Criado em');
    expect(await p.getAriaSort('Criado em')).toBe('ascending');
    const asc = (await p.getColunaValores(4))[0];
    await p.ordenarPorColuna('Criado em');
    expect(await p.getAriaSort('Criado em')).toBe('descending');
    expect(asc).not.toBe((await p.getColunaValores(4))[0]);
  });

  test('PD20 — coluna "Atendido em" não deve ser ordenável', async ({ page }) => {
    const p = new PedidosPage(page);
    expect(await p.getAriaSort('Atendido em')).toBeNull();
  });

  test('PD21 — clique no cabeçalho alterna asc → desc (aria-sort)', async ({ page }) => {
    const p = new PedidosPage(page);
    expect(await p.getAriaSort('Colaborador')).toBe('none');
    await p.ordenarPorColuna('Colaborador');
    expect(await p.getAriaSort('Colaborador')).toBe('ascending');
    await p.ordenarPorColuna('Colaborador');
    expect(await p.getAriaSort('Colaborador')).toBe('descending');
  });

});
