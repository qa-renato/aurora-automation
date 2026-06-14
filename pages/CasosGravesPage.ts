import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import logger from '../utils/logger';
import { getEnvironmentConfig } from '../config/environments';

// ─── Seletores verificados via inspeção real (storageState) em /casos-graves ──
// Página: https://sandbox-inbot-aurora.vercel.app/casos-graves
// É um DASHBOARD (não tabela na entrada). Estrutura:
//   • 3 gauges: Índice de Bem-Estar, Média Geral de Risco, Balança: Trabalho vs. Vida
//   • Card "Casos Graves" (contador) → botão "Gerenciar Casos"
//   • 3 acordeões: Entrevistas Individuais (BAI/BHS/BSS/BDI), COPSOQ (Copenhague),
//     Resultados Consolidados (Dashboard Consolidado) — cada item: "Visualizar Dashboard →"
//   • "Gerenciar Casos" revela painel (mesma rota): filtro Período + 5 KPIs +
//     2 gráficos + tabela "Detalhamento por Paciente"
//     [Colaborador/Evento | Nível de Risco | Último Alerta | Status/Tratativa | Ação]
//   • Linha → botão "Gerenciar" → diálogo "Tratativa de Caso Grave" (Radix [role=dialog]):
//     <select> Status (Aberto/Em Andamento/Concluído/Arquivado),
//     <select> Responsável, textarea + botão "Comentar", timeline de histórico.

export type StatusTratativa = 'Aberto' | 'Em Andamento' | 'Concluído' | 'Arquivado';
export type Gauge = 'Índice de Bem-Estar' | 'Média Geral de Risco' | 'Balança: Trabalho vs. Vida';
export type Acordeao =
  | 'Relatórios das Entrevistas Individuais'
  | 'Relatório da Entrevista Ocupacional (COPSOQ)'
  | 'Resultados Consolidados';

export const KPIS = [
  'CASOS GRAVES IDENTIFICADOS',
  'AGUARDANDO AÇÃO',
  'EM TRATATIVA',
  'CONCLUÍDOS',
  'ARQUIVADOS',
] as const;

export const COLUNAS_DETALHAMENTO = [
  'Colaborador',
  'Nível de Risco',
  'Último Alerta',
  'Status',
  'Ação',
] as const;

export class CasosGravesPage extends BasePage {
  protected readonly pageUrl: string;

  // ─── Dashboard inicial ──────────────────────────────────────────────────────
  readonly gerenciarCasosButton: Locator;
  readonly cardCasosGraves: Locator;

  // ─── Painel de gestão (pós "Gerenciar Casos") ──────────────────────────────--
  readonly periodoControl: Locator;
  readonly detalhamentoHeading: Locator;
  readonly tableRows: Locator;

  // ─── Diálogo "Tratativa de Caso Grave" ─────────────────────────────────────--
  readonly dialog: Locator;
  readonly statusSelect: Locator;
  readonly responsavelSelect: Locator;
  readonly comentarioTextarea: Locator;
  readonly comentarButton: Locator;
  readonly historico: Locator;

  constructor(page: Page) {
    super(page);
    this.pageUrl = getEnvironmentConfig().baseUrl + '/casos-graves';

    this.gerenciarCasosButton = page.getByRole('button', { name: /Gerenciar Casos/i });
    this.cardCasosGraves = page.locator('*').filter({ hasText: /Requerem atenção imediata/i }).last();

    this.periodoControl = page
      .getByRole('combobox')
      .filter({ hasText: /Últimos|histórico/i })
      .or(page.locator('select, [role="combobox"]').filter({ hasText: /Últimos|histórico/i }))
      .first();
    this.detalhamentoHeading = page.getByRole('heading', { name: /Detalhamento por Paciente/i });
    this.tableRows = page.locator('tbody tr');

    this.dialog = page.locator('[role="dialog"]').last();
    // <select> nativos — localizados pelo conjunto de opções (ordem também verificada).
    this.statusSelect = this.dialog
      .locator('select')
      .filter({ has: page.locator('option', { hasText: 'Em Andamento' }) });
    this.responsavelSelect = this.dialog
      .locator('select')
      .filter({ has: page.locator('option', { hasText: 'Ninguém atribuído' }) });
    this.comentarioTextarea = this.dialog.locator('textarea');
    this.comentarButton = this.dialog.getByRole('button', { name: /Comentar/i });
    this.historico = this.dialog.getByText(/Histórico & Comentários/i);
  }

  // ─── Navegação ────────────────────────────────────────────────────────────---

  async navigate(): Promise<void> {
    logger.info('Navegando para /casos-graves');
    let carregou = false;
    for (let tentativa = 1; tentativa <= 3 && !carregou; tentativa++) {
      await this.page.goto(this.pageUrl);
      try {
        await this.gerenciarCasosButton.waitFor({ state: 'visible', timeout: 20000 });
        carregou = true;
      } catch {
        logger.warn(`/casos-graves não carregou (tentativa ${tentativa}); recarregando`);
        await this.page.waitForTimeout(1500);
      }
    }
    if (!carregou) {
      throw new Error('Falha ao carregar /casos-graves (instabilidade de token/carga).');
    }
  }

  // ─── Gauges ───────────────────────────────────────────────────────────────---

  gauge(nome: Gauge): Locator {
    return this.page.getByText(nome, { exact: false }).first();
  }

  // ─── Acordeões ────────────────────────────────────────────────────────────---

  acordeaoButton(nome: Acordeao): Locator {
    return this.page.getByRole('button', { name: nome });
  }

  async expandirAcordeao(nome: Acordeao): Promise<void> {
    logger.info(`Expandindo acordeão: ${nome}`);
    await this.acordeaoButton(nome).click();
    await this.page.waitForTimeout(800);
  }

  itemAcordeao(texto: string): Locator {
    return this.page.getByText(texto, { exact: false }).first();
  }

  // ─── Painel de gestão ───────────────────────────────────────────────────────

  async abrirGestao(): Promise<void> {
    logger.info('Abrindo painel "Gerenciar Casos"');
    await this.gerenciarCasosButton.click();
    await this.detalhamentoHeading.waitFor({ state: 'visible', timeout: 15000 });
    await this.page.waitForTimeout(500);
  }

  kpiCard(label: string): Locator {
    return this.page.getByText(label, { exact: false }).first();
  }

  colunaHeader(coluna: string): Locator {
    return this.page.locator('thead th, [role="columnheader"]').filter({ hasText: coluna }).first();
  }

  async selecionarPeriodo(opcao: 'Últimos 30 dias' | 'Últimos 7 dias' | 'Todo o histórico'): Promise<void> {
    logger.info(`Selecionando período: ${opcao}`);
    const tag = await this.periodoControl.evaluate(el => el.tagName).catch(() => '');
    if (tag === 'SELECT') {
      await this.periodoControl.selectOption({ label: opcao });
    } else {
      await this.periodoControl.click();
      await this.page.getByRole('option', { name: opcao }).click();
    }
    await this.page.waitForTimeout(800);
  }

  // ─── Tabela / linhas ────────────────────────────────────────────────────────

  linhaPorColaborador(nome: string): Locator {
    return this.tableRows.filter({ hasText: nome }).first();
  }

  async getRowCount(): Promise<number> {
    return this.tableRows.count();
  }

  // ─── Diálogo "Tratativa de Caso Grave" ─────────────────────────────────────--

  async abrirTratativa(nomeColaborador: string): Promise<void> {
    logger.info(`Abrindo tratativa de: ${nomeColaborador}`);
    const linha = this.linhaPorColaborador(nomeColaborador);
    await linha.scrollIntoViewIfNeeded();
    await linha.getByRole('button', { name: /Gerenciar/i }).click();
    await this.dialog.waitFor({ state: 'visible', timeout: 10000 });
    await this.statusSelect.waitFor({ state: 'visible', timeout: 10000 });
  }

  async isDialogAberto(): Promise<boolean> {
    return this.dialog.isVisible().catch(() => false);
  }

  private async labelSelecionado(select: Locator): Promise<string> {
    return select
      .evaluate((el: HTMLSelectElement) => el.selectedOptions[0]?.textContent?.trim() ?? '')
      .catch(() => '');
  }

  async getStatus(): Promise<string> {
    return this.labelSelecionado(this.statusSelect);
  }

  async setStatus(status: StatusTratativa): Promise<void> {
    logger.info(`Alterando Status da Tratativa → ${status}`);
    await this.statusSelect.selectOption({ label: status });
    await this.page.waitForTimeout(800); // auto-save (não há botão Salvar)
  }

  async getResponsavel(): Promise<string> {
    return this.labelSelecionado(this.responsavelSelect);
  }

  async setResponsavel(nome: string): Promise<void> {
    logger.info(`Atribuindo Responsável → ${nome}`);
    await this.responsavelSelect.selectOption({ label: nome });
    await this.page.waitForTimeout(800);
  }

  async comentar(texto: string): Promise<void> {
    logger.info(`Adicionando comentário: "${texto}"`);
    await this.comentarioTextarea.fill(texto);
    await this.comentarButton.click();
    await this.page.waitForTimeout(800);
  }

  comentarioNoHistorico(texto: string): Locator {
    return this.dialog.getByText(texto, { exact: false });
  }

  async fecharDialog(): Promise<void> {
    // O botão de fechar tem aria-label "Fechar" (PT), não "close".
    const closeX = this.dialog.getByRole('button', { name: /Fechar/i });
    if (await closeX.isVisible().catch(() => false)) {
      await closeX.click();
    } else {
      await this.page.keyboard.press('Escape');
    }
    await this.dialog.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
  }
}
