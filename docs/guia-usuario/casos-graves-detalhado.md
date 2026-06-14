# Manual de Uso — Casos Graves

| | |
|---|---|
| **Tela** | Casos Graves |
| **Endereço** | `/casos-graves` |
| **A quem se destina** | Gestão/saúde ocupacional responsável por acompanhar e tratar casos de risco |
| **O que permite fazer** | Visualizar indicadores, gerenciar casos e registrar a tratativa (status, responsável, comentários) |

---

## 1. Visão geral

A tela **Casos Graves** é o centro de acompanhamento dos casos que requerem atenção imediata. Ela
começa como um **painel de indicadores** e dá acesso ao painel de **gestão de casos**, onde cada
caso pode ser tratado individualmente.

---

## 2. Conhecendo a tela

### 2.1 Painel inicial
- Três medidores (gauges): **Índice de Bem-Estar**, **Média Geral de Risco**, **Balança: Trabalho vs. Vida**.
- Card vermelho **Casos Graves** (contador + *"Requerem atenção imediata"*) com botão **Gerenciar Casos**.
- Acordeões de relatórios (Individuais, COPSOQ, Consolidados).

### 2.2 Painel "Gerenciar Casos"
Revelado ao clicar em **Gerenciar Casos**:
- **Filtro de Período:** Últimos 30 dias / Últimos 7 dias / Todo o histórico.
- **5 indicadores:** Casos Graves Identificados, Aguardando Ação, Em Tratativa, Concluídos, Arquivados.
- **2 gráficos:** *Status das Tratativas* (rosca) e *Origem dos Alertas* (barras).
- **Tabela "Detalhamento por Paciente":** Colaborador/Evento · Nível de Risco · Último Alerta · Status/Tratativa · **Ação** (botão **Gerenciar**).

### 2.3 Diálogo "Tratativa de Caso Grave"
Aberto pelo botão **Gerenciar** de uma linha:
- Dados do caso (nome, nível, data, descrição do alerta).
- **Status da Tratativa:** Aberto / Em Andamento / Concluído / Arquivado.
- **Responsável:** lista de responsáveis (ou *Ninguém atribuído*).
- **Histórico & Comentários:** linha do tempo + campo para **Comentar**.

---

## 3. Tarefas do dia a dia

### 3.1 Filtrar por período
No painel **Gerenciar Casos**, use o seletor de **Período** para alternar entre 7 dias, 30 dias ou
todo o histórico — os indicadores e a tabela se ajustam.

### 3.2 Abrir a tratativa de um caso
Na tabela **Detalhamento por Paciente**, clique em **Gerenciar** na linha do caso.

### 3.3 Atualizar status / responsável
1. No diálogo, selecione o novo **Status** e/ou o **Responsável**.
2. A alteração é registrada (a máquina de estados pode recusar transições inválidas de status).

### 3.4 Adicionar um comentário
1. Escreva no campo **"Adicionar um comentário..."**.
2. Clique em **Comentar** — o comentário entra no **Histórico** (registro append-only).

### 3.5 Fechar o diálogo
Use o **X** (canto superior) ou **Esc** para fechar e voltar à lista.

---

## 4. Notas internas (equipe)

> Seção destinada à equipe técnica/QA — descreve o ambiente, não é necessária para o uso da tela.

- **Ambiente de validação:** sandbox em `https://sandbox-inbot-aurora.vercel.app/casos-graves`.
- **Escritas:** mudança de status/responsável e comentário são confirmadas pela API; a leitura na
  tela pode refletir com pequeno atraso de propagação.
- **Cobertura automatizada:** suíte Playwright em `tests/casos-graves/` (UI) + contrato de API da
  tratativa. Panorama em [`docs/relatorio-cobertura-testes-aurora.md`](../relatorio-cobertura-testes-aurora.md).
