import { test, expect } from '../../fixtures/test-fixtures';
import { ColaboradoresPage } from '../../pages/ColaboradoresPage';
import { novoColaboradorValido } from '../../test-data/colaboradores';
import { takeEvidenceScreenshot } from '../../utils/screenshots';

// Validações do formulário de cadastro — todas confirmadas existindo na app.
// CT40-42 NÃO criam registro (a submissão é bloqueada).

test.describe('Colaboradores — Validações de Cadastro', () => {

  test.beforeEach(async ({ page }) => {
    await new ColaboradoresPage(page).navigate();
  });

  test('CT40 — e-mail inválido deve exibir "E-mail inválido" e bloquear', async ({ page }) => {
    const p = new ColaboradoresPage(page);
    await p.abrirDialogAdicionar();
    await p.selecionarCadastroManual();
    await p.preencherFormulario({ ...novoColaboradorValido(), email: 'email-invalido-sem-arroba' });
    await p.salvar();
    await expect(page.getByText('E-mail inválido')).toBeVisible();
    expect(await p.isDialogAberto()).toBe(true);
    await takeEvidenceScreenshot(page, test.info(), 'validacao-email-invalido');
    await p.fecharDialog();
  });

  test('CT41 — data de nascimento futura deve ser bloqueada', async ({ page }) => {
    const p = new ColaboradoresPage(page);
    await p.abrirDialogAdicionar();
    await p.selecionarCadastroManual();
    await p.preencherFormulario({ ...novoColaboradorValido(), dataNascimento: '01/01/2090' });
    await p.salvar();
    await expect(page.getByText('Data de nascimento não pode ser futura')).toBeVisible();
    expect(await p.isDialogAberto()).toBe(true);
    await takeEvidenceScreenshot(page, test.info(), 'validacao-data-futura');
    await p.fecharDialog();
  });

  test('CT42 — CPF incompleto deve exibir "CPF inválido" e bloquear', async ({ page }) => {
    const p = new ColaboradoresPage(page);
    await p.abrirDialogAdicionar();
    await p.selecionarCadastroManual();
    await p.preencherFormulario({ ...novoColaboradorValido(), cpf: '123' });
    await p.salvar();
    await expect(page.getByText('CPF inválido')).toBeVisible();
    expect(await p.isDialogAberto()).toBe(true);
    await takeEvidenceScreenshot(page, test.info(), 'validacao-cpf-incompleto');
    await p.fecharDialog();
  });

  // BUG CONHECIDO: a aplicação valida apenas o FORMATO do CPF (11 dígitos), mas
  // NÃO o dígito verificador. Um CPF como 363.044.490-00 (formato ok, checksum
  // inválido) é aceito e salvo. Este teste afirma o comportamento CORRETO
  // (deveria bloquear) e está marcado test.fail — quando o bug for corrigido,
  // o Playwright acusará "expected to fail but passed" e o marcador deve sair.
  test('CT43 — CPF com dígito verificador inválido deveria ser rejeitado [BUG]', async ({ page }) => {
    test.fail(true, 'BUG: app aceita CPF com checksum inválido (valida só o formato de 11 dígitos).');
    const p = new ColaboradoresPage(page);
    // novoColaboradorValido() gera CPF terminado em "-00" — checksum quase sempre inválido.
    const dados = novoColaboradorValido();
    await p.cadastrarColaborador(dados);
    await expect(page.getByText('CPF inválido')).toBeVisible();
    expect(await p.isDialogAberto()).toBe(true);
  });

});
