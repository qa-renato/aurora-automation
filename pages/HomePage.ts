import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import logger from '../utils/logger';
import { getEnvironmentConfig } from '../config/environments';

// Rota: / (home) — Dashboard "Aurora: Empresa Demo". Consome
// `GET /screens/dashboard`. Conteúdo: 4 indicadores (Índice de Bem-Estar,
// Média Geral de Risco, Balança: Trabalho vs. Vida, Casos Graves) + botão
// "Gerenciar Casos" + 3 acordeões de relatórios (Individuais, COPSOQ,
// Consolidados). Apenas leitura.
//
// Obs.: na home a Balança EXIBE o rótulo de status (ex.: "ATENÇÃO"), diferente
// dos relatórios COPSOQ/Consolidado, onde o mesmo indicador vem sem label
// (bug #689) — o dado de status existe no `/screens/dashboard`.

export class HomePage extends BasePage {
  protected readonly pageUrl: string;

  readonly titulo: Locator;
  readonly gerenciarCasos: Locator;

  private apiStatus: number | null = null;

  constructor(page: Page) {
    super(page);
    this.pageUrl = getEnvironmentConfig().baseUrl + '/';
    this.titulo = page.getByText('Aurora: Empresa Demo', { exact: false }).first();
    this.gerenciarCasos = page.getByRole('button', { name: /Gerenciar Casos/i }).first();
  }

  async navigate(): Promise<void> {
    logger.info('Navegando para / (home)');
    this.apiStatus = null;
    const onResponse = (r: import('@playwright/test').Response) => {
      if (/screens\/dashboard/i.test(r.url())) this.apiStatus = r.status();
    };
    this.page.on('response', onResponse);

    let ok = false;
    for (let i = 1; i <= 3 && !ok; i++) {
      await this.page.goto(this.pageUrl, { waitUntil: 'load' });
      try {
        await this.titulo.waitFor({ state: 'visible', timeout: 20000 });
        ok = true;
      } catch {
        logger.warn(`home não carregou (tentativa ${i})`);
        await this.page.waitForTimeout(1500);
      }
    }
    if (!ok) {
      this.page.off('response', onResponse);
      throw new Error('Falha ao carregar a home (instabilidade de token/carga).');
    }
    await this.page.waitForTimeout(1500);
    this.page.off('response', onResponse);
  }

  getApiStatus(): number | null {
    return this.apiStatus;
  }

  indicador(nome: string | RegExp): Locator {
    return this.page.getByText(nome, { exact: false }).first();
  }

  acordeao(nome: string): Locator {
    return this.page.getByRole('button', { name: nome }).first();
  }

  /** Texto da home, normalizado, para asserts de conteúdo dinâmico. */
  async bodyText(): Promise<string> {
    return (await this.page.locator('main, body').first().innerText()).replace(/\s+/g, ' ');
  }

  /** Rótulo de status exibido junto à Balança (ex.: "ATENÇÃO"). '' se ausente. */
  async getBalancaStatus(): Promise<string> {
    const m = (await this.bodyText()).match(
      /Balança:\s*Trabalho vs\.\s*Vida\s*[\d.,]+\s*(ATENÇÃO|REGULAR|MODERADO|BOM|RUIM|CRÍTICO|ALTO|BAIXO|ÓTIMO)/i,
    );
    return m ? m[1] : '';
  }
}
