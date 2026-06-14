import { readFileSync } from 'node:fs';
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
    const totalLotes = (await p.getOpcoesLote()).length;

    // Lotes distintos podem compartilhar o mesmo público (ex.: dois lotes "0 de 1"),
    // então não basta pular para o índice seguinte. Procuramos QUALQUER outro lote
    // cujo resumo OU contagem de linhas difira do inicial — provando que a tela
    // reage à troca de lote (se NENHUM diferir, é falha real).
    let mudou = false;
    for (let i = 1; i < totalLotes && !mudou; i++) {
      await p.selecionarLotePorIndice(i);
      const depoisResumo = await p.getResumoRespostas();
      const depoisRows = await p.getRowCount();
      mudou = depoisResumo !== antesResumo || depoisRows !== antesRows;
    }
    expect(mudou, 'trocar de lote deve atualizar resumo e/ou tabela em ao menos um lote').toBeTruthy();
  });

  test('AD06 — "Exportar Excel" gera o download e o CSV reflete a tela', async ({ page }) => {
    const p = new AdesaoPage(page);
    await expect(p.exportarButton).toBeVisible();
    const rowsTela = await p.getRowCount();
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 10000 }),
      p.exportarButton.click(),
    ]);
    // arquivo de relatório de adesão (hoje é .csv compatível com Excel; BOM + separador ";")
    expect(download.suggestedFilename()).toMatch(/Relatorio_Adesao.*\.(csv|xlsx)$/i);

    // conteúdo: cabeçalho com as colunas da tela (Colaborador/Status) e uma
    // linha de dados por colaborador da tabela do lote selecionado.
    const conteudo = readFileSync(await download.path(), 'utf8').replace(/^﻿/, '');
    const linhas = conteudo.split(/\r?\n/).filter((l) => l.trim() !== '');
    const header = linhas[0].toLowerCase();
    expect(header, 'cabeçalho do CSV deve ter as colunas da tela').toContain('colaborador');
    expect(header).toContain('status');
    expect(linhas.length - 1, 'linhas de dados do CSV devem bater com a tabela').toBe(rowsTela);
  });

  // BUG #502 — a tabela "Acompanhamento por Colaborador" não tem seletor de
  // itens por página (ao contrário de /colaboradores). Afirma o CORRETO (deve
  // existir o controle) → falha enquanto ausente. (#503 — paginação — é correlato
  // e só aparece com muitos registros, por isso não é guardado isoladamente.)
  test.fail('AD07 — tabela de acompanhamento deveria ter seletor de itens por página [BUG #502]', async ({ page }) => {
    const temSeletor = await page.evaluate(() =>
      [...document.querySelectorAll('button, select, [role="combobox"]')].some((e) =>
        /itens por página|por página/i.test((e as HTMLElement).innerText || e.getAttribute('aria-label') || ''),
      ),
    );
    expect(temSeletor, 'deve haver seletor de itens por página').toBeTruthy();
  });
});
