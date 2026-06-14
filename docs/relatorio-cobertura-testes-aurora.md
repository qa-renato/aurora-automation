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
| Relatórios Individuais | 16 | ✅ | #695, #696 |
| Resultados Consolidados | 10 | ✅ | #689 |
| Relatório COPSOQ | 9 | ✅ | #689, #693 |
| Configurações | 8 | ✅ | #699, #700 |
| Adesão e Engajamento | 7 | ✅ | #502 |
| Métricas da IA | 6 | ✅ | #687 |
| Home / Painel | 5 | ✅ | — |
| Auditoria do Sistema | 5 | ✅ | #688 |

## 3. Cobertura direta na API (dados)

| API / Área | Cenários Automatizados | Status | Bugs Monitorados |
|------|:---:|:---:|---|
| Contratos de tela (shapes de dados) | 14 | ✅ | #687, #689, #691 |
| Colaboradores — escrita (criar/editar/excluir/importar) | 9 | ✅ | #680 |
| Pedidos (leitura + criação) | 9 | ✅ | #701 |
| Colaboradores — leitura (busca/filtro/paginação) | 8 | ✅ | #697 |
| Configurações (leitura + escrita) | 8 | ✅ | #700 |
| Casos Graves / Tratativa (status, comentário) | 4 | ✅ | — |
| Colaboradores — validações (CPF/e-mail/data) | 3 | ✅ | #497, #493 |
| RBAC / permissões (`/me` × endpoints) | 1 | ✅ | #688 |

## 4. Bugs em aberto (monitorados por sentinelas)

**🔴 Alto impacto**

- **#688** — Auditoria nega acesso (403) apesar de a permissão ser concedida; a tela não lista registros.
- **#687** — Variação (%) das Métricas da IA é fabricada (não muda com o período).

**🟠 Médio impacto**

- **#700** — Salvar Configurações não persiste (retorna sucesso, mas nada muda).
- **#689** — Relatórios: indicador "Balança" sem rótulo de status.
- **#693** — Relatório COPSOQ: KPIs fora do padrão de gráfico aprovado.
- **#695** — Relatórios Individuais: deep-link/refresh de protocolo é ignorado.
- **#696** — Relatórios Individuais: rótulo de distribuição fixo em "Ansiedade".
- **#691** — Contrato do BHS divergente dos demais protocolos (API).
- **#701** — Validações de Pedidos retornam status incorreto (API).
- **#697** — Filtro `ativo` da API de Colaboradores retorna vazio.
- **#680** — Colaborador recém-criado não aparece na busca (índice atrasado).
- **#497 / #493** — Validações de data de nascimento / e-mail (API).

**🟡 Baixo impacto**

- **#699** — Botões "Adicionar/Salvar" grudados em Configurações (layout).
- **#502** — Adesão sem seletor de itens por página.

## 5. Confiabilidade e Transparência
O processo de validação foi estruturado considerando as particularidades do ambiente sandbox, que apresenta comportamento assíncrono e variações no tempo de propagação de dados. Para evitar falsos positivos durante a execução, cenários dependentes de sincronização realizam tratamentos específicos, garantindo maior confiabilidade nos resultados.

Além disso, os testes foram desenvolvidos com maior resiliência operacional, adaptando-se dinamicamente aos dados disponíveis no ambiente, o que reduz impactos causados por reinicializações ou alterações na massa de testes.

No momento, a validação completa do módulo de Auditoria permanece parcialmente limitada devido ao bug #688, atualmente em acompanhamento e pendente de correção.

## 6. Conclusão
A iniciativa apresenta uma cobertura robusta, estruturada em duas camadas de validação, com as 11 principais telas estáveis e aprovadas, garantindo segurança e previsibilidade no fluxo principal da aplicação.

Atualmente existem 13 bugs mapeados e monitorados por mecanismos automatizados de validação, concentrados principalmente nos módulos de Auditoria (#688), Configurações (#700) e Relatórios. Assim que os ajustes forem implementados, a suíte de testes refletirá automaticamente a evolução do cenário, assegurando acompanhamento contínuo da qualidade da entrega.
