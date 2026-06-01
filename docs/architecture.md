# Arquitetura — Aurora Test Automation

## Visão Geral

O projeto adota uma arquitetura em camadas que separa responsabilidades e maximiza a reutilização de código.

```
┌─────────────────────────────────────┐
│           TESTES (Specs)            │  tests/**/*.spec.ts
│   Orquestram o fluxo e validam      │
└──────────────┬──────────────────────┘
               │ usa
┌──────────────▼──────────────────────┐
│           FIXTURES                  │  fixtures/test-fixtures.ts
│   Injetam dependências nos testes   │
└──────────────┬──────────────────────┘
               │ instancia
┌──────────────▼──────────────────────┐
│         PAGE OBJECTS (POM)          │  pages/*.ts
│   Encapsulam seletores e ações      │
└──────────────┬──────────────────────┘
               │ usa
┌──────────────▼──────────────────────┐
│           UTILITÁRIOS               │  utils/*.ts
│   Logger, Screenshots, Helpers      │
└──────────────┬──────────────────────┘
               │ lê de
┌──────────────▼──────────────────────┐
│        CONFIGURAÇÃO / DADOS         │  config/*.ts  test-data/*.ts
│   Ambientes, credenciais, fixtures  │
└─────────────────────────────────────┘
```

---

## Padrões Adotados

### Page Object Model (POM)

Cada tela da aplicação tem uma classe correspondente em `pages/`. As classes:

- Declaram locators como propriedades privadas readonly
- Expõem apenas métodos de ação e consulta (sem lógica de asserção)
- Herdam de `BasePage` para comportamento comum

**Por que POM?** Alterações na UI afetam somente a classe correspondente, não os testes.

### Fixture-based Dependency Injection

O Playwright permite estender o objeto `test` com fixtures customizadas. Em `fixtures/test-fixtures.ts` são definidos:

- `loginPage` — instância de `LoginPage`
- `dashboardPage` — instância de `DashboardPage`
- `authenticatedPage` — página já com sessão carregada

Os testes recebem essas dependências por parâmetro, sem precisar instanciar manualmente.

### Autenticação Global com StorageState

O projeto usa o mecanismo de **Project Setup** do Playwright:

```
Projeto "setup"
  └─ auth.setup.ts
       ├─ Navega para a Aurora (redireciona ao Keycloak)
       ├─ Realiza login completo (dois passos)
       └─ Salva auth/storageState.json

Projetos "chromium / firefox / webkit"
  └─ Dependem de "setup"
       └─ Carregam storageState em cada contexto de browser
            └─ Testes iniciam já autenticados
```

**Por que não logar em cada teste?** Login via Keycloak leva 3-5 segundos. Em uma suite com 50 testes, isso representa 2-4 minutos a menos por execução.

**Exceção:** Testes do módulo de login (login.spec.ts) usam `test.use({ storageState: { cookies: [], origins: [] } })` para testar o fluxo real.

---

## Fluxo de Autenticação Keycloak

```
Navegador              Aurora App             Keycloak
    │                      │                      │
    │── GET /             ─►│                      │
    │                      │── 302 redirect ──────►│
    │                      │   (PKCE params)        │
    │                      │                        │
    │◄─────────────────────────────────────────────│
    │         Keycloak Login Page                   │
    │                                               │
    │ 1. Preenche email                             │
    │ 2. Clica Sign In ────────────────────────────►│
    │                                               │
    │ 3. Preenche email (2º passo, se visível)      │
    │ 4. Preenche senha                             │
    │ 5. Clica Entrar ─────────────────────────────►│
    │                                               │
    │◄──────── 302 redirect com auth_code ─────────│
    │                      │                        │
    │── GET / (com code) ─►│                        │
    │                      │── troca code/token ───►│
    │                      │◄── access token ───────│
    │◄── Dashboard ────────│                        │
```

> **Nota importante sobre a URL do Keycloak:** A URL de login contém `state`, `nonce` e `code_challenge` que são gerados dinamicamente pela aplicação Aurora a cada sessão. Por isso, a automação navega para a URL da aplicação (`AURORA_BASE_URL`) e deixa o redirect ocorrer normalmente — nunca deve usar uma URL Keycloak hardcoded.

---

## Estratégia de Seletores

Prioridade de uso (do mais robusto ao menos robusto):

| Prioridade | Estratégia | Exemplo |
|:---:|---|---|
| 1 | `data-testid` | `[data-testid="submit-btn"]` |
| 2 | Role semântico | `getByRole('button', { name: 'Entrar' })` |
| 3 | Label/Placeholder | `getByLabel('E-mail')` |
| 4 | ID estável (Keycloak padrão) | `#username`, `#password`, `#kc-login` |
| 5 | Classe CSS estável | `.sidebar-nav` |
| ❌ | XPath | Evitar sempre |

---

## Gestão de Evidências

| Tipo | Quando | Destino |
|---|---|---|
| Screenshot automático | Falha de teste | `reports/test-results/` (Playwright) |
| Screenshot manual | Ponto crítico do fluxo | `reports/screenshots/` |
| Evidência anexada | Asserção importante | Relatório HTML |
| Vídeo | Falha (`retain-on-failure`) | `reports/test-results/` |
| Trace | Primeiro retry | `reports/test-results/` |
| Log | Todas as execuções | `reports/logs/` |

---

## Estratégia de Manutenção

1. **Seletor quebrou?** Atualizar somente o Page Object da tela afetada.
2. **Novo módulo?** Criar `tests/<módulo>/<módulo>.spec.ts` e `pages/<Modulo>Page.ts`.
3. **Novo ambiente?** Adicionar entrada em `config/environments.ts` e variável no `.env`.
4. **Credenciais rotacionadas?** Atualizar somente o `.env` — o código não muda.
5. **Sessão expirada?** Deletar `auth/storageState.json` e executar `npm test` novamente.
