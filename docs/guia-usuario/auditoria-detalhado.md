# Manual de Uso — Auditoria do Sistema

| | |
|---|---|
| **Tela** | Auditoria do Sistema |
| **Endereço** | `/auditoria` |
| **A quem se destina** | Gestão/segurança que precisa rastrear ações realizadas na plataforma |
| **O que permite fazer** | Consultar o histórico de eventos do sistema e buscar por usuário, ação ou recurso |

---

## 1. Visão geral

A tela **Auditoria do Sistema** registra o **histórico de ações** realizadas na plataforma —
quem fez o quê, quando e com qual resultado. É a trilha de auditoria usada para rastreabilidade e
conformidade.

---

## 2. Conhecendo a tela

### 2.1 Tabela de eventos

| Coluna | Conteúdo |
|--------|----------|
| **Data e Hora** | Momento do evento |
| **Usuário** | Quem realizou a ação |
| **Ação** | O que foi feito |
| **Recurso** | Sobre qual recurso/entidade |
| **Decisão** | Resultado (ex.: permitido/negado) |

### 2.2 Busca
Campo de busca que filtra o histórico por **usuário, ação ou recurso**.

---

## 3. Tarefas do dia a dia

### 3.1 Consultar o histórico
Abra `/auditoria` para ver os eventos mais recentes na tabela.

### 3.2 Localizar um evento
Digite no campo de busca o **usuário**, a **ação** ou o **recurso** desejado para filtrar a lista.

---

## 4. Notas internas (equipe)

> Seção destinada à equipe técnica/QA — descreve o ambiente, não é necessária para o uso da tela.

- **Ambiente de validação:** sandbox em `https://sandbox-inbot-aurora.vercel.app/auditoria`.
- **Acesso:** a consulta de registros depende da permissão de auditoria do perfil do usuário.
- **Cobertura automatizada:** estrutura da tela (título, colunas, busca) coberta pela suíte
  Playwright em `tests/auditoria/`; a listagem de dados é acompanhada por sentinelas automatizadas.
  Panorama em [`docs/relatorio-cobertura-testes-aurora.md`](../relatorio-cobertura-testes-aurora.md).
