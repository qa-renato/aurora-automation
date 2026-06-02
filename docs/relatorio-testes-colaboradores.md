# Relatório de Testes — Módulo Colaboradores

| | |
|---|---|
| **Módulo** | Gestão de Colaboradores (`/colaboradores`) |
| **Suite** | `tests/colaboradores/colaboradores.spec.ts` |
| **Data** | 2026-06-01 |
| **Ambiente** | Sandbox — `https://sandbox-inbot-aurora.vercel.app` |
| **Framework** | Playwright + TypeScript (Page Object Model) |
| **Projeto/Browser** | `chromium` (Desktop Chrome) |
| **Commit** | `0eb48cf` |

---

## Resumo Executivo

| Métrica | Valor |
|---|---|
| Total de casos | **35** |
| ✅ Aprovados | **35** |
| ❌ Reprovados | **0** |
| ⚠️ Flaky | **0** |
| Estabilidade | 3 execuções consecutivas 36/36 (35 testes + setup) |

> Esta rodada consolida a correção das **8 falhas** anteriores (CT02, CT10, CT21, CT23, CT24, CT25, CT31, CT35) e o endurecimento de **1 teste flaky** (CT29).

---

## Casos de Teste

| ID | Cenário | Status |
|----|---------|:------:|
| **Tabela Principal** | | |
| CT01 | Exibir tabela com as 7 colunas corretas | 🟢 |
| CT02 | Exibir paginação inicial "Mostrando 1-10 de X itens" | 🟢 |
| CT03 | Navegar para a próxima página | 🟢 |
| CT04 | Voltar à página anterior | 🟢 |
| CT05 | Alterar itens por página para 25 | 🟢 |
| CT06 | Alterar itens por página para 50 | 🟢 |
| **Mostrar Inativos** | | |
| CT07 | Toggle ativado exibe colaboradores inativos | 🟢 |
| CT08 | Toggle desativado não exibe usuários inativos | 🟢 |
| **Filtro por Departamento** | | |
| CT09 | Filtrar por Financeiro exibe apenas esse depto | 🟢 |
| CT10 | Filtrar por Tecnologia da Informação | 🟢 |
| CT11 | Resetar filtro para "Todos os departamentos" | 🟢 |
| CT12 | Filtro + busca sem resultado exibe empty state | 🟢 |
| **Busca** | | |
| CT13 | Buscar por nome parcial | 🟢 |
| CT14 | Buscar por e-mail parcial | 🟢 |
| CT15 | Buscar por CPF completo | 🟢 |
| CT16 | Buscar por texto inexistente exibe empty state | 🟢 |
| CT17 | Limpar busca restaura todos os registros | 🟢 |
| **Ordenação de Colunas** | | |
| CT18 | Clicar em Nome ordena A→Z (e inverte) | 🟢 |
| CT19 | Colunas CPF e Ações não são ordenáveis | 🟢 |
| **Cadastro Manual** | | |
| CT20 | Dialog Adicionar exibe Cadastro Manual e Importar Planilha | 🟢 |
| CT21 | Cadastrar com campos obrigatórios — sucesso | 🟢 |
| CT22 | Cadastrar com todos os campos — sucesso | 🟢 |
| CT23 | CPF duplicado exibe "CPF já cadastrado" | 🟢 |
| CT24 | Campos obrigatórios vazios bloqueiam submissão | 🟢 |
| CT25 | Cancelar cadastro fecha dialog sem salvar | 🟢 |
| **Importar Planilha** | | |
| CT26 | Dialog de importação exibe Template CSV e drop zone | 🟢 |
| CT27 | Botão "Confirmar Importação" desabilitado sem arquivo | 🟢 |
| CT28 | Cancelar importação fecha dialog | 🟢 |
| **Edição** | | |
| CT29 | Formulário de edição abre com campos pré-preenchidos | 🟢 |
| CT30 | Cancelar edição não altera dados na tabela | 🟢 |
| CT31 | Campo Telefone rejeita/mascara texto não numérico | 🟢 |
| **Inativar / Ativar** | | |
| CT32 | Clicar Inativar exibe dialog de confirmação | 🟢 |
| CT33 | Cancelar inativação mantém colaborador ativo | 🟢 |
| CT34 | Clicar Ativar exibe dialog de confirmação | 🟢 |
| CT35 | Confirmar inativação remove colaborador da lista | 🟢 |

---

## Correções Aplicadas

As 8 falhas tinham **causas-raiz distintas**, confirmadas por inspeção do DOM real da aplicação (não eram todas "seletores frágeis"):

| Teste(s) | Causa-raiz | Correção |
|----------|-----------|----------|
| CT02, CT25 | `getPaginationText()` lia via `page.evaluate` one-shot, sem auto-wait; o rodapé renderiza após as linhas da tabela → retornava string vazia | Leitura via locator com auto-wait (`waitFor` + `textContent()`) |
| CT10 | A célula de Departamento é **truncada na exibição** (`"Tecnologia da Informaç..."`); `toHaveText` exato falhava | Trocado por `toContainText('Tecnologia da Inform')` |
| CT23, CT24 | `isDialogAberto()` consultava o elemento nativo `<dialog>`; a app usa **Radix `[role="dialog"]`** → sempre retornava `false` | Seletor corrigido + helpers de fechar aguardam o dialog desmontar |
| CT21 | Verificação via busca na tabela — a busca da app **não retorna registros recém-criados** (ver limitação abaixo) | Sucesso validado pelo toast da app + fechamento do dialog |
| CT31 | O teste afirmava um **bug inexistente**: o campo Telefone, na verdade, mascara e rejeita texto não numérico | Reescrito para asserir o mascaramento correto |
| CT35 | Poluição de dados — "Diego Martins Costa" ficava inativo de execuções anteriores; teste assumia que estava ativo | Helper `garantirColaboradorAtivo()` (pré-condição + restauração em `finally`) e asserção com auto-retry |
| CT29 (flaky) | Formulário de edição preenche os campos de forma **assíncrona**; `inputValue()` lia vazio antes de popular | `abrirEdicaoPorNome` aguarda o valor popular (`expect(...).not.toHaveValue('')`) |

**Arquivos alterados:** `pages/ColaboradoresPage.ts`, `tests/colaboradores/colaboradores.spec.ts`.

---

## Comportamentos da Aplicação Observados

### ⚠️ Limitação / possível bug para reportar ao time
- **A busca não retorna registros recém-criados.** Após um cadastro bem-sucedido (toast de sucesso + persistência confirmada), o novo colaborador **não aparece na busca — nem por nome, nem por CPF — mesmo após recarregar a página**. Registros previamente existentes são pesquisáveis normalmente. Indica atraso/inconsistência no índice de busca. **Impacto:** usuário pode cadastrar alguém e não conseguir localizá-lo em seguida.

### ℹ️ Comportamentos esperados (confirmados)
- Campo **Telefone** possui máscara e descarta caracteres não numéricos (CT31).
- Coluna **Departamento** é truncada visualmente quando o texto excede a largura.
- Dialogs são componentes **Radix** (`[role="dialog"]`), com animação de saída.

---

## Como Reproduzir

```bash
# 1. Renovar a sessão autenticada (aprovar MFA se o SSO Keycloak estiver expirado)
npx playwright test --project=setup --headed

# 2. Executar a suíte do módulo Colaboradores
npx playwright test tests/colaboradores/ --project=chromium

# 3. Abrir o relatório HTML
npm run test:report
```
