# Convenções — Aurora Test Automation

## Nomenclatura de Arquivos

| Tipo | Convenção | Exemplo |
|---|---|---|
| Page Object | `PascalCase + Page.ts` | `LoginPage.ts`, `DashboardPage.ts` |
| Spec file | `kebab-case.spec.ts` | `login.spec.ts`, `user-management.spec.ts` |
| Fixture | `kebab-case-fixtures.ts` | `test-fixtures.ts` |
| Utilitário | `camelCase.ts` | `logger.ts`, `screenshots.ts` |
| Config | `camelCase.ts` | `environments.ts`, `credentials.ts` |
| Test data | `camelCase.ts` | `users.ts`, `campaigns.ts` |
| Setup | `*.setup.ts` | `auth.setup.ts` |

---

## Nomenclatura de Classes e Métodos

### Page Objects

```typescript
// ✅ Correto
export class LoginPage extends BasePage { }
export class UserManagementPage extends BasePage { }

// Métodos: verbos camelCase descritivos
async fillEmail(email: string): Promise<void> { }
async clickSignIn(): Promise<void> { }
async validateSuccessMessage(): Promise<void> { }
async getErrorMessage(): Promise<string | null> { }
async isLoginPageVisible(): Promise<boolean> { }
```

### Seletores (Locators)

```typescript
// ✅ Correto — private readonly, nome descritivo sem "locator" ou "element"
private readonly emailInput: Locator;
private readonly signInButton: Locator;
private readonly errorAlert: Locator;

// ❌ Evitar
private emailLocator: Locator;           // "locator" é redundante
private emailElement: Locator;           // "element" é redundante
private email: Locator;                  // muito genérico
```

---

## Estrutura dos Testes (Spec Files)

```typescript
import { test, expect } from '../../fixtures/test-fixtures';

// 1. Configurar storageState quando necessário
test.use({ storageState: { cookies: [], origins: [] } }); // para testes de login

// 2. Agrupar por feature
test.describe('Login — Fluxo de Autenticação', () => {

  // 3. Hooks de setup/teardown
  test.beforeEach(async ({ page }) => { });
  test.afterEach(async ({ page }, testInfo) => { });

  // 4. Nome do teste: deve descrever o comportamento esperado
  // Formato: "deve <comportamento> quando <condição>"
  test('deve realizar login com credenciais válidas', async ({ loginPage }) => {

    // Arrange — preparar dados e estado
    const credentials = getCredentials();

    // Act — executar ação
    await loginPage.login(credentials.email, credentials.password);

    // Assert — validar resultado
    await expect(page).toHaveURL(/aurora/);
  });
});
```

### Nomes de Teste

```typescript
// ✅ Correto — descreve comportamento esperado
test('deve exibir mensagem de erro com senha incorreta')
test('deve bloquear submissão sem e-mail preenchido')
test('deve redirecionar ao painel após login bem-sucedido')

// ❌ Evitar — muito genérico ou orientado a implementação
test('login test')
test('test 1')
test('verifica login')
```

---

## Page Objects

### Estrutura padrão

```typescript
export class ExamplePage extends BasePage {
  protected readonly pageUrl: string;

  // ─── Seletores ───────────────────────────────────────────────────────────
  private readonly primaryButton: Locator;
  private readonly inputField: Locator;

  constructor(page: Page) {
    super(page);
    this.pageUrl = getEnvironmentConfig().baseUrl + '/example';

    // Prioridade: data-testid > role > label > id estável > classe
    this.primaryButton = page.getByRole('button', { name: /confirmar/i });
    this.inputField = page.locator('[data-testid="input-example"]');
  }

  // ─── Ações ───────────────────────────────────────────────────────────────
  async fillInput(value: string): Promise<void> { }
  async clickConfirm(): Promise<void> { }

  // ─── Consultas ───────────────────────────────────────────────────────────
  async isSuccessVisible(): Promise<boolean> { }
  async getErrorText(): Promise<string | null> { }
}
```

### O que NÃO colocar no Page Object

- Asserções (`expect()`) — pertencem ao spec file
- Dados de teste — pertencem a `test-data/`
- Lógica de negócio complexa — pertencem a helpers ou ao spec file

---

## Seletores — Regras

### ✅ Use

```typescript
// data-testid (mais estável)
page.locator('[data-testid="submit-button"]')

// Role semântico
page.getByRole('button', { name: /entrar/i })
page.getByRole('textbox', { name: /e-mail/i })

// Label
page.getByLabel('Senha')

// Placeholder
page.getByPlaceholder('Digite seu e-mail')

// ID estável (ex: Keycloak padrão)
page.locator('#username')
page.locator('#password')
```

### ❌ Evite

```typescript
// XPath
page.locator('//div[contains(@class,"btn")]')

// Seletores por índice
page.locator('.btn').nth(2)

// Classes geradas dinamicamente
page.locator('.css-1a2b3c')

// Seletores muito acoplados à estrutura HTML
page.locator('body > div > main > section > form > button')
```

---

## Logs

```typescript
// ✅ Mensagens informativas claras
logger.info('Preenchendo e-mail: renato@inbot.com.br');
logger.info('Botão "Entrar" clicado');
logger.warn('Sidebar não encontrada - verifique os seletores');
logger.error(`Autenticação falhou: ${error.message}`);

// ❌ Evitar
logger.info('step 1');       // sem contexto
logger.info('done');         // sem contexto
logger.debug(JSON.stringify(bigObject)); // polui o log
```

**Nunca logar senhas ou tokens.** Use `maskSensitiveData()` de `utils/helpers.ts` quando precisar logar dados sensíveis.

---

## Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|---|:---:|---|
| `AURORA_EMAIL` | ✅ | E-mail para autenticação |
| `AURORA_PASSWORD` | ✅ | Senha para autenticação |
| `AURORA_ENV` | — | Ambiente: `staging` (padrão), `production`, `development` |
| `AURORA_BASE_URL` | — | Sobrescreve a URL base do ambiente |
| `LOG_LEVEL` | — | Nível de log: `info` (padrão), `debug`, `warn`, `error` |

---

## Commits

Seguir Conventional Commits:

```
feat(login): adicionar teste de login com SSO
fix(dashboard): corrigir seletor do menu do usuário
test(campaigns): adicionar cenários de criação de campanha
docs: atualizar guia de execução
chore: atualizar dependência do Playwright para 1.45
```
