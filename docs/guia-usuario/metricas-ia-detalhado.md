# Manual de Uso — Métricas da IA

| | |
|---|---|
| **Tela** | Métricas da IA (Inteligência Artificial) |
| **Endereço** | `/metricas-ia` |
| **A quem se destina** | Gestão que acompanha o uso do assistente de IA pela organização |
| **O que permite fazer** | Consultar o volume de interações e usuários, e a evolução ao longo do tempo |

---

## 1. Visão geral

A tela **Métricas da IA** mostra como o assistente de inteligência artificial vem sendo usado:
quantas **interações** ocorreram, quantos **usuários** participaram e como esse uso **evoluiu** no
período escolhido.

---

## 2. Conhecendo a tela

### 2.1 Indicadores (KPIs)

| KPI | O que mostra |
|-----|--------------|
| **Volume de Interações** | Total de interações com a IA no período |
| **Quantidade de Usuários** | Número de usuários distintos que interagiram |

Cada KPI acompanha um selo de **variação** percentual.

### 2.2 Gráfico "Evolução de Interações"
Gráfico de **linha** que mostra a quantidade de interações ao longo dos dias do período
selecionado.

### 2.3 Seletor de período
Alternador com as opções **7 dias / 15 dias / 30 dias** — muda o recorte de tempo dos KPIs e do
gráfico.

---

## 3. Tarefas do dia a dia

### 3.1 Trocar o período de análise
1. Clique na opção desejada (**7 dias**, **15 dias** ou **30 dias**).
2. Os KPIs (Volume e Quantidade de Usuários) e o gráfico de evolução são recalculados para o novo
   recorte.

### 3.2 Ler a evolução
Passe o cursor sobre o gráfico de **Evolução de Interações** para ver os valores por dia.

---

## 4. Notas internas (equipe)

> Seção destinada à equipe técnica/QA — descreve o ambiente, não é necessária para o uso da tela.

- **Ambiente de validação:** sandbox em `https://sandbox-inbot-aurora.vercel.app/metricas-ia`.
- **Dados:** os KPIs e a série do gráfico vêm da API de métricas, com a quantidade de pontos
  proporcional ao período (7/15/30 dias).
- **Cobertura automatizada:** suíte Playwright em `tests/metricas-ia/`.
  Panorama em [`docs/relatorio-cobertura-testes-aurora.md`](../relatorio-cobertura-testes-aurora.md).
