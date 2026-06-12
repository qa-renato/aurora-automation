import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import logger from '../utils/logger';
import { getEnvironmentConfig } from '../config/environments';

// Rota: /auditoria — "Auditoria do Sistema".
// Tabela de log de eventos (colunas: Data e Hora | Usuário | Ação | Recurso |
// Decisão) + campo de busca ("Buscar por usuário, ação ou recurso..."). Leitura.
//
// ⚠️ Bug conhecido (#688): a tela NÃO exibe registros. Diferente do que o
// relatório de 10/06 descrevia (frontend não chamava a API), HOJE o frontend
// FAZ a chamada `GET /auditoria`, mas a API responde **403** — e a UI fica presa
// em skeleton infinito (10 linhas `.animate-pulse`), sem dados, empty-state nem
// mensagem de erro. NÃO é o falso-negativo de sessão: `/me` retorna 200 nesta
// mesma sessão automatizada; apenas `/auditoria` é 403. Coberto por test.fail.

export class AuditoriaPage extends BasePage {
  protected readonly pageUrl: string;

  readonly titulo: Locator;
  readonly buscaInput: Locator;
  readonly tableRows: Locator;
  readonly skeletonRows: Locator;

  /** Status HTTP de cada resposta de `GET /auditoria` capturada no navigate(). */
  private auditoriaStatuses: number[] = [];

  constructor(page: Page) {
    super(page);
    this.pageUrl = getEnvironmentConfig().baseUrl + '/auditoria';
    this.titulo = page.getByText('Auditoria do Sistema', { exact: false }).first();
    this.buscaInput = page.getByPlaceholder(/Buscar por usuário/i).first();
    this.tableRows = page.locator('tbody tr');
    this.skeletonRows = page.locator('tbody tr .animate-pulse, tbody .animate-pulse');
  }

  async navigate(): Promise<void> {
    logger.info('Navegando para /auditoria');
    this.auditoriaStatuses = [];
    const onResponse = (r: import('@playwright/test').Response) => {
      if (/\/auditoria(\?|$)/i.test(r.url()) && /aurora-api/i.test(r.url())) {
        this.auditoriaStatuses.push(r.status());
      }
    };
    this.page.on('response', onResponse);

    let ok = false;
    for (let i = 1; i <= 3 && !ok; i++) {
      await this.page.goto(this.pageUrl, { waitUntil: 'load' });
      try {
        await this.titulo.waitFor({ state: 'visible', timeout: 20000 });
        ok = true;
      } catch {
        logger.warn(`/auditoria não carregou (tentativa ${i})`);
        await this.page.waitForTimeout(1500);
      }
    }
    if (!ok) {
      this.page.off('response', onResponse);
      throw new Error('Falha ao carregar /auditoria (instabilidade de token/carga).');
    }
    // dá tempo da chamada de dados resolver (sucesso, vazio ou 403)
    await this.page.waitForTimeout(2000);
    this.page.off('response', onResponse);
  }

  colunaHeader(nome: string): Locator {
    return this.page.locator('thead th').filter({ hasText: nome }).first();
  }

  /** Quantidade de linhas que efetivamente têm conteúdo (ignora skeleton/vazias). */
  async getDataRowCount(): Promise<number> {
    const rows = await this.tableRows.all();
    let n = 0;
    for (const r of rows) {
      const t = (await r.innerText().catch(() => '')).replace(/\s/g, '');
      if (t.length > 0) n++;
    }
    return n;
  }

  /** A tabela ainda está em estado de carregamento (skeleton pulsando)? */
  async estaCarregando(): Promise<boolean> {
    return (await this.skeletonRows.count()) > 0;
  }

  /** Status HTTP capturados da API de auditoria durante o navigate(). */
  getAuditoriaStatuses(): number[] {
    return this.auditoriaStatuses;
  }

  async buscar(termo: string): Promise<void> {
    await this.buscaInput.fill(termo);
    await this.page.waitForTimeout(2000);
  }
}
