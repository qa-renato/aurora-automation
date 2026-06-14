# Referência de API

Base: `https://aurora-api-sandbox.inbot.com.br` · Auth: `Authorization: Bearer <jwt>` · Erros: `{ message, error, statusCode }`.

## Contexto
### `GET /me`
Retorna o contexto/permissões do usuário. → `{ sub, email, nome, perfil, tenantId, capabilities[], needs_provisioning }`

## Colaboradores
### `GET /colaboradores`
Query: `page`, `limit` (default 50), `search` (nome/e-mail), `departamento`, `ativo`.
→ `{ data: [{ id, nome, cpf, email, departamento, cargo, ativo, dataNascimento, telefone, genero, escolaridade, estadoCivil, ... }], page, limit, total }`

### `POST /colaboradores`
Body: `{ ativo, nome, cpf, email, dataNascimento (ISO yyyy-mm-dd), departamento, cargo, telefone }` → **201** `{ id }`
Erros: **400** `{message:["cpf inválido"]}`, `["email must be an email"]`, `["dataNascimento ..."]`.

### `PUT /colaboradores/:id`
Body completo (mesmos campos do POST) → **204**. `404` se o id não existir. *(PATCH e `GET /colaboradores/:id` → 404: não implementados.)*

### `DELETE /colaboradores/:id`
→ **204**. `404` se não existir.

### `POST /colaboradores/import`
`multipart/form-data`, campo **`file`** (CSV). Header CSV: `nome,cpf,email,departamento,cargo,dataNascimento,telefone,escolaridade,estadoCivil,genero`.
→ **201** `{ inserted, updated, errors }` · **422** `{ message, erros: [{ linha, campo, motivo }] }`.

## Telas / Relatórios (somente leitura)
### `GET /screens/dashboard`
→ `{ bemEstar, risco, balancaTrabalhoVida, casosGravesAbertos }` (números; rótulos são calculados no front).

### `GET /screens/metricas-ia?periodo=7`
→ `{ kpis: { interacoes, quantidadeUsuarios }, serie: [{ name, interacoes }] }` (N pontos = dias do período).

### `GET /screens/relatorios/protocolo/{bai|bhs|bss|bdi}`
→ `{ protocolo, periodo:{inicio,fim}, totalRespostas, mediaScore, distribuicao:[{nome,quantidade}], resultados:[{colaboradorId,nome,email,score,nivel,genero,faixaEtaria,escolaridade,areaTrabalho}], distribuicoesDemo:{...}, casosGravesPorDemo:{...}, perguntas:[{numero,descricao,mediaValor,nivelLabel}] }`
**BHS** usa a chave `perguntasBhs:[{numero,descricao,percentualCritico,severidade}]`.

### `GET /screens/relatorios/protocolo/copsoq`
→ `{ periodo, totalJornadas, kpis:{ bemEstar:{valor,label}, risco:{valor,label}, balanca:{valor} }, distribuicoes:{...}, pontosFortes:[{dimensao,media,label,numQuestoes}], pontosAtencao:[...], riscoPorGrupos:{...} }`

### `GET /screens/relatorios/consolidado`
→ `{ periodo:{inicio,fim}, taxaParticipacao:{participantes,total,percentual}, kpis:{bemEstar,risco,balanca}, distribuicoes:{niveisBai,niveisBhs}, casosGraves:[{nome,email,protocolos[]}], resultados:[{colaboradorId,nome,email,linhas[]}] }` *(requisição sem `?periodo=`.)*

## Casos Graves
### `GET /screens/casos-graves?periodo=30`
`periodo`: `7|30` (ou histórico). → `{ kpis:{total,abertos,emAndamento,concluidos,arquivados}, casos:[{id,colaborador,colaboradorId,tipo,nivel,detalhe,status,responsavel,dataAbertura,dataAtualizacao,score,comentarios[],timeline[]}], agrupados:[...] }`

### `PATCH /casos-graves/:id/status`
Body: `{ status }` (`Aberto|Em Andamento|Concluído|Arquivado`) → **200** `{ id, status }`. **422** `{error:"Transição de status inválida", de, para}` (máquina de estados).

### `POST /casos-graves/:id/comentarios`
Body: `{ texto, autorNome, responsavelId }` → **201** `{ id, casoGraveId, tipo:"comment", texto, autorNome, ... }`.

## Pedidos
### `GET /pedidos`
Query: `page`, `limit`. → `{ data:[{id,protocolo,colaboradorEmail,status,criadoEm,atendidoEm,entrevistaId}], page, limit, total }`
### `GET /pedidos/lotes` → `[{ protocolo, data, total, atendidos, percentual }]`
### `GET /pedidos/adesao` → `[{ protocolo, total, atendidos, percentual }]`
### `POST /pedidos` (individual)
Body: `{ colaboradorId, protocolo }` → **201** · **409** `{message:"Já existe um pedido aberto de <P> para <colab>"}`.
### `POST /pedidos/lote` (em lote)
Body: `{ protocolo }` → cria pedidos para **todos os colaboradores ativos** (ignora quem já tem pedido aberto).

## Configurações
### `GET /configuracoes`
→ `{ botId, syncEnabled, intableApiKeyConfigured, visual:{logoBase64,corPrincipal}, datasources:[...], departamentos:[...], cargos:[...] }`
### `GET /configuracoes/campos/uso` → `{ departamentos:{<nome>:<count>}, cargos:{<nome>:<count>} }`
### `GET /configuracoes/provisioning/status` → `{ items:[{id,status,actionable}], tables:[{tableName,exists,active,rowsCount,lastUpdated}] }`
### `PATCH /configuracoes/visual` — Body `{ logoBase64, corPrincipal }` → **200**
### `PATCH /configuracoes/departamentos` — Body `{ departamentos:[] }` → **200**
### `PATCH /configuracoes/cargos` — Body `{ cargos:[] }` → **200**

## Auditoria
### `GET /auditoria`
Retorna a lista de eventos `{ "Data e Hora", "Usuário", "Ação", "Recurso", "Decisão" }` (requer `auditoria.read`).
