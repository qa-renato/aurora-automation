import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import logger from '../utils/logger';

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

// ─── Seletores verificados via DOM inspection (MCP Playwright) ─────────────
// Fluxo: botão "Adicionar" → dialog tipo → "Cadastro Manual" → form → "Salvar"
// Toast de sucesso: "Colaborador cadastrado com sucesso."
// Erro de CPF duplicado: texto "CPF já cadastrado" no form
// ──────────────────────────────────────────────────────────────────────────────

export class ColaboradoresPage extends BasePage {
  protected readonly pageUrl: string = '/colaboradores';

  // ─── Página principal ──────────────────────────────────────────────────────
  private readonly adicionarButton: Locator;
  private readonly searchInput: Locator;
  private readonly colaboradoresTable: Locator;
  private readonly totalItensLabel: Locator;

  // ─── Dialog de seleção de tipo ────────────────────────────────────────────
  private readonly cadastroManualButton: Locator;
  private readonly importarPlanilhaButton: Locator;

  // ─── Formulário Cadastro Manual ───────────────────────────────────────────
  private readonly nomeInput: Locator;
  private readonly cpfInput: Locator;
  private readonly emailInput: Locator;
  private readonly dataNascimentoInput: Locator;
  private readonly departamentoCombobox: Locator;
  private readonly cargoCombobox: Locator;
  private readonly telefoneInput: Locator;
  private readonly salvarButton: Locator;
  private readonly cancelarButton: Locator;

  // ─── Feedback ─────────────────────────────────────────────────────────────
  private readonly cpfDuplicadoError: Locator;
  private readonly successToast: Locator;

  constructor(page: Page) {
    super(page);
    this.pageUrl = '/colaboradores';

    // Página principal
    this.adicionarButton = page.getByRole('button', { name: /adicionar/i });
    this.searchInput = page.getByPlaceholder('Buscar por nome, e-mail ou CPF...');
    this.colaboradoresTable = page.getByRole('table');
    this.totalItensLabel = page.locator('text=/Mostrando \\d+-\\d+ de \\d+ itens/');

    // Dialog de seleção de tipo (aparece após clicar "Adicionar")
    this.cadastroManualButton = page.getByRole('button', { name: /Cadastro Manual/i });
    this.importarPlanilhaButton = page.getByRole('button', { name: /Importar Planilha/i });

    // Formulário (dentro do dialog "Adicionar Colaborador")
    this.nomeInput = page.getByRole('textbox', { name: 'Nome Completo *' });
    this.cpfInput = page.getByRole('textbox', { name: 'CPF *' });
    this.emailInput = page.getByRole('textbox', { name: 'E-mail *' });
    this.dataNascimentoInput = page.getByRole('textbox', { name: 'Data de Nascimento *' });
    this.departamentoCombobox = page.getByRole('combobox', { name: 'Área de Trabalho (Depto) *' });
    this.cargoCombobox = page.getByRole('combobox', { name: 'Ocupação (Cargo) *' });
    this.telefoneInput = page.getByRole('textbox', { name: 'Telefone' });
    this.salvarButton = page.getByRole('button', { name: 'Salvar' });
    this.cancelarButton = page.getByRole('button', { name: 'Cancelar' });

    // Feedback
    this.cpfDuplicadoError = page.getByText('CPF já cadastrado');
    // getByText retorna 2 elementos (toast visível + aria-live hidden) — usar .first()
    this.successToast = page.getByText('Colaborador cadastrado com sucesso.').first();
  }

  async navigate(): Promise<void> {
    logger.info('Navegando para /colaboradores');
    await this.page.goto(this.pageUrl);
    await this.waitForPageLoad();
    await this.colaboradoresTable.waitFor({ state: 'visible', timeout: 15000 });
    logger.info('Página de colaboradores carregada');
  }

  // ─── Fluxo de cadastro ─────────────────────────────────────────────────────

  async abrirDialogAdicionar(): Promise<void> {
    logger.info('Clicando em "Adicionar"');
    await this.adicionarButton.click();
    await this.cadastroManualButton.waitFor({ state: 'visible', timeout: 10000 });
    logger.info('Dialog de seleção aberto');
  }

  async selecionarCadastroManual(): Promise<void> {
    logger.info('Selecionando "Cadastro Manual"');
    await this.cadastroManualButton.click();
    await this.nomeInput.waitFor({ state: 'visible', timeout: 10000 });
    logger.info('Formulário de Cadastro Manual aberto');
  }

  async preencherFormulario(data: ColaboradorData): Promise<void> {
    logger.info(`Preenchendo formulário para: ${data.nome}`);

    await this.nomeInput.fill(data.nome);
    await this.cpfInput.fill(data.cpf);
    await this.emailInput.fill(data.email);
    await this.dataNascimentoInput.fill(data.dataNascimento);

    // Departamento
    await this.departamentoCombobox.click();
    await this.page.getByRole('option', { name: data.departamento }).click();
    logger.info(`Departamento selecionado: ${data.departamento}`);

    // Cargo
    await this.cargoCombobox.click();
    await this.page.getByRole('option', { name: data.cargo }).click();
    logger.info(`Cargo selecionado: ${data.cargo}`);

    // Opcionais
    if (data.telefone) await this.telefoneInput.fill(data.telefone);
  }

  async salvar(): Promise<void> {
    logger.info('Clicando em "Salvar"');
    await this.salvarButton.click();
  }

  // ─── Fluxo completo ────────────────────────────────────────────────────────

  async cadastrarColaborador(data: ColaboradorData): Promise<void> {
    await this.abrirDialogAdicionar();
    await this.selecionarCadastroManual();
    await this.preencherFormulario(data);
    await this.salvar();
  }

  // ─── Validações ────────────────────────────────────────────────────────────

  async validarCadastroSucesso(): Promise<void> {
    await this.successToast.waitFor({ state: 'visible', timeout: 10000 });
    logger.info('Toast de sucesso exibido: "Colaborador cadastrado com sucesso."');
  }

  async validarErroCpfDuplicado(): Promise<void> {
    await this.cpfDuplicadoError.waitFor({ state: 'visible', timeout: 5000 });
    logger.info('Erro de CPF duplicado exibido');
  }

  async buscarColaborador(termo: string): Promise<void> {
    await this.searchInput.fill(termo);
    await this.page.waitForLoadState('networkidle');
  }

  async validarColaboradorNaTabela(nome: string, cpf?: string): Promise<void> {
    // Se CPF fornecido, buscar por CPF (único) e validar a linha
    const termo = cpf ?? nome;
    await this.buscarColaborador(termo);
    // Usa cell em vez de row para evitar strict violation quando há múltiplas linhas
    const cell = this.page.getByRole('cell', { name: cpf ?? new RegExp(nome, 'i') }).first();
    await cell.waitFor({ state: 'visible', timeout: 10000 });
    logger.info(`Colaborador "${nome}" encontrado na tabela (busca: "${termo}")`);
  }

  async getTotalColaboradores(): Promise<string> {
    return (await this.totalItensLabel.textContent()) ?? '';
  }

  async isDialogAberto(): Promise<boolean> {
    return this.page.getByRole('dialog', { name: 'Adicionar Colaborador' }).isVisible().catch(() => false);
  }
}
