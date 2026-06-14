# Comportamentos da plataforma

Notas técnicas úteis para quem integra com a `aurora-api` ou automatiza a SPA.

## Consistência / dados
- **Escritas assíncronas:** após `POST /colaboradores` (201), o registro pode levar alguns instantes para ficar consultável/operável por id. Planeje **retry/polling** em integrações server-to-server.
- **Paginação:** a API de colaboradores aceita `?page=&limit=` (default `limit=50`). Use os parâmetros para percorrer toda a base.

## Relatórios
- **Navegação client-side:** as telas de relatório (`/relatorios/*`) carregam por navegação interna da SPA; nos relatórios individuais a troca de protocolo é feita pelas **abas** (BAI/BHS/BDI/BSS).
- **Contrato BHS:** o protocolo BHS retorna a chave `perguntasBhs:[{numero,descricao,percentualCritico,severidade}]` (os demais usam `perguntas`).

## Validações
- **CPF:** a API valida o dígito verificador no cadastro; a importação CSV rejeita linhas com CPF inválido retornando `422` com o detalhe por linha.

## Autenticação
- O token Bearer **não é persistido**; a renovação ocorre por refresh silencioso (cookie de sessão Keycloak). Integrações server-to-server devem usar fluxo próprio (service account / direct grant), não o `storageState` do browser.

## Cobertura de testes (referência)
Suíte E2E + contratos de API em `tests/` (Playwright). A camada de API cobre relatórios, RBAC e CRUD de colaboradores/configurações/pedidos/tratativa. As telas rodam em modo serial.
