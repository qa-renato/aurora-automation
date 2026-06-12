import { test, expect } from '../../fixtures/test-fixtures';
import { AuditoriaPage } from '../../pages/AuditoriaPage';
import { takeEvidenceScreenshot } from '../../utils/screenshots';

// Módulo Auditoria do Sistema (/auditoria) — leitura.
// Tabela de log de eventos + busca. A estrutura renderiza normalmente; o que
// está quebrado (BUG #688) é a CONSULTA dos dados: a API responde 403 e a tela
// fica presa em skeleton, sem nunca exibir registros. Guards via test.fail.

test.describe('Auditoria do Sistema', () => {
  // Instância compartilhada: navigate() captura os status de `GET /auditoria`,
  // que AU05 inspeciona — por isso o mesmo objeto é reusado em cada teste.
  let p: AuditoriaPage;

  test.beforeEach(async ({ page }) => {
    p = new AuditoriaPage(page);
    await p.navigate();
  });

  test('AU01 — deve carregar a rota com título "Auditoria do Sistema"', async ({ page }) => {
    await expect(p.titulo).toBeVisible();
    await takeEvidenceScreenshot(page, test.info(), 'auditoria');
  });

  test('AU02 — tabela deve ter as colunas Data e Hora, Usuário, Ação, Recurso e Decisão', async () => {
    for (const col of ['Data e Hora', 'Usuário', 'Ação', 'Recurso', 'Decisão']) {
      await expect(p.colunaHeader(col)).toBeVisible();
    }
  });

  test('AU03 — deve exibir o campo de busca por usuário/ação/recurso', async () => {
    await expect(p.buscaInput).toBeVisible();
    // o campo aceita digitação (não trava a UI)
    await p.buscar('renato');
    await expect(p.buscaInput).toHaveValue('renato');
  });

  // BUG #688 — a tela de auditoria deveria CONSULTAR e LISTAR os eventos do
  // sistema. Hoje a API `GET /auditoria` responde 403 e nenhum registro é
  // exibido (a tabela fica só com linhas de skeleton vazias). Este teste afirma
  // o comportamento CORRETO (ao menos um registro listado) — falha enquanto o
  // bug existir.
  test.fail('AU04 — deveria listar ao menos um registro de auditoria [BUG #688]', async () => {
    expect(await p.getDataRowCount()).toBeGreaterThan(0);
  });

  // BUG #688 (raiz) — a API de auditoria deveria responder com sucesso. Hoje
  // todas as chamadas `GET /auditoria` retornam 403 (Forbidden) NESTA sessão,
  // embora `GET /me` retorne 200 na mesma sessão (logo NÃO é o falso-negativo de
  // refresh de token). Este teste afirma o comportamento CORRETO (status < 400)
  // — falha enquanto a API recusar a consulta.
  test.fail('AU05 — a API GET /auditoria deveria responder com sucesso, não 403 [BUG #688]', async () => {
    const statuses = p.getAuditoriaStatuses();
    expect(statuses.length, 'frontend deve chamar a API de auditoria').toBeGreaterThan(0);
    expect(statuses.every((s) => s < 400), `status capturados: ${statuses.join(', ')}`).toBeTruthy();
  });
});
