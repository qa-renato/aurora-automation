# Autenticação e RBAC

## Fluxo de autenticação
1. A SPA redireciona para o **Keycloak** (`realms/stg-inprofile`, `client_id=app-admin`).
2. A tela do Keycloak oferece login **federado via broker Microsoft ("inbot")**. Usuários federados (`@inbot.com.br`) **devem** usar o broker (não há senha local).
3. Após o SSO, a SPA obtém um **token Bearer (JWT)** e o renova em runtime (refresh silencioso via cookie de sessão Keycloak). O token **não é persistido** em localStorage.
4. Toda chamada à `aurora-api` envia o header **`Authorization: Bearer <jwt>`**.

> Sandbox: a app está atrás de **Vercel Deployment Protection** — sessões automatizadas precisam também dos cookies Vercel (`_vercel_jwt`).

## Contexto do usuário — `GET /me`
```json
{
  "sub": "...",
  "email": "renato.paulino@inbot.com.br",
  "nome": "...",
  "perfil": "direcao",
  "tenantId": "...",
  "capabilities": ["colaborador.read", "..."],
  "needs_provisioning": false
}
```

## Permissões (capabilities)
O acesso é controlado por **capabilities** entregues no `/me`. Cada endpoint exige a sua.

| Capability | Habilita |
|---|---|
| `colaborador.read/create/update/delete/import` | CRUD + importação de colaboradores |
| `relatorio.individual.read` | Relatórios BAI/BHS/BDI/BSS |
| `relatorio.copsoq.read` | Relatório COPSOQ |
| `relatorio.consolidado.read` | Resultados Consolidados |
| `relatorio.adesao.read` | Adesão (`/pedidos/lotes`) |
| `pedido.read/create` | Pedidos (consulta/criação) |
| `metricas-ia.read` | Métricas da IA |
| `caso-grave.read/update` | Casos graves (consulta/tratativa) |
| `kpi.read`, `kpi.casos-graves.read` | Indicadores (dashboard/casos) |
| `configuracao.read/visual.update/campos.update/provisioning.read` | Configurações |
| `auditoria.read` | Auditoria |

> ⚠️ Há divergência conhecida: o perfil `direcao` possui `auditoria.read`, mas `GET /auditoria` retorna **403** (ver #688).
