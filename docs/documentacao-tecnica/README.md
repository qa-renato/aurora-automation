# 🛠️ Documentação Técnica — Aurora

Documentação técnica da plataforma Aurora (saúde mental/bem-estar ocupacional).

## Índice
- [Autenticação e RBAC](autenticacao-rbac.md)
- [Referência de API](api-reference.md)
- [Comportamentos e limitações conhecidas](comportamentos-e-limitacoes.md)

## Arquitetura (visão geral)
```
[Navegador] ── SPA (React/Vite, Vercel) ──HTTPS+Bearer──> [aurora-api] ──> [inTable (datastore)]
                       │                                        │
                       └── login OIDC ──> [Keycloak / inProfile]┘
```
- **Frontend:** SPA (React + Vite) hospedada na **Vercel** (com Vercel Deployment Protection no sandbox).
- **Backend:** `aurora-api` (REST; formato de erro padrão NestJS: `{message,error,statusCode}`).
- **Integração de dados:** **inTable** (tabelas do tenant) — chave de API por tenant.
- **Autenticação:** **Keycloak** (realm `stg-inprofile`) via OIDC, com broker Microsoft (inbot).

## Ambientes
| Ambiente | URL |
|---|---|
| App (sandbox) | `https://sandbox-inbot-aurora.vercel.app` |
| API (sandbox) | `https://aurora-api-sandbox.inbot.com.br` |
| Keycloak | `https://keycloak.staging.e-auth.cloud/realms/stg-inprofile` (client `app-admin`) |

## Rotas do frontend
| Rota | Tela |
|---|---|
| `/` | Home / Painel |
| `/colaboradores` | Gestão de Colaboradores |
| `/pedidos` | Pedidos de Protocolo |
| `/adesao` | Adesão e Engajamento |
| `/metricas-ia` | Métricas da IA |
| `/casos-graves` | Casos Graves |
| `/relatorios/individuais?protocolo=` | Relatórios Individuais (BAI/BHS/BDI/BSS) |
| `/relatorios/copsoq` | Relatório COPSOQ |
| `/relatorios/consolidado` | Resultados Consolidados |
| `/auditoria` | Auditoria do Sistema |
| `/configuracoes` | Configurações |

> ⚠️ Rotas de relatório (`/relatorios/*`) dependem de navegação client-side — ver [comportamentos](comportamentos-e-limitacoes.md).
