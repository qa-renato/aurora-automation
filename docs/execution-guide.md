# Guia de Execução — Aurora Test Automation

## Pré-requisitos

```bash
node --version   # >= 18.0.0
npm --version    # >= 9.0.0
```

---

## Setup Inicial (primeira vez)

```bash
# 1. Instalar dependências Node.js
npm install

# 2. Instalar browsers do Playwright
npm run install:browsers

# 3. Configurar variáveis de ambiente
cp .env.example .env   # ou edite o .env diretamente

# 4. Preencher credenciais no .env
# AURORA_EMAIL=seu-email@inbot.com.br
# AURORA_PASSWORD=SuaSenha@123
```

---

## Executar Todos os Testes

```bash
npm test
```

O Playwright executa automaticamente nesta ordem:
1. Projeto `setup` → `auth.setup.ts` → salva `auth/storageState.json`
2. Projetos `chromium`, `firefox`, `webkit` → carregam a sessão salva

---

## Executar por Módulo

```bash
# Apenas login
npm run test:login

# Apenas campanhas
npm run test:campaigns

# Apenas usuários
npm run test:users

# Apenas configurações
npm run test:settings
```

---

## Executar por Navegador

```bash
npm run test:chromium   # Google Chrome
npm run test:firefox    # Mozilla Firefox
npm run test:webkit     # Apple Safari
```

---

## Executar Teste Isolado

```bash
# Por nome do arquivo
npx playwright test tests/login/login.spec.ts

# Por projeto específico
npx playwright test tests/login/login.spec.ts --project=chromium

# Por nome do teste (grep)
npx playwright test --grep "deve realizar login"

# Por tag (se configuradas no spec)
npx playwright test --grep "@smoke"
```

---

## Modo Debug

```bash
# Interface visual do Playwright (recomendado para desenvolvimento)
npm run test:ui

# Debug step-by-step com inspector
npm run test:debug

# Debug de um teste específico
npx playwright test tests/login/login.spec.ts --debug

# Gerar código automaticamente (Codegen)
npx playwright codegen https://sandbox-inbot-aurora.vercel.app
```

---

## Modo Headed (visualizar o browser)

```bash
npm run test:headed

# Headed em um projeto específico
npx playwright test --headed --project=chromium
```

---

## Relatórios

### Abrir relatório HTML após execução
```bash
npm run test:report
# ou
npx playwright show-report reports/html
```

### Abrir trace de um teste específico
```bash
npm run test:trace
# ou
npx playwright show-trace reports/test-results/<pasta-do-teste>/trace.zip
```

O relatório HTML inclui:
- Status de cada teste (passou/falhou/skipped)
- Screenshots em falhas
- Vídeos (quando habilitados)
- Traces interativos com timeline de ações
- Logs de console

---

## Resetar Estado Autenticado

Se a sessão expirar ou as credenciais mudarem:

```bash
# Deletar estado salvo
rm auth/storageState.json

# Executar novamente — o setup gerará uma nova sessão
npm test
```

---

## Execução em CI/CD

Variáveis de ambiente necessárias no pipeline:

```bash
AURORA_EMAIL=...
AURORA_PASSWORD=...
AURORA_ENV=staging
CI=true
```

Exemplo de script:
```bash
npm ci
npm run install:browsers
npm test
```

Em CI, o Playwright usa automaticamente:
- `workers: 1` (evita conflitos de sessão)
- `retries: 2` (tolerância a flakiness)
- `forbidOnly: true` (impede `test.only` acidental)

---

## Variáveis de Ambiente por Ambiente

### Staging (padrão)
```env
AURORA_ENV=staging
AURORA_EMAIL=usuario@inbot.com.br
AURORA_PASSWORD=SuaSenha@123
```

### Development
```env
AURORA_ENV=development
AURORA_DEV_URL=http://localhost:3000
AURORA_EMAIL=dev-user@inbot.com.br
AURORA_PASSWORD=DevSenha@123
```

---

## Troubleshooting

### "AURORA_EMAIL não configurado"
Verifique se o arquivo `.env` existe e está preenchido corretamente.

### "auth/storageState.json not found"
Execute `npm test` completo (não apenas `--project=chromium`) para gerar a sessão primeiro.

### Timeout em login
- Verifique conectividade com `https://sandbox-inbot-aurora.vercel.app`
- Verifique se o Keycloak está acessível
- Aumente `PLAYWRIGHT_TIMEOUT` ou `navigationTimeout` em `playwright.config.ts`

### Seletores quebrando
Use o Codegen para redescobrir seletores robustos:
```bash
npx playwright codegen https://sandbox-inbot-aurora.vercel.app
```
Atualize os Page Objects afetados.

### Testes flaky (intermitentes)
1. Abra o trace: `npx playwright show-trace <arquivo>.zip`
2. Identifique a ação que falhou intermitentemente
3. Adicione `waitFor({ state: 'visible' })` antes da ação
4. Considere aumentar o timeout específico daquela ação
