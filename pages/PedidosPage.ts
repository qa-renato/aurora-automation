import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import logger from '../utils/logger';
import { getEnvironmentConfig } from '../config/environments';

// ─── Seletores verificados via inspeção real (MCP/scripts) em /pedidos ────────
// Página: https://sandbox-inbot-aurora.vercel.app/pedidos
// Colunas: Colaborador | Protocolo | Status | Criado em | Atendido em
// Protocolos: BAI, BHS, BDI, BSI, COPSOQ · Status: Aberto, Atendido
//
// ⚠️ A rota tem carregamento INSTÁVEL (refresh de token Keycloak falha por CORS),
// resultando em skeleton infinito / página vazia. navigate() esquenta a sessão
// via /colaboradores e tenta /pedidos com retry até os DADOS reais aparecerem.

export type Protocolo = 'BAI' | 'BHS' | 'BDI' | 'BSI' | 'COPSOQ';
export type ColunaPedido = 'Colaborador' | 'Protocolo' | 'Status' | 'Criado em';

export class PedidosPage extends BasePage {
  protected readonly pageUrl: string;
  private readonly colaboradoresUrl: string;

  // ─── Controles da página ───────────────────────────────────────────────────
  readonly novoPedidoButton: Locator;
  readonly searchInput: Locator;
  readonly itensPorPaginaCombobox: Locator;
  readonly proximaButton: Locator;
  readonly anteriorButton: Locator;
  readonly paginationInfo: Locator;

  // ─── Tabela ──────────────────────────────────────────────────────────────--
  readonly tableRows: Locator;
  readonly skeleton: Locator;
  readonly emptyStateRow: Locator;

  // ─── Dialog Novo Pedido ─────────────────────────────────────────────────────
  readonly dialog: Locator;
  readonly closeButton: Locator;
  readonly individualOption: Locator;
  readonly emLoteOption: Locator;
  readonly protocoloCombobox: Locator;
  readonly colaboradorCombobox: Locator;
  readonly criarPedidoButton: Locator;
  readonly criarEmLoteButton: Locator;
  readonly voltarButton: Locator;

  constructor(page: Page) {
    super(page);
    const base = getEnvironmentConfig().baseUrl;
    this.pageUrl = base + '/pedidos';
    this.colaboradoresUrl = base + '/colaboradores';

    this.novoPedidoButton = page.getByRole('button', { name: /Novo Pedido/i });
    this.searchInput = page.getByPlaceholder(/Buscar por e-mail/i);
    this.itensPorPaginaCombobox = page.getByRole('button', { name: /\d+ itens/i })
      .or(page.locator('main button[data-state]').filter({ hasText: /itens/i }));
    this.proximaButton = page.getByRole('button', { name: 'Próxima' });
    this.anteriorButton = page.getByRole('button', { name: 'Anterior' });
    this.paginationInfo = page.locator('*').filter({ hasText: /^Mostrando \d+-\d+ de \d+ itens$/ }).last();

    this.tableRows = page.locator('tbody tr');
    this.skeleton = page.locator('tbody .animate-pulse');
    this.emptyStateRow = page.getByText(/Nenhum pedido|Nenhum resultado|Nenhum registro/i);

    this.dialog = page.locator('[role="dialog"]').first();
    this.closeButton = page.getByRole('dialog').getByRole('button', { name: /close/i });
    this.individualOption = page.getByRole('button').filter({ hasText: /^Individual/ })
      .or(page.getByText(/^Individual/));
    this.emLoteOption = page.getByRole('button').filter({ hasText: /^Em Lote/ })
      .or(page.getByText(/^Em Lote/));
    this.protocoloCombobox = page.locator('[role="dialog"] [role="combobox"]').first();
    // O trigger do Colaborador é um <button> SEM role="combobox" (≠ Protocolo);
    // localizamos pelo texto do trigger ("Selecione o colaborador").
    this.colaboradorCombobox = page
      .locator('[role="dialog"]')
      .getByRole('button', { name: /colaborador/i })
      .first();
    this.criarPedidoButton = page.getByRole('button', { name: /Criar Pedido/i });
    this.criarEmLoteButton = page.getByRole('button', { name: /Criar em Lote/i });
    this.voltarButton = page.getByRole('button', { name: 'Voltar' });
  }

  // ─── Navegação robusta ──────────────────────────────────────────────────────

  /**
   * Navega para /pedidos contornando a instabilidade de carregamento.
   * Esquenta a sessão (/colaboradores) e tenta /pedidos com retry até a tabela
   * ter dados reais (célula de Protocolo com texto) e o input de busca existir.
   */
  async navigate(): Promise<void> {
    logger.info('Navegando para /pedidos (com aquecimento de sessão)');
    await this.page.goto(this.colaboradoresUrl);
    await this.page.locator('tbody button[aria-label]').first()
      .waitFor({ state: 'visible', timeout: 60000 }).catch(() => {});

    let carregou = false;
    for (let tentativa = 1; tentativa <= 5 && !carregou; tentativa++) {
      await this.page.goto(this.pageUrl);
      try {
        await this.page.locator('tbody tr td:nth-child(2)').first()
          .filter({ hasText: /\S/ }).waitFor({ state: 'visible', timeout: 20000 });
        await this.searchInput.waitFor({ state: 'visible', timeout: 5000 });
        carregou = true;
      } catch {
        logger.warn(`/pedidos não carregou (tentativa ${tentativa}); recarregando`);
        await this.page.waitForTimeout(1500);
      }
    }
    if (!carregou) {
      throw new Error('Falha ao carregar /pedidos: tabela não exibiu dados (instabilidade de token/carga).');
    }
    await this.page.waitForTimeout(500);
    logger.info('Pedidos carregados');
  }

  // ─── Busca ───────────────────────────────────────────────────────────────---

  async buscar(termo: string): Promise<void> {
    logger.info(`Buscando pedido por e-mail: "${termo}"`);
    await this.searchInput.fill(termo);
    await this.page.waitForTimeout(800);
  }

  async limparBusca(): Promise<void> {
    await this.searchInput.fill('');
    await this.page.waitForTimeout(600);
  }

  // ─── Ordenação ───────────────────────────────────────────────────────────---

  async ordenarPorColuna(coluna: ColunaPedido): Promise<void> {
    logger.info(`Ordenando pedidos por: ${coluna}`);
    await this.page.locator('thead th').filter({ hasText: coluna }).first().click();
    await this.page.waitForTimeout(500);
    // aguarda re-render dos dados
    await this.page.locator('tbody tr td:nth-child(2)').first()
      .filter({ hasText: /\S/ }).waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
  }

  async getAriaSort(coluna: string): Promise<string | null> {
    return this.page.locator('thead th').filter({ hasText: coluna }).first().getAttribute('aria-sort');
  }

  async getColunaValores(indice: number): Promise<string[]> {
    return (await this.page.locator(`tbody tr td:nth-child(${indice})`).allInnerTexts())
      .map(v => v.replace(/\s+/g, ' ').trim());
  }

  // ─── Paginação ───────────────────────────────────────────────────────────---

  async getPaginationText(): Promise<string> {
    await this.paginationInfo.waitFor({ state: 'visible', timeout: 15000 });
    return (await this.paginationInfo.textContent())?.trim() ?? '';
  }

  async getTotalItems(): Promise<number> {
    const m = (await this.getPaginationText()).match(/de (\d+) itens/);
    return m ? parseInt(m[1]) : 0;
  }

  async selecionarItensPorPagina(qtd: 10 | 25 | 50): Promise<void> {
    await this.itensPorPaginaCombobox.first().click();
    await this.page.getByRole('option', { name: `${qtd} itens` }).click();
    await this.page.waitForTimeout(600);
  }

  async irParaProximaPagina(): Promise<void> {
    await this.proximaButton.click();
    await this.page.waitForTimeout(600);
  }

  async irParaPaginaAnterior(): Promise<void> {
    await this.anteriorButton.click();
    await this.page.waitForTimeout(600);
  }

  async irParaUltimaPagina(): Promise<void> {
    let guard = 0;
    while (guard++ < 30) {
      if (!(await this.proximaButton.isEnabled().catch(() => false))) break;
      await this.proximaButton.click();
      await this.page.waitForTimeout(400);
    }
  }

  // ─── Filtro por protocolo (cards de resumo) ─────────────────────────────────

  cardProtocolo(sigla: Protocolo): Locator {
    return this.page.getByText(new RegExp(`^${sigla}\\b`)).first();
  }

  async filtrarPorProtocolo(sigla: Protocolo): Promise<void> {
    logger.info(`Filtrando por protocolo (card): ${sigla}`);
    await this.cardProtocolo(sigla).click();
    await this.page.waitForTimeout(1000);
  }

  // ─── Novo Pedido ────────────────────────────────────────────────────────────

  async abrirNovoPedido(): Promise<void> {
    await this.novoPedidoButton.click();
    await this.individualOption.first().waitFor({ state: 'visible', timeout: 10000 });
  }

  async selecionarIndividual(): Promise<void> {
    await this.individualOption.first().click();
    await this.criarPedidoButton.waitFor({ state: 'visible', timeout: 10000 });
  }

  async selecionarEmLote(): Promise<void> {
    await this.emLoteOption.first().click();
    await this.criarEmLoteButton.waitFor({ state: 'visible', timeout: 10000 });
  }

  async selecionarProtocoloNoForm(sigla: Protocolo): Promise<void> {
    await this.protocoloCombobox.click();
    await this.page.getByRole('option', { name: sigla, exact: true }).click();
    await this.page.waitForTimeout(300);
  }

  async selecionarColaboradorNoForm(nome: string): Promise<void> {
    await this.colaboradorCombobox.click();
    await this.page.getByRole('option').filter({ hasText: nome }).first().click();
    await this.page.waitForTimeout(300);
  }

  async criarPedidoIndividual(sigla: Protocolo, colaboradorNome: string): Promise<void> {
    await this.abrirNovoPedido();
    await this.selecionarIndividual();
    await this.selecionarProtocoloNoForm(sigla);
    await this.selecionarColaboradorNoForm(colaboradorNome);
    await this.criarPedidoButton.click();
  }

  async voltar(): Promise<void> {
    await this.voltarButton.click();
    await this.page.waitForTimeout(400);
  }

  async fecharViaX(): Promise<void> {
    await this.closeButton.click();
    await this.dialog.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
  }

  // ─── Consultas ──────────────────────────────────────────────────────────────

  async getRowCount(): Promise<number> {
    return this.tableRows.count();
  }

  async isDialogAberto(): Promise<boolean> {
    return this.dialog.isVisible().catch(() => false);
  }

  /** Status (col 3) de cada linha visível. */
  async getStatusColuna(): Promise<string[]> {
    return this.getColunaValores(3);
  }
}
