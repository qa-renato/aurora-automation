# Manual de Uso — Configurações

| | |
|---|---|
| **Tela** | Configurações (Visuais e de Sistema) |
| **Endereço** | `/configuracoes` |
| **A quem se destina** | Administradores que ajustam a identidade visual, integrações e campos da plataforma |
| **O que permite fazer** | Consultar e ajustar dados do bot, integração, interface, tabelas e campos de colaborador |

---

## 1. Visão geral

A tela **Configurações** concentra os ajustes da plataforma: identidade do bot, integração de
colaboradores, personalização da interface, status das tabelas de dados e os campos auxiliares
(departamentos e cargos) usados no cadastro de colaboradores.

---

## 2. Conhecendo a tela

### 2.1 Informações do Bot
Exibe o **BotID associado** e a **Intable API Key** (apresentada mascarada, ex.: `••••`).

### 2.2 Integração de Colaboradores
Controles da sincronização de colaboradores com a base de dados.

### 2.3 Personalizar Interface
Ajuste do **logo** e da **cor principal** da plataforma.

### 2.4 Tabelas de Dados

| Coluna | Conteúdo |
|--------|----------|
| **Nome** | Nome da tabela |
| **Existe** | Se a tabela está provisionada |
| **Ativa** | Se está ativa |
| **Registros** | Quantidade de registros |
| **Última Atualização** | Data da última atualização |

### 2.5 Campos de Colaborador
Gerência das listas de **departamentos** e **cargos**: campos *Novo departamento* / *Novo cargo*,
botões **Adicionar** e **Salvar**, e os chips existentes (cada um indica *"em uso por N colaboradores"*).

---

## 3. Tarefas do dia a dia

### 3.1 Conferir o status das tabelas de dados
Na seção **Tabelas de Dados**, veja se cada tabela existe, está ativa, quantos registros tem e
quando foi atualizada.

### 3.2 Personalizar a interface
Na seção **Personalizar Interface**, ajuste o logo e a cor principal e use **Salvar** para aplicar.

### 3.3 Gerenciar departamentos e cargos
1. Digite o nome em **Novo departamento** (ou **Novo cargo**).
2. Clique em **Adicionar**.
3. Use **Salvar** para confirmar a lista.

> Os chips mostram quantos colaboradores usam cada departamento/cargo (*"em uso por N colaboradores"*),
> ajudando a decidir o que pode ser removido.

---

## 4. Notas internas (equipe)

> Seção destinada à equipe técnica/QA — descreve o ambiente, não é necessária para o uso da tela.

- **Ambiente de validação:** sandbox em `https://sandbox-inbot-aurora.vercel.app/configuracoes`.
- **Cobertura automatizada:** estrutura e leitura cobertas pela suíte Playwright em
  `tests/configuracoes/` + contrato de API de configurações (leitura e escrita), com sentinelas
  para a persistência das escritas. Panorama em
  [`docs/relatorio-cobertura-testes-aurora.md`](../relatorio-cobertura-testes-aurora.md).
