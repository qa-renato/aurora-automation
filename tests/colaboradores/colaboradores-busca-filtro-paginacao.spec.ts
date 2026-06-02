import { test, expect } from '../../fixtures/test-fixtures';
import { ColaboradoresPage } from '../../pages/ColaboradoresPage';
import { takeEvidenceScreenshot } from '../../utils/screenshots';

test.describe('Colaboradores — Busca (variações)', () => {

  test.beforeEach(async ({ page }) => {
    await new ColaboradoresPage(page).navigate();
  });

  test('CT53 — busca deve ser case-insensitive', async ({ page }) => {
    const p = new ColaboradoresPage(page);
    await p.buscar('bruno henrique souza');
    await expect(page.locator('tbody td').filter({ hasText: 'Bruno Henrique Souza' })).toBeVisible();
  });

  test('CT54 — busca deve ignorar acentuação', async ({ page }) => {
    const p = new ColaboradoresPage(page);
    await p.buscar('vinicius'); // sem acento
    await expect(page.locator('tbody td').filter({ hasText: 'Vinícius Amaral Peixoto' })).toBeVisible();
    await takeEvidenceScreenshot(page, test.info(), 'busca-sem-acento');
  });

  test('CT55 — buscar deveria retornar à página 1 [BUG]', async ({ page }) => {
    test.fail(true, 'BUG: ao buscar estando em página > 1, a app não retorna à página 1.');
    const p = new ColaboradoresPage(page);
    await p.irParaProximaPagina();
    await p.buscar('a'); // termo amplo: mantém várias páginas
    expect(await p.getPaginationText()).toMatch(/^Mostrando 1-/);
  });

  test('CT56 — busca deveria ignorar espaços nas pontas (trim) [BUG]', async ({ page }) => {
    test.fail(true, 'BUG: espaços no início/fim do termo não são removidos; a busca não encontra.');
    const p = new ColaboradoresPage(page);
    await p.buscar('  Bruno  ');
    await expect(page.locator('tbody td').filter({ hasText: 'Bruno Henrique Souza' })).toBeVisible();
  });

});

test.describe('Colaboradores — Filtro por Departamento (combinações)', () => {

  test.beforeEach(async ({ page }) => {
    await new ColaboradoresPage(page).navigate();
  });

  test('CT57 — filtro + ordenação devem coexistir', async ({ page }) => {
    const p = new ColaboradoresPage(page);
    await p.filtrarPorDepartamento('Financeiro');
    await p.ordenarPorColuna('Nome');
    expect(await p.getAriaSort('Nome')).toBe('ascending');
    const deptos = await p.getColunaValores(4);
    expect(deptos.length).toBeGreaterThan(0);
    for (const d of deptos) expect(d).toBe('Financeiro');
    await takeEvidenceScreenshot(page, test.info(), 'filtro-mais-ordenacao');
  });

  test('CT58 — filtro + "Mostrar Inativos" devem coexistir', async ({ page }) => {
    const p = new ColaboradoresPage(page);
    await p.filtrarPorDepartamento('Financeiro');
    const semInativos = await p.getTotalItems();
    await p.setMostrarInativos(true);
    const comInativos = await p.getTotalItems();
    expect(comInativos).toBeGreaterThanOrEqual(semInativos);
    const deptos = await p.getColunaValores(4);
    for (const d of deptos) expect(d).toBe('Financeiro');
    await p.setMostrarInativos(false);
  });

  test('CT59 — filtro deve ser mantido ao paginar', async ({ page }) => {
    const p = new ColaboradoresPage(page);
    await p.filtrarPorDepartamento('Tecnologia da Informação');
    const temProxima = await p.proximaButton.isEnabled().catch(() => false);
    test.skip(!temProxima, 'Departamento sem páginas suficientes para validar');
    await p.irParaProximaPagina();
    const deptos = await p.getColunaValores(4);
    expect(deptos.length).toBeGreaterThan(0);
    for (const d of deptos) expect(d).toContain('Tecnologia');
  });

});

test.describe('Colaboradores — Paginação (limites)', () => {

  test.beforeEach(async ({ page }) => {
    await new ColaboradoresPage(page).navigate();
  });

  test('CT60 — "Próxima" deve ficar desabilitada na última página', async ({ page }) => {
    const p = new ColaboradoresPage(page);
    await p.irParaUltimaPagina();
    await expect(p.proximaButton).toBeDisabled();
    await takeEvidenceScreenshot(page, test.info(), 'paginacao-ultima');
  });

  test('CT61 — última página deve exibir o intervalo final correto', async ({ page }) => {
    const p = new ColaboradoresPage(page);
    await p.irParaUltimaPagina();
    const text = await p.getPaginationText();
    const m = text.match(/^Mostrando \d+-(\d+) de (\d+) itens$/);
    expect(m).not.toBeNull();
    // auto-consistente: na última página o fim do intervalo == total exibido
    expect(Number(m![1])).toBe(Number(m![2]));
  });

  test('CT62 — alterar itens por página deve voltar à página 1', async ({ page }) => {
    const p = new ColaboradoresPage(page);
    await p.irParaProximaPagina();
    expect(await p.getPaginationText()).toMatch(/^Mostrando 11-/);
    await p.selecionarItensPorPagina(25);
    expect(await p.getPaginationText()).toMatch(/^Mostrando 1-/);
  });

});
