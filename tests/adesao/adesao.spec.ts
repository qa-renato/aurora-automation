import { test, expect } from '../../fixtures/test-fixtures';
import { AdesaoPage } from '../../pages/AdesaoPage';
import { takeEvidenceScreenshot } from '../../utils/screenshots';

// Módulo Adesão e Engajamento (/adesao) — leitura.
// Seletor de Lote, resumo de adesão, tabela de acompanhamento e exportação.

test.describe('Adesão e Engajamento', () => {
  test.beforeEach(async ({ page }) => {
    await new AdesaoPage(page).navigate();
  });

  test('AD01 — deve carregar a rota com título "Adesão e Engajamento"', async ({ page }) => {
    const p = new AdesaoPage(page);
    await expect(p.titulo).toBeVisible();
    await takeEvidenceScreenshot(page, test.info(), 'adesao');
  });

  test('AD02 — seletor de Lote deve listar múltiplas opções', async ({ page }) => {
    const p = new AdesaoPage(page);
    const opts = await p.getOpcoesLote();
    expect(opts.length).toBeGreaterThan(1);
    // as opções seguem o padrão "Protocolo (SIGLA) — DD/MM/AAAA"
    expect(opts.some((o) => /\(\w+\).*\d{2}\/\d{2}\/\d{4}/.test(o))).toBeTruthy();
  });

  test('AD03 — tabela "Acompanhamento por Colaborador" com colunas Colaborador e Status', async ({ page }) => {
    const p = new AdesaoPage(page);
    await expect(p.colunaHeader('Colaborador')).toBeVisible();
    await expect(p.colunaHeader('Status')).toBeVisible();
  });

  test('AD04 — deve exibir o resumo de respostas ("X de Y colaboradores")', async ({ page }) => {
    const p = new AdesaoPage(page);
    expect(await p.getResumoRespostas()).toMatch(/\d+\s+de\s+\d+\s+colaboradores/i);
  });

  test('AD05 — trocar de Lote deve atualizar o resumo e/ou a tabela', async ({ page }) => {
    const p = new AdesaoPage(page);
    const antesResumo = await p.getResumoRespostas();
    const antesRows = await p.getRowCount();
    await p.selecionarLotePorIndice(1);
    const depoisResumo = await p.getResumoRespostas();
    const depoisRows = await p.getRowCount();
    // ao menos um dos dois muda (lotes têm públicos diferentes)
    expect(depoisResumo !== antesResumo || depoisRows !== antesRows).toBeTruthy();
  });

  test('AD06 — botão "Exportar" deve gerar o download do relatório', async ({ page }) => {
    const p = new AdesaoPage(page);
    await expect(p.exportarButton).toBeVisible();
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 10000 }),
      p.exportarButton.click(),
    ]);
    // arquivo de relatório de adesão (hoje é .csv compatível com Excel)
    expect(download.suggestedFilename()).toMatch(/Relatorio_Adesao.*\.(csv|xlsx)$/i);
  });
});
