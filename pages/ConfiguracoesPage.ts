import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import logger from '../utils/logger';
import { getEnvironmentConfig } from '../config/environments';

// Rota: /configuracoes — "Configurações Visuais e de Sistema". Consome
// `GET /configuracoes` (+ /provisioning/status, /campos/uso). Seções:
// Informações do Bot (BOTID, INTABLE API KEY mascarada), Integração de
// Colaboradores (sincronismo), Personalizar Interface (logo/cores), Tabelas de
// Dados (tabela NOME/EXISTE/ATIVA/REGISTROS/ÚLTIMA ATUALIZAÇÃO) e Campos de
// Colaborador (departamentos/cargos com "em uso por N"). Apenas leitura.

export class ConfiguracoesPage extends BasePage {
  protected readonly pageUrl: string;

  readonly titulo: Locator;
  readonly tabelaRows: Locator;

  private apiStatus: number | null = null;

  constructor(page: Page) {
    super(page);
    this.pageUrl = getEnvironmentConfig().baseUrl + '/configuracoes';
    this.titulo = page.getByText('Configurações Visuais e de Sistema', { exact: false }).first();
    this.tabelaRows = page.locator('tbody tr');
  }

  async navigate(): Promise<void> {
    logger.info('Navegando para /configuracoes');
    this.apiStatus = null;
    const onResponse = (r: import('@playwright/test').Response) => {
      // a rota da API é exatamente /configuracoes (sem subpath)
      if (/aurora-api.*\/configuracoes(\?|$)/i.test(r.url())) this.apiStatus = r.status();
    };
    this.page.on('response', onResponse);

    let ok = false;
    for (let i = 1; i <= 3 && !ok; i++) {
      await this.page.goto(this.pageUrl, { waitUntil: 'load' });
      try {
        await this.titulo.waitFor({ state: 'visible', timeout: 20000 });
        ok = true;
      } catch {
        logger.warn(`/configuracoes não carregou (tentativa ${i})`);
        await this.page.waitForTimeout(1500);
      }
    }
    if (!ok) {
      this.page.off('response', onResponse);
      throw new Error('Falha ao carregar /configuracoes (instabilidade de token/carga).');
    }
    await this.page.waitForTimeout(1500);
    this.page.off('response', onResponse);
  }

  getApiStatus(): number | null {
    return this.apiStatus;
  }

  secaoHeading(nome: string | RegExp): Locator {
    return this.page.locator('h2, h3').filter({ hasText: nome }).first();
  }

  colunaHeader(nome: string): Locator {
    return this.page.locator('thead th, table th').filter({ hasText: nome }).first();
  }

  async getTableRowCount(): Promise<number> {
    return this.tabelaRows.count();
  }

  async bodyText(): Promise<string> {
    return (await this.page.locator('main, body').first().innerText()).replace(/\s+/g, ' ');
  }

  inputPorPlaceholder(ph: string | RegExp): Locator {
    return this.page.getByPlaceholder(ph).first();
  }

  botao(nome: string | RegExp): Locator {
    return this.page.getByRole('button', { name: nome }).first();
  }
}
