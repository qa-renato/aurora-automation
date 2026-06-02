import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import logger from '../utils/logger';
import { getEnvironmentConfig } from '../config/environments';

// ─── Seletores verificados via inspeção real da aplicação (MCP Playwright) ────
// Página: https://sandbox-inbot-aurora.vercel.app/colaboradores
// Mapeamento completo: todos os fluxos, campos e mensagens verificados no DOM real

export interface ColaboradorData {
  nome: string;
  cpf: string;
  email: string;
  dataNascimento: string;
  departamento: string;
  cargo: string;
  telefone?: string;
  genero?: string;
  estadoCivil?: string;
  escolaridade?: string;
}

export class ColaboradoresPage extends BasePage {
  protected readonly pageUrl: string;

  // ─── Controles da página principal ────────────────────────────────────────
  readonly adicionarButton: Locator;
  readonly mostrarInativosToggle: Locator;
  readonly departamentoFilter: Locator;
  readonly searchInput: Locator;
  readonly itensPorPaginaCombobox: Locator;
  readonly proximaButton: Locator;
  readonly anteriorButton: Locator;
  readonly paginationInfo: Locator;

  // ─── Tabela ────────────────────────────────────────────────────────────────
  readonly tableBody: Locator;
  readonly tableRows: Locator;
  readonly emptyStateRow: Locator;
  readonly colNome: Locator;
  readonly colEmail: Locator;
  readonly colDepartamento: Locator;
  readonly colCargo: Locator;
  readonly colStatus: Locator;

  // ─── Dialog seleção de tipo (após clicar Adicionar) ───────────────────────
  readonly cadastroManualButton: Locator;
  readonly importarPlanilhaButton: Locator;

  // ─── Formulário Cadastro Manual / Editar ──────────────────────────────────
  readonly nomeInput: Locator;
  readonly cpfInput: Locator;
  readonly emailInput: Locator;
  readonly dataNascimentoInput: Locator;
  readonly departamentoCombobox: Locator;
  readonly cargoCombobox: Locator;
  readonly telefoneInput: Locator;
  readonly salvarButton: Locator;
  readonly cancelarButton: Locator;

  // ─── Dialog Importar Planilha ─────────────────────────────────────────────
  readonly templateCsvButton: Locator;
  readonly uploadDropzone: Locator;
  readonly confirmarImportacaoButton: Locator;

  // ─── Dialog confirmação Inativar/Ativar ───────────────────────────────────
  readonly simInativarButton: Locator;
  readonly simAtivarButton: Locator;

  // ─── Feedbacks ────────────────────────────────────────────────────────────
  readonly successToast: Locator;
  readonly cpfDuplicadoError: Locator;
  readonly saveErrorAlert: Locator;
  readonly emptyResultsMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.pageUrl = getEnvironmentConfig().baseUrl + '/colaboradores';

    // Página principal
    this.adicionarButton = page.getByRole('button', { name: /adicionar/i });
    this.mostrarInativosToggle = page.locator('button[data-state]').filter({ hasText: '' }).and(
      page.locator('button').filter({ has: page.locator('..').filter({ hasText: 'Mostrar Inativos' }) })
    );
    this.departamentoFilter = page.locator('button[data-state]').filter({ hasText: /departamentos|departamento|Financeiro|Jurídico|Marketing|Operações|QA|Recursos Humanos|Tecnologia|Vendas/ });
    this.searchInput = page.getByPlaceholder('Buscar por nome, e-mail ou CPF...');
    this.itensPorPaginaCombobox = page.getByRole('button', { name: /itens por página/i }).or(page.locator('button[aria-label="Itens por página"]'));
    this.proximaButton = page.getByRole('button', { name: 'Próxima' });
    this.anteriorButton = page.getByRole('button', { name: 'Anterior' });
    this.paginationInfo = page.locator('*').filter({ hasText: /^Mostrando \d+-\d+ de \d+ itens$/ }).last();

    // Tabela
    this.tableBody = page.locator('tbody');
    this.tableRows = page.locator('tbody tr');
    this.emptyStateRow = page.getByText('Nenhum colaborador encontrado.');
    this.colNome = page.locator('thead th').filter({ hasText: 'Nome' });
    this.colEmail = page.locator('thead th').filter({ hasText: 'E-mail' });
    this.colDepartamento = page.locator('thead th').filter({ hasText: 'Departamento' });
    this.colCargo = page.locator('thead th').filter({ hasText: 'Cargo' });
    this.colStatus = page.locator('thead th').filter({ hasText: 'Status' });

    // Dialog tipo
    this.cadastroManualButton = page.getByRole('button', { name: /Cadastro Manual/i });
    this.importarPlanilhaButton = page.getByRole('button', { name: /Importar Planilha/i });

    // Formulário
    this.nomeInput = page.getByRole('textbox', { name: 'Nome Completo *' });
    this.cpfInput = page.getByRole('textbox', { name: 'CPF *' });
    this.emailInput = page.getByRole('textbox', { name: 'E-mail *' });
    this.dataNascimentoInput = page.getByRole('textbox', { name: 'Data de Nascimento *' });
    this.departamentoCombobox = page.getByRole('combobox', { name: 'Área de Trabalho (Depto) *' });
    this.cargoCombobox = page.getByRole('combobox', { name: 'Ocupação (Cargo) *' });
    this.telefoneInput = page.getByRole('textbox', { name: 'Telefone' });
    this.salvarButton = page.getByRole('button', { name: 'Salvar' });
    this.cancelarButton = page.getByRole('button', { name: 'Cancelar' });

    // Importar Planilha
    this.templateCsvButton = page.getByRole('button', { name: /Template CSV/i });
    this.uploadDropzone = page.locator('dialog').locator('[cursor=pointer], [style*="cursor: pointer"], div.cursor-pointer').filter({ hasText: /arraste|selecionar/i });
    this.confirmarImportacaoButton = page.getByRole('button', { name: 'Confirmar Importação' });

    // Confirmações
    this.simInativarButton = page.getByRole('button', { name: 'Sim, Inativar' });
    this.simAtivarButton = page.getByRole('button', { name: 'Sim, Ativar' });

    // Feedbacks
    this.successToast = page.getByText('Colaborador cadastrado com sucesso.').first();
    this.cpfDuplicadoError = page.getByText('CPF já cadastrado');
    this.saveErrorAlert = page.getByText('Não foi possível salvar o colaborador. Tente novamente.');
    this.emptyResultsMessage = page.getByText('Nenhum colaborador encontrado.');
  }

  // ─── Navegação ─────────────────────────────────────────────────────────────

  async navigate(): Promise<void> {
    logger.info('Navegando para /colaboradores');
    await this.page.goto(this.pageUrl);
    // O SPA faz refresh de token via Keycloak SSO ao inicializar.
    // O ciclo completo: goto → SPA init → redirect Keycloak → redirect Aurora → API → tabela.
    // Aguardamos a tabela diretamente com timeout generoso para acomodar todo o ciclo (~15s típico).
    await this.page.locator('tbody tr').first().waitFor({ state: 'visible', timeout: 60000 });
    logger.info(`Colaboradores carregados em: ${this.page.url()}`);
  }

  // ─── Filtros ───────────────────────────────────────────────────────────────

  async toggleMostrarInativos(): Promise<void> {
    logger.info('Clicando toggle Mostrar Inativos');
    const toggle = this.page.evaluate(() => {
      const parent = Array.from(document.querySelectorAll('*')).find(el => (el as HTMLElement).innerText?.trim() === 'Mostrar Inativos');
      const btn = parent?.previousElementSibling as HTMLButtonElement;
      if (btn) btn.click();
      return !!btn;
    });
    await this.page.waitForTimeout(500);
  }

  async isMostrarInativosAtivo(): Promise<boolean> {
    return this.page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button[data-state]'));
      const toggleBtn = btns.find(b => b.parentElement?.innerText?.includes('Mostrar Inativos'));
      return toggleBtn?.getAttribute('data-state') === 'checked';
    });
  }

  async filtrarPorDepartamento(departamento: string): Promise<void> {
    logger.info(`Filtrando por departamento: ${departamento}`);
    await this.departamentoFilter.click();
    await this.page.getByRole('option', { name: departamento, exact: true }).click();
    await this.page.waitForLoadState('load');
  }

  async resetarFiltroDepartamento(): Promise<void> {
    await this.filtrarPorDepartamento('Todos os departamentos');
  }

  async buscar(termo: string): Promise<void> {
    logger.info(`Buscando: "${termo}"`);
    await this.searchInput.fill(termo);
    await this.page.waitForTimeout(500);
  }

  async limparBusca(): Promise<void> {
    await this.searchInput.clear();
    await this.page.waitForTimeout(400);
  }

  async selecionarItensPorPagina(qtd: 10 | 25 | 50): Promise<void> {
    logger.info(`Selecionando ${qtd} itens por página`);
    await this.itensPorPaginaCombobox.click();
    await this.page.getByRole('option', { name: `${qtd} itens` }).click();
    await this.page.waitForTimeout(400);
  }

  // ─── Paginação ─────────────────────────────────────────────────────────────

  async irParaProximaPagina(): Promise<void> {
    logger.info('Indo para próxima página');
    await this.proximaButton.click();
    await this.page.waitForLoadState('load');
  }

  async irParaPaginaAnterior(): Promise<void> {
    logger.info('Indo para página anterior');
    await this.anteriorButton.click();
    await this.page.waitForLoadState('load');
  }

  async getPaginationText(): Promise<string> {
    // O rodapé de paginação renderiza um instante após as linhas da tabela.
    // Usamos um locator com auto-wait (em vez de page.evaluate one-shot) para
    // evitar leituras vazias por corrida de renderização.
    await this.paginationInfo.waitFor({ state: 'visible', timeout: 15000 });
    return (await this.paginationInfo.textContent())?.trim() ?? '';
  }

  async getTotalItems(): Promise<number> {
    const text = await this.getPaginationText();
    const match = text.match(/de (\d+) itens/);
    return match ? parseInt(match[1]) : 0;
  }

  // ─── Ordenação ─────────────────────────────────────────────────────────────

  async ordenarPorColuna(coluna: 'Nome' | 'E-mail' | 'Departamento' | 'Cargo' | 'Status'): Promise<void> {
    logger.info(`Ordenando por: ${coluna}`);
    await this.page.locator('thead th').filter({ hasText: coluna }).click();
    await this.page.waitForTimeout(400);
  }

  async getFirstRowName(): Promise<string> {
    return this.page.locator('tbody tr td').first().innerText();
  }

  // ─── Cadastro Manual ───────────────────────────────────────────────────────

  async abrirDialogAdicionar(): Promise<void> {
    logger.info('Clicando em Adicionar');
    await this.adicionarButton.click();
    await this.cadastroManualButton.waitFor({ state: 'visible', timeout: 10000 });
  }

  async selecionarCadastroManual(): Promise<void> {
    logger.info('Selecionando Cadastro Manual');
    await this.cadastroManualButton.click();
    await this.nomeInput.waitFor({ state: 'visible', timeout: 10000 });
  }

  async selecionarImportarPlanilha(): Promise<void> {
    logger.info('Selecionando Importar Planilha');
    await this.importarPlanilhaButton.click();
    await this.templateCsvButton.waitFor({ state: 'visible', timeout: 10000 });
  }

  async preencherFormulario(data: ColaboradorData): Promise<void> {
    logger.info(`Preenchendo formulário: ${data.nome}`);
    await this.nomeInput.fill(data.nome);
    await this.cpfInput.fill(data.cpf);
    await this.emailInput.fill(data.email);
    await this.dataNascimentoInput.fill(data.dataNascimento);

    await this.departamentoCombobox.click();
    await this.page.getByRole('option', { name: data.departamento }).click();

    await this.cargoCombobox.click();
    await this.page.getByRole('option', { name: data.cargo }).click();

    if (data.telefone) await this.telefoneInput.fill(data.telefone);

    if (data.genero) {
      await this.page.getByRole('combobox').nth(2).click();
      await this.page.getByRole('option', { name: data.genero }).click();
    }

    if (data.estadoCivil) {
      await this.page.getByRole('combobox').nth(3).click();
      await this.page.getByRole('option', { name: data.estadoCivil }).click();
    }

    if (data.escolaridade) {
      await this.page.getByRole('combobox').nth(4).click();
      await this.page.getByRole('option', { name: data.escolaridade }).click();
    }
  }

  async salvar(): Promise<void> {
    logger.info('Clicando Salvar');
    await this.salvarButton.click();
  }

  async cancelar(): Promise<void> {
    await this.cancelarButton.click();
    await this.aguardarDialogFechar();
  }

  async fecharDialog(): Promise<void> {
    await this.page.keyboard.press('Escape');
    await this.aguardarDialogFechar();
  }

  /** Aguarda o Radix Dialog desmontar (evita leituras durante a animação de saída). */
  private async aguardarDialogFechar(): Promise<void> {
    await this.page.locator('[role="dialog"]').first()
      .waitFor({ state: 'hidden', timeout: 10000 })
      .catch(() => {});
  }

  async cadastrarColaborador(data: ColaboradorData): Promise<void> {
    await this.abrirDialogAdicionar();
    await this.selecionarCadastroManual();
    await this.preencherFormulario(data);
    await this.salvar();
  }

  // ─── Edição ────────────────────────────────────────────────────────────────

  async abrirEdicaoPorNome(nome: string): Promise<void> {
    logger.info(`Abrindo edição para: ${nome}`);
    const row = this.page.locator('tbody tr').filter({ hasText: nome }).first();
    const editBtn = row.locator('td').last().locator('button');
    await editBtn.click();
    await this.nomeInput.waitFor({ state: 'visible', timeout: 10000 });
    // O formulário é pré-preenchido de forma assíncrona; aguarda o valor popular
    // para evitar leituras vazias (inputValue() não tem auto-retry).
    await expect(this.nomeInput).not.toHaveValue('', { timeout: 10000 });
  }

  async abrirEdicaoPrimeiroCadastro(): Promise<void> {
    const editBtn = this.page.locator('tbody tr').first().locator('td').last().locator('button');
    await editBtn.click();
    await this.nomeInput.waitFor({ state: 'visible', timeout: 10000 });
  }

  async getNomeAtualNoFormulario(): Promise<string> {
    return this.nomeInput.inputValue();
  }

  // ─── Inativar / Ativar ────────────────────────────────────────────────────

  async clicarInativarPorNome(nome: string): Promise<void> {
    logger.info(`Inativando: ${nome}`);
    await this.page.locator(`button[aria-label="Inativar ${nome}"]`).click();
    await this.simInativarButton.waitFor({ state: 'visible', timeout: 10000 });
  }

  async confirmarInativar(): Promise<void> {
    await this.simInativarButton.click();
    await this.aguardarDialogFechar();
    await this.page.waitForLoadState('load');
  }

  async clicarAtivarPorNome(nome: string): Promise<void> {
    logger.info(`Ativando: ${nome}`);
    await this.page.locator(`button[aria-label*="Ativar ${nome}"]`).first().click();
    await this.simAtivarButton.waitFor({ state: 'visible', timeout: 10000 });
  }

  async confirmarAtivar(): Promise<void> {
    await this.simAtivarButton.click();
    await this.aguardarDialogFechar();
    await this.page.waitForLoadState('load');
  }

  async cancelarConfirmacao(): Promise<void> {
    await this.cancelarButton.click();
    await this.aguardarDialogFechar();
  }

  // ─── Consultas ─────────────────────────────────────────────────────────────

  async getRowCount(): Promise<number> {
    return this.tableRows.count();
  }

  async isColaboradorVisivel(nome: string): Promise<boolean> {
    return this.page.locator('tbody tr td').filter({ hasText: nome }).isVisible().catch(() => false);
  }

  async isDialogAberto(): Promise<boolean> {
    // App usa Radix Dialog (<div role="dialog">), não o elemento nativo <dialog>.
    return this.page.locator('[role="dialog"]').first().isVisible().catch(() => false);
  }

  async isConfirmarImportacaoHabilitado(): Promise<boolean> {
    return this.confirmarImportacaoButton.isEnabled().catch(() => false);
  }

  async validarCadastroSucesso(): Promise<void> {
    await this.successToast.waitFor({ state: 'visible', timeout: 10000 });
    // Após o sucesso o dialog fecha com animação; aguardamos desmontar para
    // que isDialogAberto() reflita o estado já estabilizado.
    await this.aguardarDialogFechar();
    logger.info('Toast de sucesso exibido');
  }

  async validarErroCpfDuplicado(): Promise<void> {
    await this.cpfDuplicadoError.waitFor({ state: 'visible', timeout: 5000 });
    logger.info('Erro CPF duplicado exibido');
  }

  async validarErroSalvar(): Promise<void> {
    await this.saveErrorAlert.waitFor({ state: 'visible', timeout: 5000 });
    logger.info('Erro ao salvar exibido');
  }

  /** Define o estado do toggle "Mostrar Inativos" de forma idempotente. */
  async setMostrarInativos(ativar: boolean): Promise<void> {
    const toggle = this.page.locator('button[role="switch"]');
    const estado = await toggle.getAttribute('data-state').catch(() => null);
    if ((estado === 'checked') !== ativar) {
      await toggle.click();
      await this.page.waitForTimeout(600);
    }
  }

  /**
   * Garante a pré-condição de que um colaborador esteja ATIVO, reativando-o
   * caso execuções anteriores o tenham deixado inativo. Restaura o ambiente
   * e mantém os testes idempotentes.
   */
  async garantirColaboradorAtivo(nome: string): Promise<void> {
    logger.info(`Garantindo que "${nome}" esteja ativo`);
    await this.setMostrarInativos(false);
    await this.buscar(nome);
    const jaAtivo = await this.page.locator(`button[aria-label="Inativar ${nome}"]`).count();
    if (jaAtivo > 0) {
      await this.limparBusca();
      return;
    }
    // Não está ativo: procura entre os inativos e reativa.
    await this.setMostrarInativos(true);
    await this.buscar(nome);
    const ativarBtn = this.page.locator(`button[aria-label*="Ativar ${nome}"]`).first();
    if (await ativarBtn.count() > 0) {
      await ativarBtn.click();
      await this.simAtivarButton.waitFor({ state: 'visible', timeout: 10000 });
      await this.confirmarAtivar();
    }
    await this.setMostrarInativos(false);
    await this.limparBusca();
  }
}
