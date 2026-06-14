# Manual de Uso — Home / Painel

| | |
|---|---|
| **Tela** | Home / Painel |
| **Endereço** | `/` |
| **A quem se destina** | Gestão e RH que precisam de uma visão geral rápida do bem-estar da empresa |
| **O que permite fazer** | Consultar os indicadores-chave, acessar os relatórios e a gestão de casos graves |

---

## 1. Visão geral

A **Home** é o painel de entrada da plataforma Aurora. Ela reúne, em uma única tela, os
**indicadores gerais** da organização e os atalhos para as áreas de análise (relatórios) e de
acompanhamento (casos graves). É o ponto de partida para a leitura rápida da situação atual.

---

## 2. Conhecendo a tela

### 2.1 Indicadores (cards superiores)

| Indicador | O que mostra |
|-----------|--------------|
| **Índice de Bem-Estar** | Valor consolidado do bem-estar (com rótulo qualitativo, ex.: *Regular*) |
| **Média Geral de Risco** | Nível médio de risco psicossocial (ex.: *Moderado*) |
| **Balança: Trabalho vs. Vida** | Equilíbrio trabalho/vida, com rótulo de status (ex.: *Atenção*) |
| **Casos Graves** | Contador de casos que requerem atenção imediata, com botão **Gerenciar Casos** |

> Cada indicador exibe um valor numérico e um descritor qualitativo. O ícone de ajuda (**?**)
> traz a explicação do indicador.

### 2.2 Acordeões de relatórios

Três blocos expansíveis dão acesso às análises detalhadas:

- **Relatórios das Entrevistas Individuais** — Ansiedade (BAI), Desesperança (BHS), Ideação Suicida (BSS), Depressão (BDI)
- **Relatório da Entrevista Ocupacional (COPSOQ)** — Copenhague
- **Resultados Consolidados** — Dashboard Consolidado

Cada item tem o atalho **"Visualizar Dashboard →"**.

---

## 3. Tarefas do dia a dia

### 3.1 Ler os indicadores
Ao abrir a Home, os quatro indicadores carregam automaticamente. Use o ícone **?** de cada card
para entender como o número é calculado e o que o rótulo (ex.: *Atenção*) significa.

### 3.2 Abrir um relatório
1. Clique no acordeão desejado (Individuais, COPSOQ ou Consolidados) para expandi-lo.
2. Clique em **"Visualizar Dashboard →"** do item para abrir a análise correspondente.

### 3.3 Acessar os casos graves
No card vermelho **Casos Graves**, clique em **Gerenciar Casos** para ir ao painel de
acompanhamento e tratativa.

---

## 4. Notas internas (equipe)

> Seção destinada à equipe técnica/QA — descreve o ambiente, não é necessária para o uso da tela.

- **Ambiente de validação:** sandbox em `https://sandbox-inbot-aurora.vercel.app/`.
- **Dados:** os indicadores vêm da API de dashboard; no primeiro acesso o carregamento pode levar
  alguns instantes (inicialização do SPA + renovação de sessão).
- **Cobertura automatizada:** comportamento coberto pela suíte Playwright em `tests/home/`.
  Panorama em [`docs/relatorio-cobertura-testes-aurora.md`](../relatorio-cobertura-testes-aurora.md).
