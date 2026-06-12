import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import logger from '../utils/logger';
import { getEnvironmentConfig } from '../config/environments';

// Rota: /adesao — "Adesão e Engajamento" → "Resumo de Adesão aos Questionários".
// Seletor de Lote (combobox Radix) + donut de adesão (% e "X de Y colaboradores
// responderam") + tabela "Acompanhamento por Colaborador" (Colaborador | Status)
// + botão "Exportar Excel" (gera .csv compatível com Excel). Apenas leitura.

export class AdesaoPage extends BasePage {
  protected readonly pageUrl: string;

  readonly titulo: Locator;
  readonly loteCombobox: Locator;
  readonly exportarButton: Locator;
  readonly tableRows: Locator;

  constructor(page: Page) {
    super(page);
    this.pageUrl = getEnvironmentConfig().baseUrl + '/adesao';
    this.titulo = page.getByText('Adesão e Engajamento', { exact: false }).first();
    this.loteCombobox = page.getByRole('combobox').first();
    this.exportarButton = page.getByRole('button', { name: /Exportar Excel/i }).first();
    this.tableRows = page.locator('tbody tr');
  }

  async navigate(): Promise<void> {
    logger.info('Navegando para /adesao');
    let ok = false;
    for (let i = 1; i <= 3 && !ok; i++) {
      await this.page.goto(this.pageUrl, { waitUntil: 'load' });
      try {
        await this.titulo.waitFor({ state: 'visible', timeout: 20000 });
        ok = true;
      } catch {
        logger.warn(`/adesao não carregou (tentativa ${i})`);
        await this.page.waitForTimeout(1500);
      }
    }
    if (!ok) throw new Error('Falha ao carregar /adesao (instabilidade de token/carga).');
    await this.page.waitForTimeout(800);
  }

  async getLoteAtual(): Promise<string> {
    return (await this.loteCombobox.textContent().catch(() => ''))?.trim() ?? '';
  }

  async getOpcoesLote(): Promise<string[]> {
    await this.loteCombobox.click();
    await this.page.waitForTimeout(500);
    const opts = await this.page.getByRole('option').allTextContents().catch(() => []);
    await this.page.keyboard.press('Escape').catch(() => {});
    return opts.map((s) => s.trim()).filter(Boolean);
  }

  async selecionarLotePorIndice(indice: number): Promise<void> {
    await this.loteCombobox.click();
    await this.page.waitForTimeout(500);
    await this.page.getByRole('option').nth(indice).click().catch(() => {});
    await this.page.waitForTimeout(1500);
  }

  /** Texto "X de Y colaboradores responderam" do resumo. */
  async getResumoRespostas(): Promise<string> {
    const txt = await this.page.locator('main, body').first().innerText();
    const m = txt.match(/\d+\s+de\s+\d+\s+colaboradores/i);
    return m ? m[0] : '';
  }

  async getRowCount(): Promise<number> {
    return this.tableRows.count();
  }

  colunaHeader(nome: string): Locator {
    return this.page.locator('thead th').filter({ hasText: nome }).first();
  }
}
