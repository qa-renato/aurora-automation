import { test, expect } from '../../fixtures/test-fixtures';
import { ColaboradoresPage } from '../../pages/ColaboradoresPage';
import { takeEvidenceScreenshot } from '../../utils/screenshots';

// Ordenação — o CT18 original só cobre "Nome". Existem 5 colunas ordenáveis
// (Nome, E-mail, Departamento, Cargo, Status), verificadas via aria-sort.

test.describe('Colaboradores — Ordenação de Colunas (cobertura completa)', () => {

  test.beforeEach(async ({ page }) => {
    await new ColaboradoresPage(page).navigate();
  });

  test('CT48 — ordenar por E-mail (asc/desc) deve reordenar a tabela', async ({ page }) => {
    const p = new ColaboradoresPage(page);
    await p.ordenarPorColuna('E-mail');
    expect(await p.getAriaSort('E-mail')).toBe('ascending');
    const asc = (await p.getColunaValores(3))[0];
    await p.ordenarPorColuna('E-mail');
    expect(await p.getAriaSort('E-mail')).toBe('descending');
    const desc = (await p.getColunaValores(3))[0];
    expect(asc).not.toBe(desc);
    await takeEvidenceScreenshot(page, test.info(), 'ordenacao-email');
  });

  test('CT49 — ordenar por Departamento (asc/desc) deve reordenar a tabela', async ({ page }) => {
    const p = new ColaboradoresPage(page);
    await p.ordenarPorColuna('Departamento');
    expect(await p.getAriaSort('Departamento')).toBe('ascending');
    const asc = (await p.getColunaValores(4))[0];
    await p.ordenarPorColuna('Departamento');
    expect(await p.getAriaSort('Departamento')).toBe('descending');
    const desc = (await p.getColunaValores(4))[0];
    expect(asc).not.toBe(desc);
  });

  test('CT50 — ordenar por Cargo (asc/desc) deve reordenar a tabela', async ({ page }) => {
    const p = new ColaboradoresPage(page);
    await p.ordenarPorColuna('Cargo');
    expect(await p.getAriaSort('Cargo')).toBe('ascending');
    const asc = (await p.getColunaValores(5))[0];
    await p.ordenarPorColuna('Cargo');
    expect(await p.getAriaSort('Cargo')).toBe('descending');
    const desc = (await p.getColunaValores(5))[0];
    expect(asc).not.toBe(desc);
  });

  test('CT51 — ordenar por Status deve agrupar ativos/inativos', async ({ page }) => {
    const p = new ColaboradoresPage(page);
    await p.setMostrarInativos(true);
    await p.ordenarPorColuna('Status');
    expect(await p.getAriaSort('Status')).toBe('ascending');
    const tiposAsc = await p.getStatusTipos();
    await p.ordenarPorColuna('Status');
    expect(await p.getAriaSort('Status')).toBe('descending');
    const tiposDesc = await p.getStatusTipos();
    // havendo ativos e inativos, o topo da lista troca de grupo ao inverter
    const temMix = new Set([...tiposAsc, ...tiposDesc]).size > 1;
    test.skip(!temMix, 'Sem mistura de ativos/inativos para validar agrupamento');
    expect(tiposAsc[0]).not.toBe(tiposDesc[0]);
    await takeEvidenceScreenshot(page, test.info(), 'ordenacao-status');
    await p.setMostrarInativos(false);
  });

  test('CT52 — clique no cabeçalho deve alternar asc → desc (aria-sort)', async ({ page }) => {
    const p = new ColaboradoresPage(page);
    expect(await p.getAriaSort('Nome')).toBe('none');
    await p.ordenarPorColuna('Nome');
    expect(await p.getAriaSort('Nome')).toBe('ascending');
    await p.ordenarPorColuna('Nome');
    expect(await p.getAriaSort('Nome')).toBe('descending');
  });

});
