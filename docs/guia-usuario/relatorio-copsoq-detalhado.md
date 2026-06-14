# Manual de Uso — Relatório COPSOQ

| | |
|---|---|
| **Tela** | Relatório COPSOQ (Entrevista Ocupacional) |
| **Endereço** | `/relatorios/copsoq` |
| **A quem se destina** | Gestão/saúde ocupacional que analisa os fatores psicossociais do trabalho |
| **O que permite fazer** | Consultar os indicadores e as dimensões do protocolo ocupacional COPSOQ |

---

## 1. Visão geral

O **Relatório COPSOQ** (Copenhagen Psychosocial Questionnaire) apresenta a avaliação dos **fatores
psicossociais do trabalho**. Reúne os indicadores-chave (bem-estar, risco e balança trabalho×vida)
e o detalhamento por dimensões, pontos fortes e pontos de atenção.

---

## 2. Conhecendo a tela

### 2.1 Indicadores (KPIs)

| KPI | O que mostra |
|-----|--------------|
| **Índice de Bem-Estar** | Bem-estar consolidado (escala 0–100) com rótulo qualitativo |
| **Média Geral de Risco** | Nível de risco (escala 1–5) com rótulo |
| **Balança: Trabalho vs. Vida** | Equilíbrio trabalho/vida (escala 1–5) |

### 2.2 Seções do relatório

| Seção | O que mostra |
|-------|--------------|
| **Distribuições Demográficas** | Perfil de quem respondeu |
| **Análise de Pontuações** | Resultados por dimensão |
| **Pontos Fortes** | Dimensões com melhor avaliação |
| **Pontos de Atenção** | Dimensões que requerem cuidado |
| **Análise de Risco por Grupos** | Risco segmentado por grupos |

---

## 3. Tarefas do dia a dia

### 3.1 Ler os indicadores
Os três KPIs no topo dão a leitura rápida; o ícone **?** explica cada escala.

### 3.2 Identificar pontos fortes e de atenção
Use as seções **Pontos Fortes** e **Pontos de Atenção** para priorizar ações; a **Análise de Risco
por Grupos** ajuda a localizar onde o risco se concentra.

---

## 4. Notas internas (equipe)

> Seção destinada à equipe técnica/QA — descreve o ambiente, não é necessária para o uso da tela.

- **Ambiente de validação:** sandbox em `https://sandbox-inbot-aurora.vercel.app/relatorios/copsoq`.
- **Dados:** indicadores e dimensões vêm da API de relatório COPSOQ.
- **Cobertura automatizada:** suíte Playwright em `tests/relatorios-copsoq/` + contrato de API.
  Panorama em [`docs/relatorio-cobertura-testes-aurora.md`](../relatorio-cobertura-testes-aurora.md).
