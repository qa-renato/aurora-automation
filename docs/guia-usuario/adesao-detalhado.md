# Manual de Uso — Adesão e Engajamento

| | |
|---|---|
| **Tela** | Adesão e Engajamento |
| **Endereço** | `/adesao` |
| **A quem se destina** | Gestão/RH que acompanham a taxa de resposta dos questionários por lote |
| **O que permite fazer** | Consultar a adesão de cada lote, ver quem respondeu/está pendente e exportar o relatório |

---

## 1. Visão geral

A tela **Adesão e Engajamento** mostra, por **lote** de envio, quantos colaboradores já
responderam ao questionário. É a visão de acompanhamento da participação — útil para cobrar quem
ainda está pendente e medir o engajamento de cada campanha.

---

## 2. Conhecendo a tela

### 2.1 Seletor de Lote
Combobox no topo que lista os lotes no formato `Protocolo (SIGLA) — DD/MM/AAAA`
(ex.: *Ansiedade (BAI) — 30/05/2026*). Cada lote corresponde a um envio.

### 2.2 Resumo de adesão
Exibe o medidor (donut) com o **percentual** e o texto **"X de Y colaboradores responderam"** do
lote selecionado.

### 2.3 Tabela "Acompanhamento por Colaborador"

| Coluna | Conteúdo |
|--------|----------|
| **Colaborador** | Nome/identificação da pessoa |
| **Status** | *Respondido* ou *Pendente* |

### 2.4 Exportar
Botão **Exportar Excel** que gera o arquivo de relatório de adesão (CSV compatível com Excel).

---

## 3. Tarefas do dia a dia

### 3.1 Trocar de lote
1. Clique no seletor de **Lote**.
2. Escolha o lote desejado — o resumo (% e "X de Y") e a tabela são atualizados para aquele lote.

### 3.2 Ver quem respondeu / está pendente
Na tabela **Acompanhamento por Colaborador**, a coluna **Status** indica quem já respondeu
(*Respondido*) e quem falta (*Pendente*).

### 3.3 Exportar o relatório de adesão
1. Selecione o lote desejado.
2. Clique em **Exportar Excel**.
3. O arquivo `Relatorio_Adesao_<SIGLA>_<data>.csv` é baixado, com as colunas **Colaborador** e
   **Status** e uma linha por colaborador do lote.

---

## 4. Notas internas (equipe)

> Seção destinada à equipe técnica/QA — descreve o ambiente, não é necessária para o uso da tela.

- **Ambiente de validação:** sandbox em `https://sandbox-inbot-aurora.vercel.app/adesao`.
- **Export:** o arquivo é um CSV com BOM (abre direto no Excel) e separador `;`.
- **Cobertura automatizada:** suíte Playwright em `tests/adesao/` (inclui validação do conteúdo do
  CSV exportado). Panorama em [`docs/relatorio-cobertura-testes-aurora.md`](../relatorio-cobertura-testes-aurora.md).
