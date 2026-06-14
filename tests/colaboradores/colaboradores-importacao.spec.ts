import { test, expect } from '../../fixtures/test-fixtures';
import { ColaboradoresPage } from '../../pages/ColaboradoresPage';
import { gerarCsvImportacaoValido, TEMPLATE_HEADER } from '../../test-data/importacao';
import { takeEvidenceScreenshot } from '../../utils/screenshots';
import * as path from 'path';
import * as fs from 'fs';

const FIXTURES = path.join(__dirname, '..', '..', 'test-data', 'import');

test.describe('Colaboradores — Importar Planilha (fluxos completos)', () => {

  test.beforeEach(async ({ page }) => {
    await new ColaboradoresPage(page).navigate();
  });

  test('CT44 — importar CSV válido deve concluir com sucesso', async ({ page }) => {
    const p = new ColaboradoresPage(page);
    const { path: csv, quantidade } = gerarCsvImportacaoValido(2);
    await p.abrirDialogImportar();
    await p.anexarArquivoImportacao(csv);
    await expect(page.getByText(`${quantidade} novos colaboradores identificados`)).toBeVisible();
    await p.confirmarImportacao();
    await expect(page.getByText('Importação concluída!')).toBeVisible();
    await expect(page.getByText(`${quantidade} colaboradores importados com sucesso`)).toBeVisible();
    await takeEvidenceScreenshot(page, test.info(), 'importacao-sucesso');
  });

  test('CT45 — importar arquivo não-CSV deve ser rejeitado', async ({ page }) => {
    const p = new ColaboradoresPage(page);
    await p.abrirDialogImportar();
    await p.anexarArquivoImportacao(path.join(FIXTURES, 'nao-e-csv.txt'));
    await expect(page.getByText('Apenas arquivos .csv são aceitos')).toBeVisible();
    expect(await p.isConfirmarImportacaoHabilitado()).toBe(false);
    await takeEvidenceScreenshot(page, test.info(), 'importacao-arquivo-invalido');
  });

  test('CT46 — importar CSV com campos obrigatórios vazios deve bloquear', async ({ page }) => {
    const p = new ColaboradoresPage(page);
    await p.abrirDialogImportar();
    await p.anexarArquivoImportacao(path.join(FIXTURES, 'colaboradores-malformado.csv'));
    await expect(page.getByText(/linha\(s\) com campos obrigatórios vazios/)).toBeVisible();
    expect(await p.isConfirmarImportacaoHabilitado()).toBe(false);
    await takeEvidenceScreenshot(page, test.info(), 'importacao-csv-malformado');
  });

  test('CT47 — botão Template CSV deve baixar um .csv com os cabeçalhos corretos', async ({ page }) => {
    const p = new ColaboradoresPage(page);
    await p.abrirDialogImportar();
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      p.templateCsvButton.click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.csv$/i);
    const file = await download.path();
    const conteudo = fs.readFileSync(file!, 'utf8');
    expect(conteudo).toContain(TEMPLATE_HEADER);
  });

});
