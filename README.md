# Aurora — Automação de Testes

Suite de testes automatizados para a plataforma **Aurora (InBot)**, construída com Playwright + TypeScript seguindo o padrão Page Object Model.

---

## Pré-requisitos

- Node.js 18+
- npm 9+

---

## Instalação

```bash
cd aurora
npm install
npm run install:browsers
```

---

## Configuração

Copie o arquivo de exemplo e preencha as credenciais:

```bash
cp .env.example .env
```

Edite o `.env`:

```env
AURORA_ENV=staging
AURORA_BASE_URL=https://sandbox-inbot-aurora.vercel.app
AURORA_EMAIL=seu-email@inbot.com.br
AURORA_PASSWORD=SuaSenha@123
```

> **Nunca commite o arquivo `.env`** — ele está no `.gitignore`.

---

## Execução

### Todos os testes
```bash
npm test
```

### Por módulo
```bash
npm run test:login
npm run test:campaigns
npm run test:users
npm run test:settings
```

### Por navegador
```bash
npm run test:chromium
npm run test:firefox
npm run test:webkit
```

### Com interface visual
```bash
npm run test:ui
```

### Modo debug
```bash
npm run test:debug
```

### Teste isolado
```bash
npx playwright test tests/login/login.spec.ts --project=chromium
```

### Relatório HTML
```bash
npm run test:report
```

---

## Estrutura do Projeto

```
aurora/
├── tests/
│   ├── setup/
│   │   └── auth.setup.ts        # Autenticação global (executado uma vez)
│   ├── login/
│   │   └── login.spec.ts        # Testes do fluxo de login
│   ├── campaigns/               # Testes de campanhas
│   ├── users/                   # Testes de usuários
│   └── settings/                # Testes de configurações
│
├── pages/
│   ├── BasePage.ts              # Classe base com métodos comuns
│   ├── LoginPage.ts             # POM da página de login (Keycloak)
│   └── DashboardPage.ts         # POM do painel principal
│
├── fixtures/
│   └── test-fixtures.ts         # Fixtures customizadas (extensão do test base)
│
├── utils/
│   ├── logger.ts                # Logger Winston (console + arquivo)
│   ├── screenshots.ts           # Captura de evidências
│   └── helpers.ts               # Funções utilitárias gerais
│
├── config/
│   ├── environments.ts          # URLs e configurações por ambiente
│   └── credentials.ts           # Leitura segura das credenciais do .env
│
├── test-data/
│   └── users.ts                 # Dados de usuários para os testes
│
├── auth/                        # Estado autenticado (gitignored)
│   └── storageState.json        # Sessão salva pelo auth.setup.ts
│
├── reports/                     # Saída dos testes (gitignored)
│   ├── html/                    # Relatório HTML interativo
│   ├── json/                    # Resultados em JSON
│   ├── test-results/            # Traces, screenshots e vídeos
│   ├── screenshots/             # Evidências manuais
│   └── logs/                    # Logs de execução
│
├── docs/
│   ├── architecture.md          # Documentação da arquitetura
│   ├── conventions.md           # Convenções de código
│   └── execution-guide.md       # Guia detalhado de execução
│
├── playwright.config.ts
├── package.json
├── tsconfig.json
└── .env
```

---

## Boas Práticas

1. **Nunca** use seletores XPath frágeis — prefira `data-testid`, `role`, `label`.
2. **Nunca** hardcode credenciais no código — use variáveis de ambiente.
3. Reutilize Page Objects para evitar duplicação de seletores.
4. Use o `storageState` para evitar login em cada teste.
5. Capture screenshots em pontos críticos do fluxo.

---

## Autenticação e Reutilização de Sessão

O projeto usa o mecanismo de **Project Setup** do Playwright:

1. O projeto `setup` executa `auth.setup.ts` **uma única vez**
2. O login é realizado e a sessão é salva em `auth/storageState.json`
3. Todos os outros projetos (chromium, firefox, webkit) carregam essa sessão
4. Testes de login sobrescrevem o storageState com `test.use({ storageState: { cookies: [], origins: [] } })`

---

## MCP Playwright

Para inspeção de elementos em tempo real:

```bash
npx playwright codegen https://sandbox-inbot-aurora.vercel.app
```

Use o Playwright Inspector para descobrir seletores robustos e atualize os Page Objects conforme necessário.
