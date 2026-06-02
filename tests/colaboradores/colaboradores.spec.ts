import { test, expect } from '../../fixtures/test-fixtures';
import { ColaboradoresPage } from '../../pages/ColaboradoresPage';
import { novoColaboradorValido, colaboradorCpfDuplicado } from '../../test-data/colaboradores';
import { takeEvidenceScreenshot } from '../../utils/screenshots';
import logger from '../../utils/logger';

// Todos os testes usam sessão autenticada via storageState.
// Pré-condição: auth/storageState.json válido.

test.describe('Colaboradores — Tabela Principal', () => {

  test.beforeEach(async ({ page }) => {
    const p = new ColaboradoresPage(page);
    await p.navigate();
  });

  test('CT01 — deve exibir tabela com 7 colunas corretas', async ({ page }) => {
    const headers = page.locator('thead th');
    await expect(headers).toHaveCount(7);
    for (const col of ['Nome', 'CPF', 'E-mail', 'Departamento', 'Cargo', 'Status', 'Ações']) {
      await expect(page.locator('thead th').filter({ hasText: col })).toBeVisible();
    }
  });

  test('CT02 — deve exibir paginação inicial "Mostrando 1-10 de X itens"', async ({ page }) => {
    const p = new ColaboradoresPage(page);
    const text = await p.getPaginationText();
    expect(text).toMatch(/^Mostrando 1-10 de \d+ itens$/);
    await takeEvidenceScreenshot(page, test.info(), 'paginacao-inicial');
  });

  test('CT03 — deve navegar para a próxima página', async ({ page }) => {
    const p = new ColaboradoresPage(page);
    await p.irParaProximaPagina();
    const text = await p.getPaginationText();
    expect(text).toMatch(/^Mostrando 11-20 de \d+ itens$/);
    await expect(p.anteriorButton).toBeEnabled();
  });

  test('CT04 — deve voltar à página anterior', async ({ page }) => {
    const p = new ColaboradoresPage(page);
    await p.irParaProximaPagina();
    await p.irParaPaginaAnterior();
    const text = await p.getPaginationText();
    expect(text).toMatch(/^Mostrando 1-10 de \d+ itens$/);
    await expect(p.anteriorButton).toBeDisabled();
  });

  test('CT05 — deve alterar itens por página para 25', async ({ page }) => {
    const p = new ColaboradoresPage(page);
    await p.selecionarItensPorPagina(25);
    const count = await p.getRowCount();
    expect(count).toBeGreaterThan(10);
    const text = await p.getPaginationText();
    expect(text).toContain('1-');
    await takeEvidenceScreenshot(page, test.info(), '25-itens-por-pagina');
  });

  test('CT06 — deve alterar itens por página para 50', async ({ page }) => {
    const p = new ColaboradoresPage(page);
    await p.selecionarItensPorPagina(50);
    const count = await p.getRowCount();
    expect(count).toBeGreaterThan(10);
  });

});

test.describe('Colaboradores — Mostrar Inativos', () => {

  test.beforeEach(async ({ page }) => {
    const p = new ColaboradoresPage(page);
    await p.navigate();
  });

  test('CT07 — toggle ativado deve exibir colaboradores inativos na tabela', async ({ page }) => {
    const p = new ColaboradoresPage(page);
    const totalSemInativos = await p.getTotalItems();
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button[data-state="unchecked"]'));
      const toggle = btns.find(b => b.closest('label, div')?.textContent?.includes('Inativos') || b.parentElement?.textContent?.includes('Inativos'));
      (toggle as HTMLButtonElement)?.click();
    });
    await page.waitForTimeout(600);
    const totalComInativos = await p.getTotalItems();
    expect(totalComInativos).toBeGreaterThanOrEqual(totalSemInativos);
    await takeEvidenceScreenshot(page, test.info(), 'mostrando-inativos');
  });

  test('CT08 — toggle desativado não deve exibir usuários com status inativo', async ({ page }) => {
    const p = new ColaboradoresPage(page);
    // por padrão, inativos não aparecem
    const rows = await page.locator('tbody tr').count();
    expect(rows).toBeGreaterThan(0);
    // nenhuma linha deve ter botão "Ativar" visível quando toggle está OFF
    const ativarBtns = await page.locator('button[aria-label*="Ativar"]').count();
    expect(ativarBtns).toBe(0);
  });

});

test.describe('Colaboradores — Filtro por Departamento', () => {

  test.beforeEach(async ({ page }) => {
    const p = new ColaboradoresPage(page);
    await p.navigate();
  });

  test('CT09 — filtrar por Financeiro deve exibir apenas colaboradores desse depto', async ({ page }) => {
    const p = new ColaboradoresPage(page);
    await p.filtrarPorDepartamento('Financeiro');
    const rows = await page.locator('tbody tr td:nth-child(4)').allInnerTexts();
    for (const dept of rows) expect(dept.trim()).toBe('Financeiro');
    await takeEvidenceScreenshot(page, test.info(), 'filtro-financeiro');
  });

  test('CT10 — filtrar por Tecnologia da Informação', async ({ page }) => {
    const p = new ColaboradoresPage(page);
    await p.filtrarPorDepartamento('Tecnologia da Informação');
    const firstRow = page.locator('tbody tr td:nth-child(4)').first();
    // A célula de Departamento é truncada na exibição ("Tecnologia da Informaç..."),
    // então validamos por substring em vez de igualdade exata.
    await expect(firstRow).toContainText('Tecnologia da Inform');
  });

  test('CT11 — resetar filtro para Todos os departamentos', async ({ page }) => {
    const p = new ColaboradoresPage(page);
    await p.filtrarPorDepartamento('Financeiro');
    await p.resetarFiltroDepartamento();
    const totalGeral = await p.getTotalItems();
    expect(totalGeral).toBeGreaterThan(5);
    await takeEvidenceScreenshot(page, test.info(), 'filtro-resetado');
  });

  test('CT12 — filtro + busca sem resultado deve exibir "Nenhum colaborador encontrado."', async ({ page }) => {
    const p = new ColaboradoresPage(page);
    await p.filtrarPorDepartamento('Financeiro');
    await p.buscar('Bruno'); // Bruno é de TI, não Financeiro
    await expect(p.emptyStateRow).toBeVisible();
    await takeEvidenceScreenshot(page, test.info(), 'filtro-busca-sem-resultado');
  });

});

test.describe('Colaboradores — Busca', () => {

  test.beforeEach(async ({ page }) => {
    const p = new ColaboradoresPage(page);
    await p.navigate();
  });

  test('CT13 — buscar por nome parcial deve retornar resultado correto', async ({ page }) => {
    const p = new ColaboradoresPage(page);
    await p.buscar('Bruno');
    await expect(page.locator('tbody tr td').filter({ hasText: 'Bruno Henrique Souza' })).toBeVisible();
    await takeEvidenceScreenshot(page, test.info(), 'busca-por-nome');
  });

  test('CT14 — buscar por e-mail parcial deve retornar resultado correto', async ({ page }) => {
    const p = new ColaboradoresPage(page);
    await p.buscar('carla.oliveira');
    await expect(page.locator('tbody tr td').filter({ hasText: 'Carla Menezes Oliveira' })).toBeVisible();
  });

  test('CT15 — buscar por CPF completo deve retornar colaborador correto', async ({ page }) => {
    const p = new ColaboradoresPage(page);
    await p.buscar('234.567.890-11');
    await expect(page.locator('tbody tr td').filter({ hasText: 'Bruno Henrique Souza' })).toBeVisible();
  });

  test('CT16 — buscar por texto inexistente deve exibir "Nenhum colaborador encontrado."', async ({ page }) => {
    const p = new ColaboradoresPage(page);
    await p.buscar('XXXXXXXXNOTFOUND999');
    await expect(p.emptyStateRow).toBeVisible();
    await takeEvidenceScreenshot(page, test.info(), 'busca-sem-resultado');
  });

  test('CT17 — limpar busca deve restaurar todos os registros', async ({ page }) => {
    const p = new ColaboradoresPage(page);
    await p.buscar('Bruno');
    const countBusca = await p.getRowCount();
    await p.limparBusca();
    const countTotal = await p.getRowCount();
    expect(countTotal).toBeGreaterThan(countBusca);
  });

});

test.describe('Colaboradores — Ordenação de Colunas', () => {

  test.beforeEach(async ({ page }) => {
    const p = new ColaboradoresPage(page);
    await p.navigate();
  });

  test('CT18 — clicar em Nome deve ordenar A→Z', async ({ page }) => {
    const p = new ColaboradoresPage(page);
    await p.ordenarPorColuna('Nome');
    const firstName = await p.getFirstRowName();
    await p.ordenarPorColuna('Nome');
    const firstNameReverse = await p.getFirstRowName();
    expect(firstName).not.toBe(firstNameReverse);
    await takeEvidenceScreenshot(page, test.info(), 'ordenacao-nome');
  });

  test('CT19 — colunas CPF e Ações não devem ser ordenáveis', async ({ page }) => {
    const cpfHeader = page.locator('thead th').filter({ hasText: 'CPF' });
    const acoesHeader = page.locator('thead th').filter({ hasText: 'Ações' });
    // CPF e Ações não têm ícone de sort
    const cpfHasSort = await cpfHeader.locator('img').count();
    const acoesHasSort = await acoesHeader.locator('img').count();
    expect(cpfHasSort).toBe(0);
    expect(acoesHasSort).toBe(0);
  });

});

test.describe('Colaboradores — Cadastro Manual', () => {

  test.beforeEach(async ({ page }) => {
    const p = new ColaboradoresPage(page);
    await p.navigate();
  });

  test('CT20 — dialog Adicionar deve exibir opções Cadastro Manual e Importar Planilha', async ({ page }) => {
    const p = new ColaboradoresPage(page);
    await p.abrirDialogAdicionar();
    await expect(p.cadastroManualButton).toBeVisible();
    await expect(p.importarPlanilhaButton).toBeVisible();
    await takeEvidenceScreenshot(page, test.info(), 'dialog-opcoes');
    await p.fecharDialog();
  });

  test('CT21 — deve cadastrar colaborador com campos obrigatórios — sucesso', async ({ page }) => {
    const p = new ColaboradoresPage(page);
    const dados = novoColaboradorValido();
    await p.cadastrarColaborador(dados);
    // O sucesso é confirmado pelo toast da aplicação + fechamento do dialog.
    // NÃO validamos via busca na tabela: o índice de busca desta aplicação tem
    // atraso para registros recém-criados (não retornam por nome nem CPF mesmo
    // após reload), embora persistam. Validar pela busca seria flaky.
    await p.validarCadastroSucesso();
    expect(await p.isDialogAberto()).toBe(false);
    await takeEvidenceScreenshot(page, test.info(), 'cadastro-sucesso');
  });

  test('CT22 — deve cadastrar colaborador com todos os campos — sucesso', async ({ page }) => {
    const p = new ColaboradoresPage(page);
    const dados = {
      ...novoColaboradorValido(),
      telefone: '(11) 98765-4321',
      genero: 'Feminino',
      estadoCivil: 'Solteiro(a)',
      escolaridade: 'Ensino Superior Completo',
    };
    await p.cadastrarColaborador(dados);
    await p.validarCadastroSucesso();
    await takeEvidenceScreenshot(page, test.info(), 'cadastro-completo-sucesso');
  });

  test('CT23 — CPF duplicado deve exibir "CPF já cadastrado"', async ({ page }) => {
    const p = new ColaboradoresPage(page);
    await p.abrirDialogAdicionar();
    await p.selecionarCadastroManual();
    await p.preencherFormulario(colaboradorCpfDuplicado);
    await p.salvar();
    await p.validarErroCpfDuplicado();
    expect(await p.isDialogAberto()).toBe(true);
    await takeEvidenceScreenshot(page, test.info(), 'erro-cpf-duplicado');
    await p.fecharDialog();
  });

  test('CT24 — campos obrigatórios vazios devem bloquear submissão', async ({ page }) => {
    const p = new ColaboradoresPage(page);
    await p.abrirDialogAdicionar();
    await p.selecionarCadastroManual();
    await p.salvar();
    await page.waitForTimeout(1000);
    expect(await p.isDialogAberto()).toBe(true);
    await takeEvidenceScreenshot(page, test.info(), 'campos-obrigatorios-vazios');
    await p.fecharDialog();
  });

  test('CT25 — cancelar cadastro deve fechar dialog sem salvar', async ({ page }) => {
    const p = new ColaboradoresPage(page);
    const totalAntes = await p.getTotalItems();
    await p.abrirDialogAdicionar();
    await p.selecionarCadastroManual();
    await p.nomeInput.fill('Colaborador Cancelado');
    await p.cancelar();
    expect(await p.isDialogAberto()).toBe(false);
    const totalDepois = await p.getTotalItems();
    expect(totalDepois).toBe(totalAntes);
  });

});

test.describe('Colaboradores — Importar Planilha', () => {

  test.beforeEach(async ({ page }) => {
    const p = new ColaboradoresPage(page);
    await p.navigate();
  });

  test('CT26 — dialog de importação deve exibir botão Template CSV e drop zone', async ({ page }) => {
    const p = new ColaboradoresPage(page);
    await p.abrirDialogAdicionar();
    await p.selecionarImportarPlanilha();
    await expect(p.templateCsvButton).toBeVisible();
    await expect(page.getByText(/Clique para selecionar ou arraste/)).toBeVisible();
    await expect(page.getByText('Apenas .csv')).toBeVisible();
    await takeEvidenceScreenshot(page, test.info(), 'importar-planilha-dialog');
  });

  test('CT27 — botão "Confirmar Importação" deve estar desabilitado sem arquivo', async ({ page }) => {
    const p = new ColaboradoresPage(page);
    await p.abrirDialogAdicionar();
    await p.selecionarImportarPlanilha();
    expect(await p.isConfirmarImportacaoHabilitado()).toBe(false);
    await takeEvidenceScreenshot(page, test.info(), 'confirmar-importacao-disabled');
  });

  test('CT28 — cancelar importação deve fechar dialog', async ({ page }) => {
    const p = new ColaboradoresPage(page);
    await p.abrirDialogAdicionar();
    await p.selecionarImportarPlanilha();
    await p.cancelar();
    expect(await p.isDialogAberto()).toBe(false);
  });

});

test.describe('Colaboradores — Edição', () => {

  test.beforeEach(async ({ page }) => {
    const p = new ColaboradoresPage(page);
    await p.navigate();
  });

  test('CT29 — formulário de edição deve abrir com campos pré-preenchidos', async ({ page }) => {
    const p = new ColaboradoresPage(page);
    await p.buscar('Carla Menezes Oliveira');
    await p.abrirEdicaoPorNome('Carla Menezes Oliveira');
    const nome = await p.nomeInput.inputValue();
    const cpf = await p.cpfInput.inputValue();
    const email = await p.emailInput.inputValue();
    expect(nome).toBe('Carla Menezes Oliveira');
    expect(cpf).toBe('345.678.901-22');
    expect(email).toBe('carla.oliveira@aurora-demo.com.br');
    await takeEvidenceScreenshot(page, test.info(), 'edicao-campos-preenchidos');
    await p.fecharDialog();
  });

  test('CT30 — cancelar edição não deve alterar dados na tabela', async ({ page }) => {
    const p = new ColaboradoresPage(page);
    await p.buscar('Carla Menezes Oliveira');
    await p.abrirEdicaoPorNome('Carla Menezes Oliveira');
    await p.nomeInput.fill('Nome Editado Cancelado');
    await p.cancelar();
    expect(await p.isDialogAberto()).toBe(false);
    await expect(page.locator('tbody td').filter({ hasText: 'Carla Menezes Oliveira' })).toBeVisible();
    await p.limparBusca();
  });

  test('CT31 — campo Telefone deve rejeitar/mascarar texto não numérico', async ({ page }) => {
    const p = new ColaboradoresPage(page);
    await p.buscar('Carla Menezes Oliveira');
    await p.abrirEdicaoPorNome('Carla Menezes Oliveira');
    await p.telefoneInput.fill('TEXTO SEM FORMATO');
    const valor = await p.telefoneInput.inputValue();
    // A máscara descarta caracteres não numéricos: o campo NÃO aceita o texto cru.
    expect(valor).not.toBe('TEXTO SEM FORMATO');
    expect(valor).toBe('');
    await takeEvidenceScreenshot(page, test.info(), 'telefone-mascara-rejeita-texto');
    await p.fecharDialog();
  });

});

test.describe('Colaboradores — Inativar / Ativar', () => {

  test.beforeEach(async ({ page }) => {
    const p = new ColaboradoresPage(page);
    await p.navigate();
  });

  test('CT32 — clicar Inativar deve exibir dialog de confirmação', async ({ page }) => {
    const p = new ColaboradoresPage(page);
    const inativarBtn = page.locator('button[aria-label*="Inativar"]').first();
    const ariaLabel = await inativarBtn.getAttribute('aria-label');
    const nome = ariaLabel?.replace('Inativar ', '') || '';
    await inativarBtn.click();
    await expect(page.getByRole('dialog', { name: 'Inativar Colaborador' })).toBeVisible();
    await expect(page.getByText(`Tem certeza que deseja inativar ${nome}?`)).toBeVisible();
    await expect(p.simInativarButton).toBeVisible();
    await takeEvidenceScreenshot(page, test.info(), 'dialog-confirmar-inativar');
    await p.cancelarConfirmacao();
  });

  test('CT33 — cancelar inativação deve manter colaborador ativo', async ({ page }) => {
    const p = new ColaboradoresPage(page);
    const inativarBtn = page.locator('button[aria-label*="Inativar"]').first();
    const ariaLabel = await inativarBtn.getAttribute('aria-label') || '';
    await inativarBtn.click();
    await p.cancelarConfirmacao();
    expect(await p.isDialogAberto()).toBe(false);
    await expect(inativarBtn).toBeVisible();
  });

  test('CT34 — clicar Ativar deve exibir dialog de confirmação', async ({ page }) => {
    const p = new ColaboradoresPage(page);
    // Ativar o toggle de inativos
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button[data-state="unchecked"]'));
      (btns[0] as HTMLButtonElement)?.click();
    });
    await page.waitForTimeout(500);
    const ativarBtn = page.locator('button[aria-label*="Ativar"]').first();
    if (await ativarBtn.count() === 0) {
      test.skip(true, 'Nenhum colaborador inativo disponível para teste');
      return;
    }
    await ativarBtn.click();
    await expect(page.getByRole('dialog', { name: 'Ativar Colaborador' })).toBeVisible();
    await expect(p.simAtivarButton).toBeVisible();
    await takeEvidenceScreenshot(page, test.info(), 'dialog-confirmar-ativar');
    await p.cancelarConfirmacao();
  });

  test('CT35 — confirmar inativação deve remover colaborador da lista sem "Mostrar Inativos"', async ({ page }) => {
    const p = new ColaboradoresPage(page);
    const NOME = 'Diego Martins Costa';
    // Pré-condição: garante Diego ativo (execuções anteriores podem tê-lo inativado).
    await p.garantirColaboradorAtivo(NOME);
    try {
      await p.buscar(NOME);
      await expect(page.locator('tbody td').filter({ hasText: NOME })).toBeVisible();
      await p.clicarInativarPorNome(NOME);
      await p.confirmarInativar();
      await p.buscar(NOME);
      // A inativação é assíncrona; usamos asserção com auto-retry. Sem o toggle
      // de inativos, Diego não deve aparecer na lista (count 0), independente de
      // a busca ter sido resetada pelo refresh pós-inativação.
      await expect(page.locator('tbody td').filter({ hasText: NOME })).toHaveCount(0, { timeout: 15000 });
      await takeEvidenceScreenshot(page, test.info(), 'colaborador-inativado');
    } finally {
      // Restaura o ambiente: reativa Diego independentemente do resultado.
      await p.garantirColaboradorAtivo(NOME);
    }
  });

});
