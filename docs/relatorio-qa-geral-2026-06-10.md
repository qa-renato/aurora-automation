# Relatório de QA — Aurora | Testes Funcionais Automatizados (E2E)

- **Data:** 10/06/2026
- **Rotinas testadas:** `/colaboradores` · `/casos-graves` · `/metricas-ia` · `/auditoria` · `/adesao` · `/pedidos` · `/configuracoes` · home
- **Ambiente:** Homologação (sandbox — `sandbox-inbot-aurora.vercel.app`)
- **Responsável:** Renato Paulino
- **Ferramenta:** Playwright + TypeScript (POM). Evidências coletadas via inspeção do DOM real e captura de chamadas de API com sessão autenticada.

## Resumo

Varredura automatizada das 8 rotas do sistema. Todas carregam (**HTTP 200**, sem erro de JavaScript/console, sem requisição falhando). Foram identificados **13 bugs** distribuídos em **5 áreas**, sendo **2 de severidade alta**.

| Área | Bugs |
|------|------|
| /colaboradores | BUG-01…07, BUG-09 (8) |
| /casos-graves | BUG-10, BUG-11 (2) |
| /metricas-ia | BUG-13 (1) |
| /auditoria | BUG-14 (1) |
| Responsividade (transversal) | BUG-12 (1) |

> O antigo BUG-08 (overflow mobile em /colaboradores) foi consolidado no BUG-12, por ser o mesmo defeito em 3 tabelas.

---

## 🧭 Rotina: /colaboradores — Gestão de Colaboradores (8 bugs)

### BUG-01 — 🔴 Alta — CPF aceito com dígito verificador inválido (CT43)
Valida só o **formato** (11 dígitos), não o dígito verificador. `363.044.490-00` salvou com sucesso.
**Esperado:** bloquear com "CPF inválido".

### BUG-02 — 🔴 Alta — Colaborador recém-criado não aparece na busca (CT21)
Após cadastro bem-sucedido, o registro **não retorna** na busca (nome, CPF) **nem após recarregar**. Registros antigos funcionam → inconsistência no índice de busca.
**Esperado:** registro encontrável imediatamente.

### BUG-03 — 🟠 Média/Alta — Edição bloqueada por Cargo/Departamento legado fora das opções (CT36–38)
Registros com cargo/depto não listados no `<select>` carregam "Selecione..." e o save dispara **"obrigatório"** — impede qualquer edição.
**Esperado:** carregar o valor atual do registro ou permitir manter o existente.

### BUG-04 — 🟠 Média — Falha silenciosa ao salvar edição válida (CT36)
Gabriela Torres Pereira (todos os campos válidos): o save **não conclui e não exibe erro** — o dialog só fica aberto.
**Esperado:** salvar com sucesso ou exibir erro claro.

### BUG-05 — 🟡 Média — Busca não retorna à primeira página (CT55)
Buscar estando na página 2 **mantém o offset** (`Mostrando 11-20`) em vez de voltar à página 1.
**Esperado:** resetar para a página 1 ao mudar o termo.

### BUG-06 — 🟡 Baixa — Busca não faz trim de espaços (CT56)
`"  Bruno  "` retorna "Nenhum colaborador encontrado.".
**Esperado:** aplicar `.trim()` ao termo.

### BUG-07 — 🟡 Baixa — Tecla Esc não fecha os dialogs (CT67)
Com um campo focado, **Esc não fecha** o modal (só o botão X funciona).
**Esperado:** Esc fecha o modal (padrão de acessibilidade).

### BUG-09 — 🟡 Média — Erro genérico e enganoso ao salvar CPF inválido (`111.111.111-11`)
O sistema **bloqueia** o cadastro, mas o único feedback é o toast genérico **"Não foi possível salvar o colaborador. Tente novamente."** — sem validação inline e sem informar que o CPF é inválido; o "tente novamente" é enganoso (erro não é transitório). Agrava a inconsistência com o BUG-01.
**Esperado:** mensagem clara "CPF inválido" junto ao campo.

---

## 🧭 Rotina: /casos-graves — Casos Graves (2 bugs)

### BUG-10 — 🟡 Média — Comentário da tratativa sem limite de caracteres e sem quebra de palavra
O campo de comentário **não tem `maxlength`** e o comentário renderizado no histórico **não quebra palavras longas** (`overflow-wrap: normal`). Um comentário longo **sem espaços** transborda o cartão (medido: **15.052px** de conteúdo num container de **463px**) e é cortado na borda do painel, ficando ilegível.
**Esperado:** aplicar `overflow-wrap: break-word` no comentário **e** definir um `maxlength` no campo.

### BUG-11 — 🟡 Média — Rótulos dos KPIs vazam para fora do card (painel "Gerenciar Casos")
Em larguras intermediárias (**~768–960px**), os 5 cards de KPI ficam estreitos e, como o rótulo usa **`overflow: visible`**, o texto **transborda para fora do card** (medido: caixa de 11–50px contra texto de 96px em "CASOS GRAVES IDENTIFICADOS"). No desktop (1280px) não ocorre — é responsivo.
**Esperado:** quebra de linha/redução de fonte para o rótulo caber no card.

---

## 🧭 Rotina: /metricas-ia — Métricas da IA (1 bug)

### BUG-13 — 🟡 Média — Indicadores de variação (%) são estáticos e não refletem os dados
A API (`GET /screens/metricas-ia?periodo=N`) retorna KPIs reais que mudam por período (interações: **0** / 7 / 15), mas os badges **`+12% neste período`** e **`+8% enviaram ao menos 1 mensagem`** são **fixos** — não mudam com o período nem com o dado. Com base **0**, ainda exibem "+12%", o que é impossível.
**Esperado:** calcular o delta real vs. o período anterior, ou ocultar quando não houver dado.

---

## 🧭 Rotina: /auditoria — Auditoria (1 bug)

### BUG-14 — 🟠 Média — Tela de Auditoria não consulta nem exibe registros
A rota **não faz nenhuma requisição de dados de auditoria** ao carregar (capturadas apenas `/me`, `/configuracoes`, `/screens/casos-graves`) e exibe **"Nenhum registro encontrado."** de forma incondicional (a busca também retorna vazio). As ações realizadas no sistema (cadastros, **edições de colaborador**, tratativas) não aparecem, embora devam ser registradas.
**Esperado:** a tela consultar o log de auditoria e listar os eventos.
*(Observação black-box: não distingue "frontend não chama" de "endpoint inexistente"; o efeito para o usuário é o mesmo.)*

---

## 🧭 Transversal — Responsividade (mobile 375px) (1 bug)

### BUG-12 — 🟡 Média — Tabelas cortam colunas no mobile *(consolida o antigo BUG-08)*
Em **/colaboradores, /pedidos e /configuracoes**, as tabelas são mais largas que a viewport; a partir da coluna E-mail o conteúdo é **cortado** e as colunas seguintes (Departamento, Cargo, Status, Ações) ficam **inacessíveis**, sem scroll horizontal claro.
**Esperado:** container com scroll horizontal ou layout responsivo (cards) no mobile.

---

## Status geral

🔴 **Bloqueado para aprovação** — 2 bugs de severidade alta (BUG-01 integridade de CPF, BUG-02 busca de novos registros) somados à falha de auditoria (BUG-14). Recomenda-se correção antes de liberar.

### Nota de cobertura de automação
As 8 rotas estão acessíveis e estáveis para testes de **leitura/navegação**. Cenários de **escrita** (edição de colaborador, tratativa de caso grave) são bloqueados de forma intermitente na sessão automatizada pelo refresh de token/CORS do Keycloak — correção do lado da plataforma destrava a automação completa.
