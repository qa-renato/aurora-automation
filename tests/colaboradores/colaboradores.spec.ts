import { test, expect } from '../../fixtures/test-fixtures';
import { ColaboradoresPage } from '../../pages/ColaboradoresPage';
import { novoColaboradorValido, colaboradorCpfDuplicado } from '../../test-data/colaboradores';
import { takeEvidenceScreenshot } from '../../utils/screenshots';
import logger from '../../utils/logger';

// Usa sessão autenticada via storageState — sem re-login necessário
test.describe('Colaboradores — Cadastro Manual', () => {

  test.beforeEach(async ({ page }) => {
    const colaboradoresPage = new ColaboradoresPage(page);
    await colaboradoresPage.navigate();
  });

  // ─── Teste 1: Cadastro completo com dados válidos ─────────────────────────
  test('deve cadastrar colaborador via Cadastro Manual com sucesso', async ({ page }, testInfo) => {
    const colaboradoresPage = new ColaboradoresPage(page);
    const dados = novoColaboradorValido();

    logger.info(`[${testInfo.title}] CPF gerado: ${dados.cpf}`);

    // Capturar total antes do cadastro
    const totalAntes = await colaboradoresPage.getTotalColaboradores();
    logger.info(`Total antes: ${totalAntes}`);

    // Fluxo: Adicionar → Cadastro Manual → preencher → Salvar
    await colaboradoresPage.abrirDialogAdicionar();
    await takeEvidenceScreenshot(page, testInfo, '01-dialog-tipo');

    await colaboradoresPage.selecionarCadastroManual();
    await takeEvidenceScreenshot(page, testInfo, '02-form-vazio');

    await colaboradoresPage.preencherFormulario(dados);
    await takeEvidenceScreenshot(page, testInfo, '03-form-preenchido');

    await colaboradoresPage.salvar();

    // Validar toast de sucesso
    await colaboradoresPage.validarCadastroSucesso();
    await takeEvidenceScreenshot(page, testInfo, '04-toast-sucesso');

    // Validar que o dialog fechou
    expect(await colaboradoresPage.isDialogAberto()).toBe(false);

    // Buscar pelo CPF único e validar na tabela
    await colaboradoresPage.validarColaboradorNaTabela(dados.nome, dados.cpf);
    await takeEvidenceScreenshot(page, testInfo, '05-colaborador-na-tabela');

    logger.info(`[${testInfo.title}] Concluído — "${dados.nome}" cadastrado`);
  });

  // ─── Teste 2: Validação de CPF duplicado ──────────────────────────────────
  test('deve exibir erro ao tentar cadastrar CPF já existente', async ({ page }, testInfo) => {
    const colaboradoresPage = new ColaboradoresPage(page);

    logger.info(`[${testInfo.title}] CPF duplicado: ${colaboradorCpfDuplicado.cpf}`);

    await colaboradoresPage.abrirDialogAdicionar();
    await colaboradoresPage.selecionarCadastroManual();
    await colaboradoresPage.preencherFormulario(colaboradorCpfDuplicado);
    await colaboradoresPage.salvar();

    // Validar mensagem de erro
    await colaboradoresPage.validarErroCpfDuplicado();
    await takeEvidenceScreenshot(page, testInfo, '01-erro-cpf-duplicado');

    // Dialog deve permanecer aberto
    expect(await colaboradoresPage.isDialogAberto()).toBe(true);

    logger.info(`[${testInfo.title}] Erro de CPF duplicado validado`);
  });

  // ─── Teste 3: Dialog exibe opções Cadastro Manual e Importar Planilha ─────
  test('deve exibir as opções Cadastro Manual e Importar Planilha no dialog', async ({ page }, testInfo) => {
    const colaboradoresPage = new ColaboradoresPage(page);

    await colaboradoresPage.abrirDialogAdicionar();

    await expect(page.getByRole('button', { name: /Cadastro Manual/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Importar Planilha/i })).toBeVisible();
    await takeEvidenceScreenshot(page, testInfo, '01-opcoes-dialog');

    logger.info(`[${testInfo.title}] Opções do dialog validadas`);
  });

  // ─── Teste 4: Campos obrigatórios impedem envio sem preenchimento ──────────
  test('não deve salvar com campos obrigatórios vazios', async ({ page }, testInfo) => {
    const colaboradoresPage = new ColaboradoresPage(page);

    await colaboradoresPage.abrirDialogAdicionar();
    await colaboradoresPage.selecionarCadastroManual();

    // Tentar salvar sem preencher nada
    await colaboradoresPage.salvar();
    await page.waitForTimeout(1000);

    // Dialog deve permanecer aberto (form inválido)
    expect(await colaboradoresPage.isDialogAberto()).toBe(true);
    await takeEvidenceScreenshot(page, testInfo, '01-campos-obrigatorios-vazios');

    logger.info(`[${testInfo.title}] Bloqueio de campos obrigatórios validado`);
  });

});
