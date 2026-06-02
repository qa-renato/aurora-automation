import { test, expect } from '../../fixtures/test-fixtures';
import { ColaboradoresPage } from '../../pages/ColaboradoresPage';
import { takeEvidenceScreenshot } from '../../utils/screenshots';

// Edição COM salvar/persistência — os CTs originais (CT29-31) só abrem/cancelam.
// Usa colaboradores cujo depto+cargo constam nas opções do formulário (registros
// "limpos" que salvam de fato — vários seeds têm cargo legado fora da lista e a
// app bloqueia o save). Cada teste restaura o valor original no finally.

test.describe('Colaboradores — Edição (salvar e persistir)', () => {

  test.beforeEach(async ({ page }) => {
    await new ColaboradoresPage(page).navigate();
  });

  test('CT36 — editar Nome e salvar deve persistir na tabela', async ({ page }) => {
    const p = new ColaboradoresPage(page);
    const NOME = 'Lucas Fernandes Gomes';
    let original = '';
    try {
      await p.buscar(NOME);
      await p.abrirEdicaoPorNome(NOME);
      original = await p.nomeInput.inputValue();
      const novo = `${NOME} EDITADO`;
      await p.nomeInput.fill(novo);
      await p.salvar();
      await p.validarEdicaoSucesso();
      // a busca pelo prefixo (inalterado) continua casando o registro renomeado
      await p.buscar(NOME);
      await expect(page.locator('tbody td').filter({ hasText: novo })).toBeVisible();
      await takeEvidenceScreenshot(page, test.info(), 'edicao-nome-persistida');
    } finally {
      if (original) {
        await p.buscar(NOME);
        await p.abrirEdicaoPorNome(NOME).catch(() => {});
        await p.nomeInput.fill(original);
        await p.salvar();
        await p.validarEdicaoSucesso().catch(() => {});
      }
    }
  });

  test('CT37 — editar E-mail e salvar deve persistir', async ({ page }) => {
    const p = new ColaboradoresPage(page);
    const NOME = 'João Victor Ribeiro';
    let original = '';
    try {
      await p.buscar(NOME);
      await p.abrirEdicaoPorNome(NOME);
      original = await p.emailInput.inputValue();
      const novo = original.replace('@', '.edit@');
      await p.emailInput.fill(novo);
      await p.salvar();
      await p.validarEdicaoSucesso();
      await p.buscar(NOME);
      await p.abrirEdicaoPorNome(NOME);
      await expect(p.emailInput).toHaveValue(novo);
      await p.fecharDialog();
    } finally {
      if (original) {
        await p.buscar(NOME);
        await p.abrirEdicaoPorNome(NOME).catch(() => {});
        await p.emailInput.fill(original);
        await p.salvar();
        await p.validarEdicaoSucesso().catch(() => {});
      }
    }
  });

  test('CT38 — editar campo opcional (Telefone) e salvar deve persistir', async ({ page }) => {
    const p = new ColaboradoresPage(page);
    const NOME = 'Bruno Henrique Souza';
    const NOVO = '(11) 91234-5678';
    let original = '';
    let abriu = false;
    try {
      await p.buscar(NOME);
      await p.abrirEdicaoPorNome(NOME);
      original = await p.telefoneInput.inputValue();
      abriu = true;
      await p.telefoneInput.fill(NOVO);
      await p.salvar();
      await p.validarEdicaoSucesso();
      await p.buscar(NOME);
      await p.abrirEdicaoPorNome(NOME);
      await expect(p.telefoneInput).toHaveValue(NOVO);
      await takeEvidenceScreenshot(page, test.info(), 'edicao-telefone-persistida');
      await p.fecharDialog();
    } finally {
      if (abriu) {
        await p.buscar(NOME);
        await p.abrirEdicaoPorNome(NOME).catch(() => {});
        await p.telefoneInput.fill(original);
        await p.salvar();
        await p.validarEdicaoSucesso().catch(() => {});
      }
    }
  });

  test('CT39 — CPF é editável na edição e a alteração persiste', async ({ page }) => {
    const p = new ColaboradoresPage(page);
    const NOME = 'Felipe Rocha Alves';
    const ORIGINAL = '678.901.234-55';
    const NOVO = '678.901.234-56';
    try {
      await p.buscar(NOME);
      await p.abrirEdicaoPorNome(NOME);
      // confirma que o campo CPF NÃO é somente-leitura na edição
      await expect(p.cpfInput).toBeEditable();
      await p.cpfInput.fill(NOVO);
      await p.salvar();
      await p.validarEdicaoSucesso();
      await p.buscar(NOME);
      await p.abrirEdicaoPorNome(NOME);
      await expect(p.cpfInput).toHaveValue(NOVO);
      await takeEvidenceScreenshot(page, test.info(), 'edicao-cpf-editavel');
      await p.fecharDialog();
    } finally {
      await p.buscar(NOME);
      await p.abrirEdicaoPorNome(NOME).catch(() => {});
      await p.cpfInput.fill(ORIGINAL);
      await p.salvar();
      await p.validarEdicaoSucesso().catch(() => {});
    }
  });

});
