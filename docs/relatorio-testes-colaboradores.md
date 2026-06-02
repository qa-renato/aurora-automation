# Relatório de Testes — Módulo Colaboradores

| | |
|---|---|
| **Módulo** | Gestão de Colaboradores (`/colaboradores`) |
| **Suite** | `tests/colaboradores/` (8 arquivos `.spec.ts`) |
| **Data** | 2026-06-01 |
| **Ambiente** | Sandbox — `https://sandbox-inbot-aurora.vercel.app` |
| **Framework** | Playwright + TypeScript (Page Object Model) |
| **Browser** | `chromium` (Desktop Chrome) |
| **Total de casos** | **70** (CT01–CT70) |

---

## 1. Resumo Executivo

| Métrica | Valor |
|---|---|
| Casos de teste | **70** |
| ✅ Funcionando conforme esperado | **64** |
| 🔴 Bugs / limitações confirmados | **6** |
| Cobertura | tabela, paginação, busca, filtros, ordenação, cadastro, validações, importação (upload), edição, inativar/ativar, acessibilidade, responsividade, segurança (XSS) |

> **Observação de execução:** cada caso passa de forma isolada. A suíte completa é determinística em **modo serial** (`--workers=1`, como em CI). O sandbox apresenta lentidão/instabilidade ocasional (timeouts variáveis no carregamento da tabela), mitigada por `retries`. O `timeout` de teste foi elevado para 90s porque a carga do SPA (Keycloak SSO + polling de API) excede o padrão de 30s.

### Panorama dos bugs (detalhes na seção 3)

| ID | Severidade sugerida | Título curto | Área |
|----|--------------------|--------------|------|
| **BUG-01** | 🔴 Alta | CPF aceito com dígito verificador inválido | Cadastro |
| **BUG-02** | 🔴 Alta | Registros recém-criados não aparecem na busca | Cadastro/Busca |
| **BUG-03** | 🟠 Alta | Edição bloqueada por cargo/depto legado fora das opções | Edição |
| **BUG-04** | 🟠 Média | Falha silenciosa ao salvar edição (sem mensagem) | Edição |
| **BUG-05** | 🟡 Média | Busca não retorna à página 1 | Busca/Paginação |
| **BUG-06** | 🟡 Baixa | Busca não remove espaços nas pontas (sem trim) | Busca |
| **BUG-07** | 🟡 Baixa | Tecla Esc não fecha os dialogs | UX/Dialog |
| **BUG-08** | 🟡 Baixa | Overflow horizontal no mobile (375px) | Responsividade |

---

## 2. Cobertura por Área (o que deu certo × o que deu bug)

### 2.1 Tabela Principal & Paginação
| CT | Cenário | Status |
|----|---------|:------:|
| CT01 | Tabela com as 7 colunas corretas | ✅ |
| CT02 | Paginação inicial "Mostrando 1-10 de X itens" | ✅ |
| CT03 | Navegar para a próxima página | ✅ |
| CT04 | Voltar à página anterior | ✅ |
| CT05 | Alterar itens por página para 25 | ✅ |
| CT06 | Alterar itens por página para 50 | ✅ |
| CT60 | "Próxima" desabilitada na última página | ✅ |
| CT61 | Última página exibe o intervalo final correto | ✅ |
| CT62 | Alterar itens por página volta à página 1 | ✅ |

### 2.2 Mostrar Inativos & Status
| CT | Cenário | Status |
|----|---------|:------:|
| CT07 | Toggle exibe colaboradores inativos | ✅ |
| CT08 | Toggle off oculta inativos | ✅ |
| CT63 | Coluna Status reflete ativo (verde) / inativo | ✅ |
| CT65 | Toggle "Mostrar Inativos" persiste ao buscar | ✅ |

### 2.3 Filtro por Departamento
| CT | Cenário | Status |
|----|---------|:------:|
| CT09 | Filtrar por Financeiro | ✅ |
| CT10 | Filtrar por Tecnologia da Informação | ✅ |
| CT11 | Resetar filtro para "Todos os departamentos" | ✅ |
| CT12 | Filtro + busca sem resultado (empty state) | ✅ |
| CT57 | Filtro + ordenação coexistem | ✅ |
| CT58 | Filtro + "Mostrar Inativos" coexistem | ✅ |
| CT59 | Filtro mantido ao paginar | ✅ |

### 2.4 Busca
| CT | Cenário | Status |
|----|---------|:------:|
| CT13 | Buscar por nome parcial | ✅ |
| CT14 | Buscar por e-mail parcial | ✅ |
| CT15 | Buscar por CPF completo | ✅ |
| CT16 | Texto inexistente → empty state | ✅ |
| CT17 | Limpar busca restaura registros | ✅ |
| CT53 | Busca case-insensitive | ✅ |
| CT54 | Busca ignora acentuação | ✅ |
| CT55 | Busca deveria voltar à página 1 | 🔴 **BUG-05** |
| CT56 | Busca deveria fazer trim de espaços | 🔴 **BUG-06** |

### 2.5 Ordenação de Colunas
| CT | Cenário | Status |
|----|---------|:------:|
| CT18 | Ordenar por Nome (A→Z) | ✅ |
| CT19 | CPF e Ações não são ordenáveis | ✅ |
| CT48 | Ordenar por E-mail (asc/desc) | ✅ |
| CT49 | Ordenar por Departamento (asc/desc) | ✅ |
| CT50 | Ordenar por Cargo (asc/desc) | ✅ |
| CT51 | Ordenar por Status (agrupa ativos/inativos) | ✅ |
| CT52 | Cabeçalho alterna asc → desc (aria-sort) | ✅ |

### 2.6 Cadastro Manual
| CT | Cenário | Status |
|----|---------|:------:|
| CT20 | Dialog Adicionar exibe Cadastro Manual / Importar | ✅ |
| CT21 | Cadastrar com campos obrigatórios — sucesso | ✅ |
| CT22 | Cadastrar com todos os campos — sucesso | ✅ |
| CT23 | CPF duplicado exibe "CPF já cadastrado" | ✅ |
| CT24 | Campos obrigatórios vazios bloqueiam submissão | ✅ |
| CT25 | Cancelar cadastro fecha dialog sem salvar | ✅ |
| CT40 | E-mail inválido exibe "E-mail inválido" | ✅ |
| CT41 | Data de nascimento futura é bloqueada | ✅ |
| CT42 | CPF incompleto exibe "CPF inválido" | ✅ |
| CT43 | CPF com dígito verificador inválido deveria ser bloqueado | 🔴 **BUG-01** |
| CT66 | Telefone com número válido é mascarado | ✅ |
| CT67 | Dialogs fecham pelo botão X | ✅ (Esc → 🔴 **BUG-07**) |
| — | Persistência via busca após criar | 🔴 **BUG-02** |

### 2.7 Importação de Planilha (Upload)
| CT | Cenário | Status |
|----|---------|:------:|
| CT26 | Dialog exibe Template CSV e drop zone | ✅ |
| CT27 | "Confirmar Importação" desabilitado sem arquivo | ✅ |
| CT28 | Cancelar importação fecha dialog | ✅ |
| CT44 | Importar CSV válido conclui com sucesso | ✅ |
| CT45 | Arquivo não-CSV é rejeitado | ✅ |
| CT46 | CSV com campos obrigatórios vazios é bloqueado | ✅ |
| CT47 | Template CSV baixa com cabeçalhos corretos | ✅ |

### 2.8 Edição
| CT | Cenário | Status |
|----|---------|:------:|
| CT29 | Formulário abre com campos pré-preenchidos | ✅ |
| CT30 | Cancelar edição não altera dados | ✅ |
| CT31 | Telefone rejeita/mascara texto não numérico | ✅ |
| CT36 | Editar Nome e salvar persiste | ✅ |
| CT37 | Editar E-mail e salvar persiste | ✅ |
| CT38 | Editar Telefone (opcional) e salvar persiste | ✅ |
| CT39 | CPF é editável e a alteração persiste | ✅ |
| — | Editar colaboradores com cargo/depto legado | 🔴 **BUG-03** |
| — | Salvar edição válida (caso Gabriela) | 🔴 **BUG-04** |

### 2.9 Inativar / Ativar
| CT | Cenário | Status |
|----|---------|:------:|
| CT32 | Clicar Inativar exibe dialog de confirmação | ✅ |
| CT33 | Cancelar inativação mantém ativo | ✅ |
| CT34 | Clicar Ativar exibe dialog de confirmação | ✅ |
| CT35 | Confirmar inativação remove da lista | ✅ |
| CT64 | Confirmar ativação reativa o colaborador | ✅ |

### 2.10 Não-funcional
| CT | Cenário | Status |
|----|---------|:------:|
| CT68 | A11y: ações têm aria-label e dialog prende o foco | ✅ |
| CT69 | Responsivo: tabela utilizável em mobile | ✅ (overflow → 🔴 **BUG-08**) |
| CT70 | Segurança: entrada com HTML/script não executa (XSS) | ✅ |

---

## 3. 🐞 Fichas de Bug (para abertura de cards)

> Todas as evidências abaixo foram coletadas via inspeção do DOM real com Playwright autenticado no sandbox.

---

### BUG-01 — CPF é aceito com dígito verificador (checksum) inválido
- **Severidade:** 🔴 Alta (integridade de dados — CPFs inválidos entram na base)
- **Módulo:** Cadastro Manual / validação de CPF
- **Caso de teste:** CT43

**Descrição.** O formulário valida o **formato** do CPF (11 dígitos — ver BUG correlato positivo no CT42, que funciona), mas **não valida o dígito verificador**. Qualquer CPF com 11 dígitos é aceito, mesmo que matematicamente inválido.

**Pré-condição:** estar logado em `/colaboradores`.

**Passos:**
1. Clicar em **Adicionar → Cadastro Manual**.
2. Preencher: Nome, E-mail válido, Data válida, Departamento, Cargo.
3. No campo **CPF**, informar `363.044.490-00` (11 dígitos, formato válido, **checksum inválido**).
4. Clicar em **Salvar**.

**Resultado esperado:** submissão bloqueada com mensagem **"CPF inválido"** (mesmo tratamento do CT42 para CPF incompleto).

**Resultado obtido:** cadastro concluído com sucesso.

```text
CPF testado (checksum inválido, único): 363.044.490-00
SALVOU (aceitou CPF inválido)? true | dialog ainda aberto? false
Toast exibido: "Colaborador cadastrado com sucesso."
```

**Evidência adicional / impacto:** o gerador de massa de teste usa CPFs terminados em `-00` (ex.: `357.253.819-00`, `350.661.742-00`) — **todos** foram aceitos e persistidos, comprovando que o checksum nunca é verificado.

**Correção esperada:** aplicar validação de dígito verificador de CPF (algoritmo padrão de módulo 11) no submit, retornando "CPF inválido".

---

### BUG-02 — Colaborador recém-criado não aparece na busca (nem por nome, nem por CPF)
- **Severidade:** 🔴 Alta (UX crítica — usuário cria e não consegue localizar)
- **Módulo:** Cadastro / Busca (indexação)
- **Caso de teste:** observado em CT21 (verificação ajustada para não depender da busca)

**Descrição.** Após um cadastro **bem-sucedido** (toast de sucesso + persistência confirmada), o novo colaborador **não é retornado pela busca** — nem por nome, nem por CPF, **nem após recarregar a página**. Registros antigos são pesquisáveis normalmente, o que indica **atraso/inconsistência no índice de busca** para novos registros.

**Passos:**
1. Cadastrar um colaborador (Adicionar → Cadastro Manual → salvar). Confirmar toast "Colaborador cadastrado com sucesso.".
2. Buscar pelo **nome** completo recém-cadastrado → sem resultados.
3. Buscar pelo **CPF** (com e sem máscara) → sem resultados.
4. Recarregar a página e repetir → ainda sem resultados.

**Resultado esperado:** o registro recém-criado é encontrado pela busca (nome/CPF/e-mail).

**Resultado obtido:**
```text
Fresh CPF: 357.693.342-00  → cadastro: Success toast visible? true | Dialog open? false
Search by full CPF rows:   ["Nenhum colaborador encontrado."]
Search by CPF digits rows: ["Nenhum colaborador encontrado."]
Após reload + busca por nome: registro não retornado
```
Contraste: busca por CPF de registro **semeado** (ex.: Bruno `234.567.890-11`) funciona normalmente (CT15 ✅).

**Correção esperada:** garantir que a indexação de busca contemple registros recém-criados imediatamente (ou invalidar/atualizar o índice no commit do cadastro).

---

### BUG-03 — Edição bloqueada para colaboradores com Cargo/Departamento fora das opções do select
- **Severidade:** 🟠 Alta (impede edição de parte da base)
- **Módulo:** Edição / formulário (comboboxes Departamento e Cargo)
- **Caso de teste:** observado durante CT36–38

**Descrição.** Vários colaboradores possuem **Cargo** (e às vezes **Departamento**) cujo valor **não consta nas opções** do `<select>` do formulário. Ao abrir a edição, o combobox correspondente exibe **"Selecione..."** (valor não casado) e, ao salvar, a validação dispara **"Cargo é obrigatório"** / **"Departamento é obrigatório"**, impedindo qualquer alteração — mesmo que o usuário só quisesse mudar o telefone.

**Exemplos reais (logs):**
```text
[Henrique Castro Nunes]  depto combobox="Selecione..."   cargo combobox="Selecione..."
   → "Departamento é obrigatório" + "Cargo é obrigatório"  (Jurídico / Advogado não existem nas opções)
[Isabella Moura Cardoso] depto="Financeiro"  cargo="Selecione..."
   → "Cargo é obrigatório"  (cargo "Controler" não existe nas opções)
[Eduarda Lima Santos]    depto="Marketing"   cargo="Selecione..."  → bloqueado
[Karen Lopes Vieira]     depto="Marketing"   cargo="Selecione..."  → bloqueado
```
Opções atuais do select de **Cargo**: Analista Júnior/Pleno/Sênior, Assistente, Consultor, Coordenador, Desenvolvedor, Diretor, Especialista, Gerente. (Não há "Advogado", "Controler", "Tech Lead", etc.)

**Resultado esperado:** o formulário deve carregar o valor atual do colaborador (mesmo legado) ou permitir salvar mantendo o valor existente; alternativamente, alinhar as opções do select à base.

**Resultado obtido:** edição impossível para esses registros.

**Causa provável:** divergência entre os valores armazenados (dados legados/seed) e a lista de opções do componente de select. Recomenda-se: (a) normalizar os dados existentes; e/ou (b) o select aceitar/exibir o valor atual do registro.

---

### BUG-04 — Falha silenciosa ao salvar edição válida (sem mensagem de erro)
- **Severidade:** 🟠 Média
- **Módulo:** Edição (backend/feedback)
- **Caso de teste:** observado durante CT36

**Descrição.** Para alguns colaboradores com **todos os campos obrigatórios válidos**, o salvamento da edição **não conclui** e **não há mensagem de erro** nem toast — o dialog simplesmente permanece aberto.

**Exemplo real (Gabriela Torres Pereira — todos os campos válidos):**
```text
nome:  "Gabriela Torres Pereira"
cpf:   "789.012.345-66"
email: "gabriela.pereira@aurora-demo.com.br"
data:  "21/06/1983"
depto combobox = "Recursos Humanos"  (opção válida)
cargo combobox = "Analista Pleno"    (opção válida)
→ após Salvar: toast de sucesso? false | dialog aberto? true
→ mensagens de erro no dialog: nenhuma (somente o cabeçalho "INFORMAÇÕES OBRIGATÓRIAS")
```
Comparativo — colaboradores que **salvam** normalmente: Bruno, Carla, Felipe, Lucas Fernandes Gomes, João Victor Ribeiro (todos com cargo "Analista Júnior"). Gabriela (RH / Analista Pleno) **não salva**, sem indicar o motivo.

**Resultado esperado:** salvar com sucesso (toast "Colaborador atualizado com sucesso.") ou exibir uma mensagem de erro clara explicando o bloqueio.

**Resultado obtido:** nada acontece — sem sucesso e sem erro (falha silenciosa).

**Correção esperada:** retornar feedback de erro ao usuário em qualquer falha de salvamento; investigar por que certos registros válidos são rejeitados pelo backend.

---

### BUG-05 — Busca não retorna à primeira página
- **Severidade:** 🟡 Média
- **Módulo:** Busca + Paginação
- **Caso de teste:** CT55

**Descrição.** Ao executar uma busca estando em uma página diferente da primeira, a aplicação **mantém o deslocamento (offset) atual** em vez de reposicionar na página 1, podendo exibir uma página vazia/incorreta dos resultados.

**Passos:**
1. Ir para a **página 2** (botão "Próxima"). Rodapé: `Mostrando 11-20 de 47 itens`.
2. Digitar um termo amplo no campo de busca (ex.: `a`).

**Resultado esperado:** os resultados começam na **página 1** → `Mostrando 1-… de N itens`.

**Resultado obtido:**
```text
antes de buscar, paginação: "Mostrando 11-20 de 47 itens"
após buscar "a",  paginação: "Mostrando 11-20 de 47 itens"   ← não voltou à página 1
```

**Correção esperada:** resetar o índice de paginação para 1 sempre que o termo de busca mudar.

---

### BUG-06 — Busca não remove espaços nas pontas (sem trim)
- **Severidade:** 🟡 Baixa
- **Módulo:** Busca
- **Caso de teste:** CT56

**Descrição.** Espaços em branco no início/fim do termo de busca não são removidos, fazendo a busca falhar para um termo que, sem os espaços, encontraria resultados.

**Passos:**
1. No campo de busca, digitar `␣␣Bruno␣␣` (com espaços antes e depois).

**Resultado esperado:** encontra "Bruno Henrique Souza" (termo é normalizado com trim).

**Resultado obtido:**
```text
TRIM "  Bruno  ": ["Nenhum colaborador encontrado."]
```

**Correção esperada:** aplicar `.trim()` ao termo antes de filtrar.

---

### BUG-07 — Tecla Esc não fecha os dialogs de forma confiável
- **Severidade:** 🟡 Baixa (acessibilidade/UX)
- **Módulo:** Dialogs (Cadastro / Importação / Seleção)
- **Caso de teste:** observado em CT67

**Descrição.** Ao pressionar **Esc** com um campo/botão do dialog focado, o dialog **não fecha**. O fechamento via botão **X** funciona normalmente. É um padrão esperado de acessibilidade que `Escape` feche modais (Radix Dialog suporta isso por padrão), mas aqui o comportamento é inconsistente.

**Passos:**
1. Abrir **Adicionar → Cadastro Manual** (o foco vai para um campo do formulário).
2. Pressionar **Esc**.

**Resultado esperado:** o dialog fecha.

**Resultado obtido:** o dialog permanece aberto.
```text
Snapshot após Esc:
- dialog "Adicionar Colaborador"
  - heading "Adicionar Colaborador"
  - textbox "Nome Completo *" [active]   ← campo segue focado, dialog aberto
```

**Correção esperada:** garantir o fechamento por `Escape` (handler global do dialog, independentemente do elemento focado).

---

### BUG-08 — Overflow horizontal no mobile (viewport 375px)
- **Severidade:** 🟡 Baixa (responsividade)
- **Módulo:** Tabela / layout responsivo
- **Caso de teste:** observado em CT69

**Descrição.** Em viewport mobile (375×812), o conteúdo da tabela ultrapassa a largura da viewport, gerando **rolagem horizontal do documento inteiro** (em vez de um container com scroll próprio ou layout adaptado).

**Verificação:**
```js
// em 375px de largura:
document.documentElement.scrollWidth <= document.documentElement.clientWidth  // → false
```

**Resultado esperado:** sem rolagem horizontal do documento; tabela com container rolável próprio ou layout adaptado a telas pequenas.

**Resultado obtido:** documento com rolagem horizontal.

**Correção esperada:** encapsular a tabela em um container com `overflow-x: auto` e/ou adotar layout responsivo (cards) em telas estreitas.

---

## 4. Observações de Ambiente (não são bugs de produto)

- **Massa de dados poluída no sandbox:** os selects de **Departamento** e **Cargo** contêm valores de teste inválidos (`asd`, `TESTECARACTERETESTECARACTERE…`) e há dezenas de registros "QA Automation" / "Import QA" de execuções automatizadas. Recomenda-se uma limpeza da base do sandbox.
- **Lentidão/instabilidade do sandbox:** o carregamento da tabela apresenta picos de latência; a suíte usa `timeout` de 90s e `retries`. Recomenda-se rodar em **modo serial** (já é o padrão em CI).

---

## 5. Como Reproduzir a Suíte

```bash
# 1. Renovar a sessão autenticada (aprovar MFA se o SSO Keycloak expirou)
npx playwright test --project=setup --headed

# 2. Suíte completa do módulo (modo serial = determinístico)
npx playwright test tests/colaboradores/ --project=chromium --workers=1

# 3. Apenas um grupo (ex.: validações de cadastro)
npx playwright test tests/colaboradores/colaboradores-validacoes.spec.ts --project=chromium

# 4. Relatório HTML
npm run test:report
```

> Os bugs **BUG-01, BUG-05 e BUG-06** estão codificados como testes `test.fail()` (afirmam o comportamento correto). Enquanto o bug existir, aparecem como *expected failure* (não quebram a suíte); quando corrigidos, o Playwright acusará "passou inesperadamente", sinalizando que o marcador deve ser removido.
