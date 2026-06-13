# Comportamentos e limitações conhecidas

Notas técnicas observadas (sandbox, 2026-06). Issues no repositório `in-bot/aurora`.

## Consistência / dados
- **Escritas eventualmente consistentes:** após `POST /colaboradores` (201), o registro só fica operável/consultável após um tempo **não determinístico** (~3s a >75s). PUT/DELETE por id dão 404 até propagar. Planejar **retry/polling** em integrações.
- **Listagem capada em 50:** a tela de Colaboradores carrega só a 1ª página da API e pagina no client — esconde a maioria dos ativos (#698). A API suporta `?page=&limit=` corretamente.
- **Busca não indexa recém-criados:** `?search=` não retorna registros recém-inseridos por um tempo (#680).
- **Filtro `?ativo=`** retorna vazio para qualquer valor (#697).

## Relatórios
- **Deep-link/refresh** em `/relatorios/individuais?protocolo=X` é ignorado (abre BAI); a troca de protocolo é por **clique na aba** (estado interno). `/relatorios/consolidado` redireciona para a Home no acesso direto — carregar via navegação client-side (#695).
- **Contrato BHS divergente:** usa `perguntasBhs` em vez de `perguntas` (#691).
- **`kpis.balanca` sem `label`** nos relatórios (#689); rótulo de distribuição fixo em "ANSIEDADE" (#696); gráficos barra vs. pizza/rosca divergem do protótipo (#692/#693).
- **Métricas IA:** a API não retorna dados de variação (% exibido é estático no front) (#687).

## Escrita
- **Configuração no-op:** `PATCH /configuracoes/*` responde 200 sem persistir (#700).
- **Validação fraca em Pedidos:** `POST /pedidos {}` → 409 "undefined"; `POST /pedidos/lote {}` → 500 (deveria 400) (#701).
- **CPF:** a API valida dígito verificador (`POST` com CPF inválido → 400 "cpf inválido"); o front mostra erro genérico (#683). Importação rejeita CPF inválido com 422 (graceful).

## Autenticação
- **`GET /auditoria` → 403** apesar de o `/me` conceder `auditoria.read` ao perfil (#688).
- Token Bearer **não persistido**; renovação por refresh silencioso (cookie Keycloak). Integrações server-to-server devem usar fluxo próprio (service account/direct grant), não o storageState do browser.

## Cobertura de testes (referência)
Suíte E2E + contratos de API em `tests/` (Playwright). Camada de API cobre relatórios, RBAC e CRUD de colaboradores/configuracoes/pedidos/tratativa. Telas rodam em modo serial. Ver PR #1.
