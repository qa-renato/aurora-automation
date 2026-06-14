# Automação de Testes — Aurora
### Visão Gerencial · QA · 12/06/2026

---

## 1. Sumário executivo

A Aurora conta com uma **suíte de testes automatizados de ponta a ponta (E2E)** que simula o uso real da plataforma no navegador, validando funcionalidades críticas antes de chegarem ao usuário. Hoje a suíte cobre **~140 cenários** em 4 módulos, já está rodando contra o ambiente de Homologação e, nesta rodada de QA, **encontrou e documentou 16 bugs** (todos registrados no GitHub).

**Em uma frase:** temos uma base sólida de automação funcional, com boa arquitetura, mas com **3 lacunas estratégicas** — não há execução automática (CI), a autenticação é frágil e parte das telas (relatórios) ainda não é coberta.

---

## 2. O que é e por que importa

- **Teste automatizado** = um "robô" que abre o navegador, navega pela Aurora, clica, preenche formulários e **verifica se o resultado está correto** — repetível, rápido e sem intervenção humana.
- **Valor para o negócio:**
  - Detecta regressões (algo que quebrou) **antes** do cliente.
  - Reduz o tempo de teste manual repetitivo.
  - Gera **evidências** (prints, vídeos) de cada falha.
  - Padroniza o critério de "pronto para liberar".

---

## 3. Como o Playwright funciona (visão gerencial)

O **Playwright** (mantido pela Microsoft) é a ferramenta que dirige o navegador. De forma simples:

| Conceito | O que significa para a gestão |
|----------|-------------------------------|
| **Navegador real** | Os testes rodam em Chrome, Firefox e Safari de verdade — o que o robô vê é o que o usuário vê. |
| **Espera inteligente** | Ele aguarda os elementos aparecerem sozinho — menos testes "falsos" por lentidão. |
| **Evidência automática** | Em cada falha, salva **print, vídeo e "trace"** (gravação passo a passo) para análise. |
| **Sessão reaproveitada** | Faz login uma vez e reaproveita — testes mais rápidos. |
| **Paralelismo** | Pode rodar vários testes ao mesmo tempo (hoje usamos modo serial por estabilidade do sandbox). |

---

## 4. Estrutura do projeto (como está organizado)

Arquitetura **Page Object Model (POM)** — padrão de mercado que separa "o que testar" de "como a tela funciona", facilitando manutenção.

```
aurora/
├── tests/         → os cenários de teste, organizados por módulo
│   ├── colaboradores/   (70 cenários)
│   ├── pedidos/         (38 cenários)
│   ├── casos-graves/    (18 cenários)
│   ├── login/           (3 cenários)
│   ├── setup/           (autenticação)
│   └── users, campaigns, settings (placeholders)
├── pages/         → "mapa" de cada tela (botões, campos, ações) — POM
├── fixtures/      → preparação comum dos testes (sessão autenticada)
├── config/        → ambientes e credenciais
├── test-data/     → massas de dados (ex.: CSVs de importação)
├── utils/         → utilitários (logs, screenshots, helpers)
├── docs/          → documentação e relatórios
└── auth/          → sessão salva (storageState) — não versionado
```

**Resumo numérico:** 19 arquivos de teste · ~140 cenários · 6 "mapas" de tela (POM, ~1.400 linhas) · logs estruturados (winston).

---

## 5. O que a suíte cobre hoje

| Módulo | Cenários | Estado | Observação |
|--------|----------|--------|------------|
| **Colaboradores** | 70 | ✅ Funcional | Tabela, busca, filtro, ordenação, cadastro, edição, importação CSV, ativar/inativar, validações, acessibilidade, responsivo, segurança (XSS) |
| **Pedidos** | 38 | ⏸️ Escrito, bloqueado | Pronto, mas a plataforma não devolve dados na sessão automatizada |
| **Casos Graves** | 18 | 🟡 Parcial | 14 ativos (leitura) + 4 pausados (escrita bloqueada) |
| **Login/Auth** | 3 | ✅ Funcional | Inclui o fluxo Keycloak → Microsoft |
| **Users/Campaigns/Settings** | 0 | ⚪ Placeholder | Sem cobertura real |

**Ainda SEM automação (testado manualmente nesta rodada):** /adesao, /metricas-ia, /auditoria e todos os **/relatorios** (Consolidado, COPSOQ, Individuais) — justamente onde **vários bugs foram encontrados**.

---

## 6. Fluxos principais

**Fluxo de autenticação**
```
Aurora → Keycloak (realm stg-inprofile) → broker "inbot (microsoft)" → Azure AD/MFA → sessão salva → reaproveitada pelos testes
```

**Fluxo de execução**
```
1. Setup faz login e salva a sessão
2. Cada cenário abre a tela, executa a ação e verifica o resultado
3. Em caso de falha: print + vídeo + trace + log
4. Relatório HTML/JSON ao final
```

**Configuração de robustez:** timeout ampliado (90s, por causa da carga do SPA), 1–2 retentativas, evidência só em falha.

---

## 7. Resultados desta rodada de QA

- **16 bugs** encontrados e registrados no GitHub (`in-bot/aurora`), com Type=Bug, labels e critério de aceite, separados por rotina.
- Distribuição: Colaboradores 4 · Casos Graves 4 · Relatórios 5 · Métricas 1 · Auditoria 1 · Responsividade 1.
- **2 severidade alta** (busca de novos registros; edição bloqueada por dado legado).
- Destaque: **divergência visual dos gráficos** (protótipo usa pizza/rosca, Aurora usa barra) em todos os relatórios.
- Achados também separaram **falsos positivos** (ex.: validação de CPF que, na verdade, funciona) — disciplina de re-validação.

---

## 8. 🔍 Pente fino — pontos de melhoria (priorizado)

### 🔴 Prioridade Alta (estratégico)
1. **Não há CI/CD** — os testes só rodam manualmente, na máquina do QA. *Sem execução automática a cada PR/merge, perde-se o principal valor da automação (pegar regressão cedo).* → Configurar GitHub Actions.
2. **Autenticação frágil** — a sessão expira (~10h) e exige re-login manual, com risco de MFA. *Inviável para CI.* → Negociar com a plataforma um **usuário de serviço / token de teste** (sem refresh silencioso).
3. **Cobertura incompleta** — relatórios, adesão, métricas-IA e auditoria **não têm testes automatizados**, e foi exatamente lá que mais surgiram bugs. → Priorizar automação dessas rotas.

### 🟠 Prioridade Média
4. **Bloqueio de write-path (plataforma)** — token/CORS do `/me` falha na automação → /pedidos e escritas de Casos Graves não validam (38+4 cenários parados). Depende de correção da plataforma.
5. **Dívida técnica na suíte** — marcações de bug desatualizadas (ex.: CT43 — CPF checksum — não é mais bug). → Limpeza periódica.
6. **Gestão de massa de dados** — o sandbox tem dados poluídos e os testes dependem de registros fixos (ex.: "Bruno"). → Estratégia de seed/limpeza ou dados próprios por execução.
7. **Cross-browser não exercido de fato** — há 3 navegadores configurados, mas roda-se serial em Chromium. → Definir matriz real (ou assumir só Chromium).

### 🟡 Prioridade Baixa (evolução)
8. **Sem teste de regressão visual** — a divergência de gráficos foi achada manualmente. → Avaliar snapshot/visual testing.
9. **Relatório sem histórico/tendência** — HTML/JSON locais; sem dashboard de evolução. → Publicar relatório (CI) + integração com ClickUp/Slack.
10. **Placeholders** (users/campaigns/settings) — decidir se entram no escopo ou são removidos.

---

## 9. Roadmap sugerido

| Fase | Ação | Resultado |
|------|------|-----------|
| **Curto prazo** | CI no GitHub Actions + usuário de serviço para auth | Execução automática e confiável a cada mudança |
| **Curto prazo** | Limpeza de dívidas (test.fail desatualizados) + fechar PR #1 | Suíte consistente na main |
| **Médio prazo** | Automatizar /relatorios, /adesao, /metricas-ia, /auditoria | Fechar a lacuna de cobertura (onde há mais bugs) |
| **Médio prazo** | Destravar write-path (plataforma) | Validar /pedidos e escritas de Casos Graves |
| **Longo prazo** | Regressão visual + dashboard de resultados + cross-browser | Maturidade e visibilidade gerencial |

---

## 10. Mensagem-chave para a apresentação

> "Temos uma fundação de automação bem arquitetada e que **já entrega valor** (16 bugs encontrados). Para escalar, precisamos de **3 investimentos**: rodar automático (CI), uma autenticação estável para testes, e fechar a cobertura dos relatórios — que é onde os defeitos mais aparecem."
