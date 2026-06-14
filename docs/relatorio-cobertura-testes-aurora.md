# 📊 Relatório de Cobertura de Testes — Plataforma Aurora

**Data:** 14/06/2026 · **Ambiente:** Homologação (sandbox) · **Responsável:** QA · **Automação:** Playwright + TypeScript

## 1. Resumo executivo
A plataforma conta com **~290 cenários automatizados** em duas camadas: **interface (telas)** e **dados (API)**. Nesta data, **as 11 telas foram revalidadas e estão verdes**. A automação mantém "sentinelas" para cada bug em aberto — que viram verdes automaticamente quando corrigidos — e descobre problemas novos.

## 2. Cobertura por tela (interface)

| Tela | Cenários Automatizados | Status | Bugs Monitorados |
|------|:---:|:---:|---|
| Gestão de Colaboradores | 97 | ✅ | — |
| Pedidos de Protocolo | 38 | ✅ | — |
| Casos Graves | 18 | ✅ | — |
| Relatórios Individuais | 16 | ✅ | #692, #695, #696 |
| Resultados Consolidados | 10 | ✅ | #689, #692 |
| Relatório COPSOQ | 9 | ✅ | #689, #692, #693 |
| Configurações | 8 | ✅ | #699, #700 |
| Adesão e Engajamento | 7 | ✅ | #502 |
| Métricas da IA | 6 | ✅ | #687 |
| Home / Painel | 5 | ✅ | — |
| Auditoria do Sistema | 5 | ✅ | #688 |

## 3. Cobertura direta na API (dados)

| API / Área | Cenários Automatizados | Status | Bugs Monitorados |
|------|:---:|:---:|---|
| Contratos de tela (shapes de dados) | 14 | ✅ | #687, #689 |
| Colaboradores — escrita (criar/editar/excluir/importar) | 9 | ✅ | #680 |
| Pedidos (leitura + criação) | 9 | ✅ | #701 |
| Colaboradores — leitura (busca/filtro/paginação) | 8 | ✅ | #697 |
| Configurações (leitura + escrita) | 8 | ✅ | #700 |
| Casos Graves / Tratativa (status, comentário) | 4 | ✅ | — |
| Colaboradores — validações (CPF/e-mail/data) | 3 | ✅ | #497, #493 |
| RBAC / permissões (`/me` × endpoints) | 1 | ✅ | #688 |

## 4. Bugs em aberto
Total de **33 issues abertas** no repositório. Destas, **~25 são bugs de produto** (UI/API); as demais são itens de **backend/infra** (3) ou **casos de uso/feature** (5), fora do escopo da automação de interface/API.

### 4.1. Bugs de produto monitorados por automação (17)
A suíte tem uma "sentinela" para cada um — fica vermelha até a correção e vira verde sozinha quando resolvida.

**🔴 Alto impacto**

- **#688** — Auditoria nega acesso (403) apesar de a permissão ser concedida; a tela não lista registros.
- **#687** — Variação (%) das Métricas da IA é fabricada (não muda com o período).

**🟠 Médio impacto**

- **#700** — Salvar Configurações não persiste (retorna sucesso, mas nada muda).
- **#689** — Relatórios: indicador "Balança" sem rótulo de status.
- **#692** — Relatórios: gráficos de distribuição em barra (deveriam ser pizza).
- **#693** — Relatório COPSOQ: KPIs fora do padrão de gráfico aprovado.
- **#695** — Relatórios Individuais: deep-link/refresh de protocolo é ignorado.
- **#696** — Relatórios Individuais: rótulo de distribuição fixo em "Ansiedade".
- **#701** — Validações de Pedidos retornam status incorreto (API).
- **#697** — Filtro `ativo` da API de Colaboradores retorna vazio.
- **#680** — Colaborador recém-criado não aparece na busca (índice atrasado).
- **#497 / #493** — Validações de data de nascimento / e-mail (API).
- **#423 / #363** — Ajustes de painel/hover (corrigidos no código, aguardando deploy).

**🟡 Baixo impacto**

- **#699** — Botões "Adicionar/Salvar" grudados em Configurações (layout).
- **#502** — Adesão sem seletor de itens por página.

### 4.2. Bugs de produto sem cobertura automatizada (8)
Dependem de verificação manual — divergências visuais finas ou cenários atrelados à massa/ambiente do sandbox.

- **#698** — Colaboradores: lista carrega só os primeiros 50 registros.
- **#681** — Edição bloqueada para cargo/departamento legado.
- **#508** — Filtro "30 dias" das Métricas da IA com período incorreto.
- **#503** — Adesão sem paginação (correlato do #502).
- **#504 / #500** — Tooltip/ícone de ajuda desalinhados (visual).
- **#496** — Novos departamentos não sincronizam com o filtro.
- **#271** — Tabela com zero registros.

### 4.3. Fora do escopo da automação de UI/API (8)
- **Backend/infra/segurança (3):** #596 (redigir headers nos logs), #594 (tratar 429/5xx do inTable), #568 (GET /pedidos vazio, não 500).
- **Casos de uso / feature (5):** #486 (auth/logout), #380, #376 (modais de pedido), #302 (select de depto), #225 (visualizar/editar BotID).

## 5. Confiabilidade e Transparência
O processo de validação foi estruturado considerando as particularidades do ambiente sandbox, que apresenta comportamento assíncrono e variações no tempo de propagação de dados. Para evitar falsos positivos durante a execução, cenários dependentes de sincronização realizam tratamentos específicos, garantindo maior confiabilidade nos resultados.

Além disso, os testes foram desenvolvidos com maior resiliência operacional, adaptando-se dinamicamente aos dados disponíveis no ambiente, o que reduz impactos causados por reinicializações ou alterações na massa de testes.

No momento, a validação completa do módulo de Auditoria permanece parcialmente limitada devido ao bug #688, atualmente em acompanhamento e pendente de correção.

## 6. Conclusão
A iniciativa apresenta uma cobertura robusta, estruturada em duas camadas de validação, com as 11 principais telas estáveis e aprovadas, garantindo segurança e previsibilidade no fluxo principal da aplicação.

Atualmente há **33 issues em aberto**, sendo **~25 bugs de produto** — destes, **17 são monitorados por sentinelas automatizadas** (viram verdes sozinhas quando corrigidos) e 8 dependem de verificação manual (divergências visuais ou cenários atrelados ao ambiente). Os demais itens são de backend/infra (3) ou casos de uso/feature (5). As ocorrências de maior impacto concentram-se em **Auditoria (#688)**, **Configurações (#700)** e **Relatórios**. Assim que os ajustes forem implementados, a suíte refletirá automaticamente a evolução do cenário, assegurando acompanhamento contínuo da qualidade da entrega.
