import { test, expect } from '../../fixtures/test-fixtures';
import { RelatoriosIndividuaisPage } from '../../pages/RelatoriosIndividuaisPage';
import { takeEvidenceScreenshot } from '../../utils/screenshots';

// Módulo Relatórios Individuais (/relatorios/individuais) — leitura.
// 4 abas (BAI/BHS/BDI/BSS), cada uma um relatório de entrevista individual.
// A troca de protocolo é feita via clique na aba (dispara a consulta da API).
//
// Cobre: estrutura das abas e seções, regressão do BUG #691 (BHS voltou a
// exibir a análise por pergunta) e 2 guards test.fail de bugs descobertos
// nesta automação (deep-link ignora o protocolo; rótulo de distribuição fixo
// em "ANSIEDADE").

test.describe('Relatórios Individuais', () => {
  let p: RelatoriosIndividuaisPage;

  test.beforeEach(async ({ page }) => {
    p = new RelatoriosIndividuaisPage(page);
    await p.navigate();
  });

  test('RI01 — deve carregar a rota com título "Relatórios Individuais"', async ({ page }) => {
    await expect(p.titulo).toBeVisible();
    await takeEvidenceScreenshot(page, test.info(), 'relatorios-individuais');
  });

  test('RI02 — deve exibir as 4 abas de protocolo (BAI, BHS, BDI, BSS)', async () => {
    for (const proto of ['BAI', 'BHS', 'BDI', 'BSS'] as const) {
      await expect(p.aba(proto)).toBeVisible();
    }
  });

  test('RI03 — BAI: exibe as seções principais do relatório', async () => {
    await p.selecionarProtocolo('BAI');
    await expect(p.secaoHeading(/Perfil dos Respondentes/i)).toBeVisible();
    await expect(p.secaoHeading(/Casos Moderados e Graves/i)).toBeVisible();
    await expect(p.secaoHeading(/DISTRIBUIÇÃO POR NÍVEL/i)).toBeVisible();
  });

  test('RI04 — BAI: consulta a API com sucesso e exibe a análise por pergunta', async () => {
    const status = await p.selecionarProtocolo('BAI');
    if (status !== null) expect(status).toBeLessThan(400);
    expect(await p.temAnalisePorPergunta()).toBeTruthy();
  });

  test('RI05 — BHS: a aba consulta a API (200) e carrega conteúdo próprio', async () => {
    const status = await p.selecionarProtocolo('BHS');
    expect(status).toBe(200);
  });

  test('RI06 — BHS: exibe as seções principais do relatório', async () => {
    await p.selecionarProtocolo('BHS');
    await expect(p.secaoHeading(/Perfil dos Respondentes/i)).toBeVisible();
    await expect(p.secaoHeading(/Casos Moderados e Graves/i)).toBeVisible();
  });

  // REGRESSÃO BUG #691 — o BHS voltou a exibir a seção de análise por pergunta
  // (antes a chave `perguntasBhs` da API não era lida e a seção sumia). Este
  // teste TRAVA a correção: deve PASSAR; se o BHS regredir, falha.
  test('RI07 — BHS: exibe a seção "Análise por Pergunta" [regressão #691]', async () => {
    await p.selecionarProtocolo('BHS');
    await expect(p.secaoHeading(/Análise.*por Pergunta/i)).toBeVisible();
    expect(await p.temAnalisePorPergunta()).toBeTruthy();
  });

  // REGRESSÃO BUG #691 — o relatório do BHS deve ter corpo substancial (no bug,
  // sem a seção de perguntas, o corpo ficava ~900 chars). Guard de tamanho.
  test('RI08 — BHS: corpo do relatório é substancial (não o estado quebrado) [regressão #691]', async () => {
    await p.selecionarProtocolo('BHS');
    expect(await p.getBodyLength()).toBeGreaterThan(1500);
  });

  test('RI09 — BSS: a aba consulta a API (200)', async () => {
    const status = await p.selecionarProtocolo('BSS');
    expect(status).toBe(200);
  });

  test('RI10 — BSS: exibe a seção exclusiva "TENTATIVAS ANTERIORES (ITEM 20)"', async () => {
    await p.selecionarProtocolo('BSS');
    expect(await p.temTentativasItem20()).toBeTruthy();
  });

  test('RI11 — BSS: exibe a análise por pergunta', async () => {
    await p.selecionarProtocolo('BSS');
    expect(await p.temAnalisePorPergunta()).toBeTruthy();
  });

  test('RI12 — BDI: consulta a API (200) e exibe a análise por pergunta', async () => {
    const status = await p.selecionarProtocolo('BDI');
    expect(status).toBe(200);
    expect(await p.temAnalisePorPergunta()).toBeTruthy();
  });

  test('RI13 — trocar de aba dispara nova consulta e muda o conteúdo do relatório', async () => {
    await p.selecionarProtocolo('BAI');
    const periodoBai = await p.getPeriodo();
    const semTentativasBai = await p.temTentativasItem20();
    const statusBss = await p.selecionarProtocolo('BSS');
    const periodoBss = await p.getPeriodo();
    const comTentativasBss = await p.temTentativasItem20();
    expect(statusBss).toBe(200);
    // BSS tem o item 20 e período distinto do BAI => o conteúdo de fato mudou
    expect(semTentativasBai).toBeFalsy();
    expect(comTentativasBss).toBeTruthy();
    expect(periodoBss).not.toBe(periodoBai);
  });

  test('RI14 — os 4 protocolos respondem com sucesso em /screens/relatorios/protocolo/{proto}', async () => {
    for (const proto of ['BHS', 'BSS', 'BDI'] as const) {
      const status = await p.selecionarProtocolo(proto);
      expect(status, `protocolo ${proto}`).toBe(200);
    }
    // BAI carrega na entrada; valida que a seção rendeniza ao reselecioná-lo
    await p.selecionarProtocolo('BAI');
    expect(await p.temAnalisePorPergunta()).toBeTruthy();
  });

  // BUG NOVO (deep-link) — abrir/recarregar a URL com `?protocolo=bhs` deveria
  // abrir o relatório BHS, mas a página IGNORA o query param e sempre abre o
  // BAI. Afirma o comportamento CORRETO (deep-link respeita o protocolo) —
  // falha enquanto o bug existir.
  test.fail('RI15 — deep-link ?protocolo=bhs deveria abrir o relatório BHS [BUG deep-link]', async ({ page }) => {
    await page.goto(p.urlComProtocolo('BHS'), { waitUntil: 'load' });
    await p.titulo.waitFor({ state: 'visible', timeout: 20000 });
    await page.waitForTimeout(2500);
    // BHS tem período 23/05–26/05; o BAI tem 19/05. Se o deep-link funcionasse,
    // o período seria o do BHS (não o do BAI).
    expect(await p.getPeriodo()).not.toContain('19/05/2026');
  });

  // BUG NOVO (rótulo) — a "DISTRIBUIÇÃO POR NÍVEL DE ..." deveria refletir o
  // protocolo (Desesperança no BHS), mas fica fixa em "ANSIEDADE" para todos.
  // Afirma o comportamento CORRETO — falha enquanto o rótulo for hardcoded.
  test.fail('RI16 — distribuição do BHS deveria ser "DESESPERANÇA", não "ANSIEDADE" [BUG rótulo]', async () => {
    await p.selecionarProtocolo('BHS');
    const heading = await p.getDistribuicaoHeading();
    expect(heading.toUpperCase()).not.toContain('ANSIEDADE');
  });
});
