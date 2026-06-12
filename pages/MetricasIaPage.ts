import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import logger from '../utils/logger';
import { getEnvironmentConfig } from '../config/environments';

// Rota: /metricas-ia — "Inteligência Artificial".
// 2 KPIs (Volume de Interações, Quantidade de Usuários) + gráfico "Evolução de
// Interações" (recharts, linha) + toggle de período (7/15/30 dias).
// ⚠️ Bug conhecido (#687): badges de variação "+12%/+8%" são estáticos (a API
// /screens/metricas-ia não retorna percentual). Coberto por test.fail.

export class MetricasIaPage extends BasePage {
  protected readonly pageUrl: string;

  readonly titulo: Locator;
  readonly kpiVolume: Locator;
  readonly kpiUsuarios: Locator;
  readonly chart: Locator;
  readonly evolucaoHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.pageUrl = getEnvironmentConfig().baseUrl + '/metricas-ia';
    this.titulo = page.getByText('Inteligência Artificial', { exact: false }).first();
    this.kpiVolume = page.getByText('VOLUME DE INTERAÇÕES', { exact: false }).first();
    this.kpiUsuarios = page.getByText('QUANTIDADE DE USUÁRIOS', { exact: false }).first();
    this.chart = page.locator('svg.recharts-surface').first();
    this.evolucaoHeading = page.getByRole('heading', { name: /Evolução de Interações/i });
  }

  async navigate(): Promise<void> {
    logger.info('Navegando para /metricas-ia');
    let ok = false;
    for (let i = 1; i <= 3 && !ok; i++) {
      await this.page.goto(this.pageUrl, { waitUntil: 'load' });
      try {
        await this.titulo.waitFor({ state: 'visible', timeout: 20000 });
        ok = true;
      } catch {
        logger.warn(`/metricas-ia não carregou (tentativa ${i})`);
        await this.page.waitForTimeout(1500);
      }
    }
    if (!ok) throw new Error('Falha ao carregar /metricas-ia (instabilidade de token/carga).');
    await this.page.waitForTimeout(800);
  }

  periodoButton(label: '7 dias' | '15 dias' | '30 dias'): Locator {
    return this.page.getByText(label, { exact: true }).first();
  }

  async selecionarPeriodo(label: '7 dias' | '15 dias' | '30 dias'): Promise<void> {
    logger.info(`Selecionando período: ${label}`);
    await this.periodoButton(label).click();
    await this.page.waitForTimeout(1500);
  }

  /** Valor numérico do KPI cujo rótulo é informado (lê o número que segue o label). */
  async getKpiValor(label: 'VOLUME DE INTERAÇÕES' | 'QUANTIDADE DE USUÁRIOS'): Promise<string> {
    const txt = await this.page.locator('main, body').first().innerText();
    const idx = txt.toUpperCase().indexOf(label);
    if (idx < 0) return '';
    const m = txt.slice(idx + label.length, idx + label.length + 20).match(/\d[\d.]*/);
    return m ? m[0] : '';
  }

  /** Texto do badge de variação que segue o KPI (ex.: "+12%"). */
  async getVariacaoBadge(label: 'VOLUME DE INTERAÇÕES' | 'QUANTIDADE DE USUÁRIOS'): Promise<string> {
    const txt = await this.page.locator('main, body').first().innerText();
    const idx = txt.toUpperCase().indexOf(label);
    if (idx < 0) return '';
    const m = txt.slice(idx, idx + 60).match(/[+\-]\d+%/);
    return m ? m[0] : '';
  }

  async getChartCount(): Promise<number> {
    return this.page.locator('svg.recharts-surface').count();
  }

  async hoverChartTooltip(): Promise<string> {
    const box = await this.chart.boundingBox();
    if (!box) return '';
    // o tooltip da linha só aparece sobre um ponto/coluna — varre o eixo X
    for (const fx of [0.5, 0.35, 0.65, 0.2, 0.8, 0.9]) {
      await this.page.mouse.move(box.x + box.width * fx, box.y + box.height * 0.5);
      await this.page.waitForTimeout(350);
      const t = (await this.page.locator('.recharts-tooltip-wrapper').first().textContent().catch(() => '')) ?? '';
      if (t.trim()) return t.trim();
    }
    return '';
  }
}
