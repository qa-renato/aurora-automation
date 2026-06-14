# Manual de Uso — Resultados Consolidados

| | |
|---|---|
| **Tela** | Resultados Consolidados |
| **Endereço** | `/relatorios/consolidado` |
| **A quem se destina** | Gestão que precisa da visão geral consolidada de toda a organização |
| **O que permite fazer** | Consultar a participação, os indicadores e os resultados individuais consolidados, com exportação |

---

## 1. Visão geral

A tela **Resultados Consolidados** reúne, em um único painel, a leitura **agregada** de todos os
protocolos: taxa de participação, distribuição por níveis, indicadores gerais, casos graves e a
tabela com os resultados individuais — com opção de exportar.

---

## 2. Como acessar

A tela é aberta pela **Home** (ou pelo painel de Casos Graves): expanda **Resultados Consolidados**
e clique em **Visualizar Dashboard →**.

---

## 3. Conhecendo a tela

| Seção | O que mostra |
|-------|--------------|
| **Período** | Janela de datas real dos dados exibidos |
| **Taxa de Participação** | Participantes / total (ex.: 5/116) |
| **Níveis BAI / BHS** | Distribuição por faixa de severidade (gráficos de barras) |
| **Indicadores gerais** | Índice de Bem-Estar, Balança Trabalho × Vida |
| **Casos Graves** | Casos que requerem atenção |
| **Resultados Individuais** | Tabela: Colaborador · Protocolo · Score · Nível |

A tabela de resultados oferece **Exportar CSV**.

---

## 4. Tarefas do dia a dia

### 4.1 Ler a participação e os níveis
A **Taxa de Participação** mostra quantos responderam; os gráficos de **Níveis BAI/BHS** dão a
distribuição por severidade.

### 4.2 Exportar os resultados
Na tabela **Resultados Individuais**, clique em **Exportar CSV** para baixar o arquivo
(`resultados-consolidados.csv`).

---

## 5. Notas internas (equipe)

> Seção destinada à equipe técnica/QA — descreve o ambiente, não é necessária para o uso da tela.

- **Ambiente de validação:** sandbox em `https://sandbox-inbot-aurora.vercel.app/relatorios/consolidado`.
- **Acesso:** carregado por navegação interna (Home → Resultados Consolidados → Visualizar Dashboard).
- **Período:** a faixa exibida corresponde à janela real retornada pela API (datas em formato BR).
- **Cobertura automatizada:** suíte Playwright em `tests/relatorios-consolidado/` + contrato de API.
  Panorama em [`docs/relatorio-cobertura-testes-aurora.md`](../relatorio-cobertura-testes-aurora.md).
