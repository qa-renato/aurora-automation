# Manual de Uso — Pedidos de Protocolo

| | |
|---|---|
| **Tela** | Pedidos de Protocolo |
| **Endereço** | `/pedidos` |
| **A quem se destina** | Gestão/RH que solicitam questionários (protocolos) aos colaboradores |
| **O que permite fazer** | Consultar pedidos, acompanhar adesão por protocolo e criar novos pedidos (individual ou em lote) |

---

## 1. Visão geral

A tela **Pedidos de Protocolo** controla as solicitações de questionários (BAI, BHS, BDI, BSI,
COPSOQ) enviadas aos colaboradores. A partir dela você acompanha o que já foi pedido, o status de
cada solicitação e cria novos pedidos — para uma pessoa específica ou para todos os ativos.

---

## 2. Conhecendo a tela

### 2.1 Cards de adesão por protocolo (topo)
Cards **informativos** que resumem a adesão de cada protocolo no formato `SIGLA  %  atendidos/total`
(ex.: *BAI 75% 3/4*). São apenas indicativos — não filtram a tabela.

### 2.2 Tabela de pedidos

| Coluna | Conteúdo |
|--------|----------|
| **Colaborador** | E-mail do colaborador |
| **Protocolo** | Sigla do protocolo solicitado |
| **Status** | *Aberto* ou *Atendido* |
| **Criado em** | Data de criação do pedido |
| **Atendido em** | Data em que foi respondido (quando aplicável) |

A busca localiza por **e-mail**; o rodapé permite escolher **10 / 25 / 50** itens por página.

### 2.3 Botão "Novo Pedido"
Abre a escolha entre **Individual** e **Em Lote**.

---

## 3. Tarefas do dia a dia

### 3.1 Buscar e acompanhar pedidos
1. Digite parte do **e-mail** no campo de busca.
2. A lista filtra conforme você digita; use as setas de paginação para navegar.

### 3.2 Criar um pedido individual
1. Clique em **Novo Pedido** → **Individual**.
2. Selecione o **Protocolo**.
3. Selecione o **Colaborador** na lista.
4. Clique em **Criar Pedido**.

> Se o colaborador já tiver um pedido em aberto daquele protocolo, o sistema avisa que já existe
> um pedido aberto e não cria um duplicado.

### 3.3 Criar pedidos em lote
1. Clique em **Novo Pedido** → **Em Lote**.
2. Selecione o **Protocolo**.
3. Confirme em **Criar em Lote** — serão criados pedidos para **todos os colaboradores ativos**
   (quem já tem pedido aberto do protocolo é ignorado).

---

## 4. Notas internas (equipe)

> Seção destinada à equipe técnica/QA — descreve o ambiente, não é necessária para o uso da tela.

- **Ambiente de validação:** sandbox em `https://sandbox-inbot-aurora.vercel.app/pedidos`.
- **Cards de adesão:** são informativos por definição (não filtram a tabela ao clicar).
- **Cobertura automatizada:** suíte Playwright em `tests/pedidos/` (UI) + contrato de API de
  pedidos. Panorama em [`docs/relatorio-cobertura-testes-aurora.md`](../relatorio-cobertura-testes-aurora.md).
