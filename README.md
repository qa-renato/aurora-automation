# Aurora — Automação de Testes

Suite de testes automatizados para a plataforma **Aurora** (InBot), construída com **Playwright + TypeScript** seguindo o padrão **Page Object Model**.

---

## Stack

| Ferramenta | Versão | Finalidade |
|---|---|---|
| [Playwright](https://playwright.dev) | ^1.44 | Framework de automação |
| TypeScript | ^5.4 | Tipagem estática |
| Winston | ^3.13 | Logging estruturado |
| dotenv | ^16.4 | Gerenciamento de variáveis de ambiente |

---

## Fluxo de Autenticação

A plataforma usa um fluxo de **3 etapas** validado via inspeção real do DOM:

```
Aurora (Vercel)
  └─► Keycloak          → input#username + button#kc-login
        └─► Microsoft   → input#i0116 (email) + input#i0118 (senha) + input#idSIButton9
              └─► MFA   → Microsoft Authenticator (aprovação manual)
                    └─► Aurora Dashboard ✓
```

> **Atenção:** O MFA via Microsoft Authenticator exige aprovação manual a cada nova sessão. Em CI/CD, o `storageState.json` deve ser gerado manualmente e armazenado como secret.

---

## Pré-requisitos

- Node.js 18+
- npm 9+
- Acesso à conta `renato.paulino@inbot.com.br` + Microsoft Authenticator

---

## Instalação

```bash
git clone https://github.com/qa-renato/aurora-automation.git
cd aurora-automation
npm install
npm run install:browsers
```

---

## Configuração

```bash
cp .env.example .env
```

```env
AURORA_ENV=staging
AURORA_BASE_URL=https://sandbox-inbot-aurora.vercel.app
AURORA_EMAIL=renato.paulino@inbot.com.br
AURORA_PASSWORD=sua-senha-microsoft
```

> `.env` está no `.gitignore` — nunca commite credenciais.

---

## Primeiro uso — Gerar sessão autenticada

Na primeira execução (ou quando a sessão expirar), é necessário gerar o `auth/storageState.json`:

```bash
npx playwright test tests/setup/auth.setup.ts --headed
```

Quando o browser abrir e o Microsoft pedir MFA, **aprove no Authenticator**. A sessão é salva automaticamente.

---

## Execução

### Todos os testes
```bash
npm test
```

### Por módulo
```bash
npm run test:login        # Fluxo de autenticação
npm run test:campaigns    # Gestão de campanhas
npm run test:users        # Gestão de usuários
npm run test:settings     # Configurações do sistema
```

### Por navegador
```bash
npm run test:chromium
npm run test:firefox
npm run test:webkit
```

### Com browser visível
```bash
npm run test:headed
```

### Interface visual do Playwright
```bash
npm run test:ui
```

### Relatório HTML
```bash
npm run test:report
```

### Debug step-by-step
```bash
npm run test:debug
```

---

## Estrutura

```
aurora-automation/
├── tests/
│   ├── setup/
│   │   └── auth.setup.ts        # Autenticação global — reutiliza sessão ou re-autentica
│   ├── login/
│   │   └── login.spec.ts        # Sessão ativa, re-auth completa (MFA), dashboard
│   ├── campaigns/
│   ├── users/
│   └── settings/
│
├── pages/
│   ├── BasePage.ts              # Métodos comuns: navigate, waitFor, screenshot, retry
│   ├── LoginPage.ts             # Keycloak + Microsoft SSO + MFA (seletores verificados)
│   └── DashboardPage.ts         # Validação pós-login, elementos da Aurora
│
├── fixtures/
│   └── test-fixtures.ts         # loginPage, dashboardPage, authenticatedPage
│
├── utils/
│   ├── logger.ts                # Winston: console colorido + arquivo diário
│   ├── screenshots.ts           # Evidências automáticas e manuais, anexadas ao report
│   └── helpers.ts               # waitFor, retryAction, maskSensitiveData, formatDuration
│
├── config/
│   ├── environments.ts          # staging / production / development
│   └── credentials.ts           # Leitura validada do .env
│
├── test-data/
│   └── users.ts                 # Usuários válidos e inválidos para testes
│
├── auth/                        # ⚠️  gitignored — gerado pelo setup
│   └── storageState.json
│
├── reports/                     # ⚠️  gitignored — gerado na execução
│   ├── html/
│   ├── screenshots/
│   ├── logs/
│   └── test-results/
│
├── docs/
│   ├── architecture.md
│   ├── conventions.md
│   └── execution-guide.md
│
├── playwright.config.ts
├── package.json
└── tsconfig.json
```

---

## Seletores verificados (DOM real)

| Step | Domínio | Elemento | Seletor |
|---|---|---|---|
| 1 | Keycloak | Campo e-mail | `#username` |
| 1 | Keycloak | Botão Sign In | `#kc-login` |
| 2 | Microsoft | Campo e-mail | `#i0116` |
| 2 | Microsoft | Botão Avançar | `#idSIButton9` |
| 3 | Microsoft | Campo senha | `#i0118` |
| 3 | Microsoft | Botão Entrar | `#idSIButton9` |
| — | Keycloak | Erro de senha | `#input-error-password`, `.kc-feedback-text` |

---

## Estratégia de Sessão

O projeto usa o mecanismo de **Project Setup** do Playwright com detecção automática de sessão válida:

```
npm test
  └─► [setup]    auth.setup.ts
        ├─ Sessão válida?  → salva storageState atualizado (3s)
        └─ Expirada?       → re-autentica via Keycloak → Microsoft → MFA
  └─► [chromium] carrega storageState → testes iniciam autenticados
  └─► [firefox]  idem
  └─► [webkit]   idem
```

**Quando regenerar a sessão manualmente:**
```bash
rm auth/storageState.json
npx playwright test tests/setup/auth.setup.ts --headed
```

---

## Riscos Conhecidos

| Risco | Impacto | Mitigação |
|---|---|---|
| MFA obrigatório | Bloqueia CI/CD autônomo | Usar conta de serviço sem MFA ou Conditional Access |
| Vercel Deployment Protection | Novos contextos bloqueados | `storageState.json` com cookies Vercel obrigatório |
| Sessão Keycloak expira (~10h) | Setup falha | Regenerar `storageState.json` |
| Seletores Microsoft mudam | Testes quebram | Validar com `npx playwright codegen` |

---

## Contribuindo

1. Novos módulos → criar `tests/<módulo>/<módulo>.spec.ts` e `pages/<Modulo>Page.ts`
2. Seletor quebrou → atualizar somente o Page Object da tela afetada
3. Novo ambiente → adicionar entrada em `config/environments.ts`
4. Seguir convenções em [`docs/conventions.md`](docs/conventions.md)
