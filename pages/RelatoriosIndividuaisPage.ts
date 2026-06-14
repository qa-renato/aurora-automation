import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import logger from '../utils/logger';
import { getEnvironmentConfig } from '../config/environments';

export type Protocolo = 'BAI' | 'BHS' | 'BSS' | 'BDI';

// Rota: /relatorios/individuais — "Relatórios Individuais".
// Página com 4 abas (BAI/BHS/BDI/BSS); cada aba é uma entrevista individual e
// dispara `GET /screens/relatorios/protocolo/{sigla}`. Seções por protocolo:
// Filtros, Distribuição por Nível, Perfil dos Respondentes, Casos Moderados e
// Graves, e a Análise por Pergunta. Apenas leitura.
//
// ⚠️ Mecânica não óbvia (verificada 2026-06-12):
//  - A TROCA de protocolo é feita CLICANDO na aba (estado interno do React) — o
//    clique dispara o fetch e atualiza o conteúdo (período/seções mudam).
//  - O query param `?protocolo=X` é IGNORADO no carregamento direto/refresh: a
//    página sempre abre no BAI. (Bug de deep-link — ver spec, guard test.fail.)
//  Por isso o POM navega por aba, não por URL.
//
// ✅ BUG #691 corrigido: o BHS agora EXIBE a seção de análise por pergunta
// (heading "Análise por Pergunta", corpo ~2700 chars). Antes a seção não
// renderizava (corpo ~900). Travado por teste de regressão (não test.fail).

export class RelatoriosIndividuaisPage extends BasePage {
  protected readonly pageUrl: string;

  readonly titulo: Locator;

  constructor(page: Page) {
    super(page);
    this.pageUrl = getEnvironmentConfig().baseUrl + '/relatorios/individuais';
    this.titulo = page.getByText('Relatórios Individuais', { exact: false }).first();
  }

  async navigate(): Promise<void> {
    logger.info('Navegando para /relatorios/individuais');
    let ok = false;
    for (let i = 1; i <= 3 && !ok; i++) {
      await this.page.goto(this.pageUrl, { waitUntil: 'load' });
      try {
        await this.titulo.waitFor({ state: 'visible', timeout: 20000 });
        ok = true;
      } catch {
        logger.warn(`/relatorios/individuais não carregou (tentativa ${i})`);
        await this.page.waitForTimeout(1500);
      }
    }
    if (!ok) throw new Error('Falha ao carregar /relatorios/individuais (instabilidade de token/carga).');
    await this.page.waitForTimeout(1500);
  }

  /** URL de deep-link com o query param de protocolo (ex.: ?protocolo=bhs). */
  urlComProtocolo(proto: Protocolo): string {
    return `${this.pageUrl}?protocolo=${proto.toLowerCase()}`;
  }

  aba(proto: Protocolo): Locator {
    return this.page.getByText(proto, { exact: true }).first();
  }

  /** Clica na aba do protocolo e aguarda a consulta resolver. Retorna o status
   *  HTTP de `GET /screens/relatorios/protocolo/{proto}` (ou null se não houve
   *  nova chamada — caso do BAI já carregado na entrada). */
  async selecionarProtocolo(proto: Protocolo): Promise<number | null> {
    logger.info(`Selecionando protocolo ${proto}`);
    const sigla = proto.toLowerCase();
    const respPromise = this.page
      .waitForResponse((r) => new RegExp(`relatorios/protocolo/${sigla}`, 'i').test(r.url()), { timeout: 8000 })
      .catch(() => null);
    await this.aba(proto).click();
    const resp = await respPromise;
    await this.page.waitForTimeout(1800);
    return resp ? resp.status() : null;
  }

  private async bodyText(): Promise<string> {
    return (await this.page.locator('main, body').first().innerText()).replace(/\s+/g, ' ');
  }

  /** Tamanho do corpo do relatório (proxy de "renderizou com conteúdo"). */
  async getBodyLength(): Promise<number> {
    return (await this.bodyText()).length;
  }

  secaoHeading(nome: string | RegExp): Locator {
    return this.page.locator('h2, h3, h4').filter({ hasText: nome }).first();
  }

  /** A seção de análise por pergunta está presente? (BHS usa "Análise por
   *  Pergunta"; os demais "Análise Detalhada por Pergunta".) */
  async temAnalisePorPergunta(): Promise<boolean> {
    return /Análise (Detalhada )?por Pergunta/i.test(await this.bodyText());
  }

  /** Seção exclusiva do BSS: "TENTATIVAS ANTERIORES (ITEM 20)". */
  async temTentativasItem20(): Promise<boolean> {
    return /TENTATIVAS ANTERIORES/i.test(await this.bodyText());
  }

  /** Texto do heading "DISTRIBUIÇÃO POR NÍVEL DE ...". */
  async getDistribuicaoHeading(): Promise<string> {
    const m = (await this.bodyText()).match(/DISTRIBUIÇÃO POR NÍVEL DE \w+/i);
    return m ? m[0] : '';
  }

  /** Texto "Período dos dados: ..." exibido no topo do relatório. */
  async getPeriodo(): Promise<string> {
    const m = (await this.bodyText()).match(/Período dos dados:[^|]+?\d{2}\/\d{2}\/\d{4}/i);
    return m ? m[0].trim() : '';
  }
}
