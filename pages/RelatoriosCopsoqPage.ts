import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import logger from '../utils/logger';
import { getEnvironmentConfig } from '../config/environments';

interface Kpi { valor?: number; label?: string }
interface CopsoqKpis { bemEstar?: Kpi; risco?: Kpi; balanca?: Kpi }

// Rota: /relatorios/copsoq — "Relatório COPSOQ" (Entrevista Ocupacional /
// Copenhague). Consome `GET /screens/relatorios/protocolo/copsoq`.
// Topo: 3 KPIs (BEM-ESTAR, RISCO, BALANÇA T×V) em cards `.border-t-4`, cada um
// com um medidor semicircular (svg viewBox 0 0 120 60). Seções: Distribuições
// Demográficas, Análise de Pontuações, Pontos Fortes, Pontos de Atenção,
// Análise de Risco por Grupos. Apenas leitura.
//
// ⚠️ Bugs conhecidos cobertos por test.fail:
//  - #689: a API retorna `label` para bemEstar/risco, mas NÃO para `balanca`;
//    o card "BALANÇA T×V" aparece sem o descritor qualitativo de status.
//  - #693: os 3 indicadores são medidores/cards (gauge semicircular), enquanto
//    o protótipo aprovado pede gráficos de ROSCA (doughnut).

export class RelatoriosCopsoqPage extends BasePage {
  protected readonly pageUrl: string;

  readonly titulo: Locator;
  readonly kpiGrid: Locator;
  readonly kpiCards: Locator;

  /** Payload `kpis` capturado de `GET /screens/relatorios/protocolo/copsoq`. */
  private kpis: CopsoqKpis | null = null;
  private apiStatus: number | null = null;

  constructor(page: Page) {
    super(page);
    this.pageUrl = getEnvironmentConfig().baseUrl + '/relatorios/copsoq';
    this.titulo = page.getByText('Relatório COPSOQ', { exact: false }).first();
    this.kpiGrid = page.locator('div.grid.grid-cols-3.gap-4.mb-10').first();
    this.kpiCards = page.locator('div.border-t-4');
  }

  async navigate(): Promise<void> {
    logger.info('Navegando para /relatorios/copsoq');
    this.kpis = null;
    this.apiStatus = null;
    const onResponse = async (r: import('@playwright/test').Response) => {
      if (/relatorios\/protocolo\/copsoq/i.test(r.url())) {
        this.apiStatus = r.status();
        try {
          const j = await r.json();
          if (j && j.kpis) this.kpis = j.kpis;
        } catch {
          /* resposta não-JSON: ignora */
        }
      }
    };
    this.page.on('response', onResponse);

    let ok = false;
    for (let i = 1; i <= 3 && !ok; i++) {
      // a SPA precisa de uma sessão hidratada; a 1ª tentativa pode cair na home
      if (i > 1) {
        await this.page.goto(getEnvironmentConfig().baseUrl + '/', { waitUntil: 'load' }).catch(() => {});
        await this.page.waitForTimeout(1500);
      }
      await this.page.goto(this.pageUrl, { waitUntil: 'load' });
      try {
        await this.titulo.waitFor({ state: 'visible', timeout: 20000 });
        ok = true;
      } catch {
        logger.warn(`/relatorios/copsoq não carregou (tentativa ${i})`);
        await this.page.waitForTimeout(1500);
      }
    }
    if (!ok) {
      this.page.off('response', onResponse);
      throw new Error('Falha ao carregar /relatorios/copsoq (instabilidade de token/carga).');
    }
    await this.page.waitForTimeout(2000);
    this.page.off('response', onResponse);
  }

  getKpis(): CopsoqKpis | null {
    return this.kpis;
  }

  getApiStatus(): number | null {
    return this.apiStatus;
  }

  /** Card do KPI cujo nome é informado (BEM-ESTAR / RISCO / BALANÇA). */
  kpiCard(nome: string | RegExp): Locator {
    return this.kpiCards.filter({ hasText: nome }).first();
  }

  secaoHeading(nome: string | RegExp): Locator {
    return this.page.locator('h2, h3').filter({ hasText: nome }).first();
  }

  subgrupoHeading(nome: string | RegExp): Locator {
    return this.page.locator('h3, h4').filter({ hasText: nome }).first();
  }

  /** Nº de gráficos de pizza/rosca (recharts) dentro da grade dos 3 KPIs.
   *  Hoje é 0 (os KPIs são medidores em svg simples, não doughnut). */
  async getKpiDoughnutCount(): Promise<number> {
    return this.kpiGrid.locator('.recharts-pie, path.recharts-sector').count();
  }

  /** Razão altura/largura do medidor do 1º KPI. Um doughnut/rosca é ~quadrado
   *  (>0.8); o gauge atual é 120×60 (~0.5). */
  async getKpiChartAspect(): Promise<number> {
    const svg = this.kpiCards.first().locator('svg').first();
    const vb = await svg.getAttribute('viewBox').catch(() => null);
    if (!vb) return 0;
    const [, , w, h] = vb.split(/\s+/).map(Number);
    return w ? h / w : 0;
  }

  /** Nº de gráficos demográficos (recharts) na página — devem renderizar. */
  async getRechartsCount(): Promise<number> {
    return this.page.locator('svg.recharts-surface').count();
  }
}
