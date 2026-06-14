# Manual de Uso — Relatórios Individuais

| | |
|---|---|
| **Tela** | Relatórios Individuais |
| **Endereço** | `/relatorios/individuais` |
| **A quem se destina** | Gestão/saúde ocupacional que analisa os resultados por protocolo clínico |
| **O que permite fazer** | Consultar os resultados das entrevistas individuais por protocolo (BAI, BHS, BDI, BSS) |

---

## 1. Visão geral

A tela **Relatórios Individuais** apresenta os resultados das entrevistas individuais, organizados
por **protocolo clínico**: Ansiedade (BAI), Desesperança (BHS), Depressão (BDI) e Ideação Suicida
(BSS). Para cada protocolo, mostra distribuições, perfil dos respondentes, casos de atenção e a
análise por pergunta.

---

## 2. Conhecendo a tela

### 2.1 Abas de protocolo
Quatro abas no topo: **BAI · BHS · BDI · BSS**. A aba ativa define qual protocolo está sendo
analisado.

### 2.2 Seções do relatório

| Seção | O que mostra |
|-------|--------------|
| **Filtros** | Recortes do relatório |
| **Distribuição por Nível** | Distribuição dos respondentes por faixa de severidade |
| **Perfil dos Respondentes** | Caracterização demográfica de quem respondeu |
| **Casos Moderados e Graves** | Destaque dos resultados que exigem atenção |
| **Análise (Detalhada) por Pergunta** | Resultado item a item do questionário |

> O protocolo BSS inclui ainda uma seção específica de **Tentativas Anteriores**.

---

## 3. Tarefas do dia a dia

### 3.1 Trocar de protocolo
Clique na aba do protocolo desejado (**BAI / BHS / BDI / BSS**) — o relatório recarrega com os
dados daquele protocolo.

### 3.2 Ler a distribuição e os casos de atenção
Use a seção **Distribuição por Nível** para a visão geral e **Casos Moderados e Graves** para
identificar quem precisa de acompanhamento.

### 3.3 Analisar por pergunta
Role até **Análise por Pergunta** para ver o desempenho item a item do questionário.

---

## 4. Notas internas (equipe)

> Seção destinada à equipe técnica/QA — descreve o ambiente, não é necessária para o uso da tela.

- **Ambiente de validação:** sandbox em `https://sandbox-inbot-aurora.vercel.app/relatorios/individuais`.
- **Navegação:** a troca de protocolo é feita pelas **abas** (a tela carrega por navegação interna
  da SPA).
- **Cobertura automatizada:** suíte Playwright em `tests/relatorios-individuais/` + contrato de API
  dos relatórios. Panorama em [`docs/relatorio-cobertura-testes-aurora.md`](../relatorio-cobertura-testes-aurora.md).
