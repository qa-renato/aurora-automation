import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import logger from '../utils/logger';
import { getEnvironmentConfig } from '../config/environments';

interface Kpi { valor?: number; label?: string }
interface ConsolidadoKpis { bemEstar?: Kpi; risco?: Kpi; balanca?: Kpi }
interface Periodo { inicio?: string; fim?: string }

// Rota: /relatorios/consolidado — "Resultados Consolidados". Consome
// `GET /screens/relatorios/consolidado`. Conteúdo: período (datas reais),
// Filtros, Taxa de Participação, Níveis BAI/BHS (barras), 3 indicadores
// (Bem-Estar/Risco/Balança), Casos Graves e tabela Resultados Individuais com
// Exportar CSV. Apenas leitura.
//
// ⚠️ Mecânica não óbvia: o DEEP-LINK direto a /relatorios/consolidado
// REDIRECIONA para a home — a página só monta via navegação client-side. Por
// isso o navigate() carrega pela home → acordeão "Resultados Consolidados" →
// "Visualizar Dashboard".
//
// Bugs:
//  - #689 (test.fail): a API retorna `label` para bemEstar/risco mas NÃO para
//    `balanca`; o indicador "Balança Trabalho vs. Vida" aparece sem status.
//  - #690 (RESOLVIDO, regressão passante): o período exibido agora reflete a
//    janela real da API (datas inicio–fim), não mais um rótulo fixo "Últimos
//    30 dias" divergente. Travado por teste de regressão (não test.fail).

export class RelatoriosConsolidadoPage extends BasePage {
  protected readonly pageUrl: string;

  readonly titulo: Locator;
  readonly taxaParticipacao: Locator;
  readonly exportarCsv: Locator;
  readonly tabelaRows: Locator;

  private kpis: ConsolidadoKpis | null = null;
  private periodoApi: Periodo | null = null;
  private apiStatus: number | null = null;

  constructor(page: Page) {
    super(page);
    this.pageUrl = getEnvironmentConfig().baseUrl + '/relatorios/consolidado';
    this.titulo = page.getByText('Resultados Consolidados', { exact: false }).first();
    this.taxaParticipacao = page.getByText(/Taxa de Participação/i).first();
    this.exportarCsv = page.getByRole('button', { name: /Exportar CSV/i }).first();
    this.tabelaRows = page.locator('tbody tr');
  }

  async navigate(): Promise<void> {
    logger.info('Navegando para /relatorios/consolidado (via home → acordeão)');
    this.kpis = null;
    this.periodoApi = null;
    this.apiStatus = null;
    const onResponse = async (r: import('@playwright/test').Response) => {
      if (/screens\/relatorios\/consolidado/i.test(r.url())) {
        this.apiStatus = r.status();
        try {
          const j = await r.json();
          if (j?.kpis) this.kpis = j.kpis;
          if (j?.periodo) this.periodoApi = j.periodo;
        } catch {
          /* não-JSON */
        }
      }
    };
    this.page.on('response', onResponse);

    const base = getEnvironmentConfig().baseUrl;
    let ok = false;
    for (let i = 1; i <= 3 && !ok; i++) {
      await this.page.goto(base + '/', { waitUntil: 'load' });
      await this.page.waitForTimeout(2500);
      await this.page
        .getByRole('button', { name: 'Resultados Consolidados' })
        .click()
        .catch(() => {});
      await this.page.waitForTimeout(800);
      await this.page.getByText('Visualizar Dashboard').first().click().catch(() => {});
      try {
        // "Taxa de Participação" só existe no relatório montado (a home tem só o
        // acordeão "Resultados Consolidados"), então é o sinal de carga confiável
        await this.taxaParticipacao.waitFor({ state: 'visible', timeout: 20000 });
        ok = true;
      } catch {
        logger.warn(`/relatorios/consolidado não montou (tentativa ${i})`);
        await this.page.waitForTimeout(1500);
      }
    }
    if (!ok) {
      this.page.off('response', onResponse);
      throw new Error('Falha ao montar /relatorios/consolidado (instabilidade de token/carga).');
    }
    await this.page.waitForTimeout(1500);
    this.page.off('response', onResponse);
  }

  getKpis(): ConsolidadoKpis | null {
    return this.kpis;
  }

  getPeriodoApi(): Periodo | null {
    return this.periodoApi;
  }

  getApiStatus(): number | null {
    return this.apiStatus;
  }

  private async bodyText(): Promise<string> {
    return (await this.page.locator('main, body').first().innerText()).replace(/\s+/g, ' ');
  }

  /** Faixa de período exibida no topo (ex.: "2026-05-19 – 2026-05-26"). */
  async getPeriodoExibido(): Promise<string> {
    const m = (await this.bodyText()).match(
      /\d{4}-\d{2}-\d{2}\s*[–-]\s*\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}\s*[–-]\s*\d{2}\/\d{2}\/\d{4}/,
    );
    return m ? m[0] : '';
  }

  /** Texto "X de Y colaboradores (Z%)" da taxa de participação. */
  async getTaxaTexto(): Promise<string> {
    const m = (await this.bodyText()).match(/\d+\s+de\s+\d+\s+colaboradores\s*\(\d+%\)/i);
    return m ? m[0] : '';
  }

  nivelHeading(protocolo: 'BAI' | 'BHS'): Locator {
    return this.page.locator('h2, h3').filter({ hasText: new RegExp(`NÍVEIS.*\\(${protocolo}\\)`, 'i') }).first();
  }

  indicador(nome: string | RegExp): Locator {
    return this.page.getByText(nome).first();
  }

  colunaTabela(nome: string): Locator {
    return this.page.locator('thead th, table th').filter({ hasText: nome }).first();
  }

  async getRechartsCount(): Promise<number> {
    return this.page.locator('svg.recharts-surface').count();
  }
}
