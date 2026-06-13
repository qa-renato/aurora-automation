import { test, expect } from '../../fixtures/test-fixtures';
import { ConfiguracoesPage } from '../../pages/ConfiguracoesPage';
import { takeEvidenceScreenshot } from '../../utils/screenshots';

// Módulo Configurações (/configuracoes) — leitura.
// Informações do Bot, Integração de Colaboradores, Personalizar Interface,
// Tabelas de Dados e Campos de Colaborador. Apenas leitura (não persiste).

test.describe('Configurações', () => {
  let p: ConfiguracoesPage;

  test.beforeEach(async ({ page }) => {
    p = new ConfiguracoesPage(page);
    await p.navigate();
  });

  test('CF01 — deve carregar "Configurações Visuais e de Sistema"', async ({ page }) => {
    await expect(p.titulo).toBeVisible();
    await takeEvidenceScreenshot(page, test.info(), 'configuracoes');
  });

  test('CF02 — deve exibir as seções principais', async () => {
    await expect(p.secaoHeading(/Informações do Bot/i)).toBeVisible();
    await expect(p.secaoHeading(/Integração de Colaboradores/i)).toBeVisible();
    await expect(p.secaoHeading(/Personalizar Interface/i)).toBeVisible();
    await expect(p.secaoHeading(/Tabelas de Dados/i)).toBeVisible();
    await expect(p.secaoHeading(/Campos de Colaborador/i)).toBeVisible();
  });

  test('CF03 — Tabelas de Dados: colunas Nome/Existe/Ativa/Registros/Última Atualização', async () => {
    for (const col of ['NOME', 'EXISTE', 'ATIVA', 'REGISTROS', 'ÚLTIMA ATUALIZAÇÃO']) {
      await expect(p.colunaHeader(col)).toBeVisible();
    }
    expect(await p.getTableRowCount()).toBeGreaterThan(0);
  });

  test('CF04 — Informações do Bot exibe BOTID e a INTABLE API KEY mascarada', async () => {
    const txt = await p.bodyText();
    expect(txt).toMatch(/BOTID ASSOCIADO/i);
    expect(txt).toMatch(/INTABLE API KEY/i);
    expect(txt).toContain('••');
  });

  test('CF05 — Campos de Colaborador: inputs de novo departamento e novo cargo', async () => {
    await expect(p.inputPorPlaceholder(/Novo departamento/i)).toBeVisible();
    await expect(p.inputPorPlaceholder(/Novo cargo/i)).toBeVisible();
    await expect(p.botao(/Adicionar departamento/i)).toBeVisible();
  });

  test('CF06 — Campos de Colaborador exibe chips "em uso por N colaboradores"', async ({ page }) => {
    // os chips carregam de forma assíncrona (GET /configuracoes/campos/uso) e o
    // texto "em uso por N colaboradores" é o aria-label do botão (innerText
    // vazio) → localizar por accessible name
    const chip = page.getByRole('button', { name: /em uso por \d+ colaboradores?/i }).first();
    await chip.scrollIntoViewIfNeeded().catch(() => {});
    await expect(chip).toBeVisible();
  });

  test('CF07 — deve consultar a API de configurações com sucesso (200)', async () => {
    expect(p.getApiStatus()).toBe(200);
  });
});
