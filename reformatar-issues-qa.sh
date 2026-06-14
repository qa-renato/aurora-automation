#!/usr/bin/env bash
# Reformata as 12 issues de QA (#680-691) com estrutura Descrição/Evidência/Esperado/Sugestão/Impacto.
# Idempotente (gh issue edit --body substitui o corpo). Espera a rede do GitHub voltar (até ~12min).
set -uo pipefail
REPO="in-bot/aurora"
tries=0
until gh api rate_limit >/dev/null 2>&1; do
  tries=$((tries+1)); [ "$tries" -ge 48 ] && { echo "DESISTIU: GitHub fora após ~12min"; exit 1; }
  sleep 15
done
echo "rede OK (após $tries) — reformatando"
edit_issue(){ local n="$1" body="$2"; for a in 1 2 3; do gh issue edit "$n" --repo "$REPO" --body "$body" >/dev/null 2>&1 && { echo "✅ #$n"; return 0; }; sleep 4; done; echo "❌ #$n falhou (3x)"; }

edit_issue 680 "$(cat <<'EOF'
## 📝 Descrição
Após um cadastro bem-sucedido, o colaborador recém-criado **não é retornado pela busca** — nem por nome, nem por CPF, nem após recarregar a página. Registros antigos são pesquisáveis normalmente, indicando atraso/inconsistência no índice de busca.

## 🔍 Evidência
Reproduzido em 11/06/2026 com CPF válido `254.826.058-50`:
- Cadastro concluído (toast "Colaborador cadastrado com sucesso.").
- Busca por **nome** completo → sem resultados.
- Busca por **CPF** (com e sem máscara) → sem resultados.
- Após recarregar → ainda sem resultados.

## ✅ Resultado Esperado
O registro recém-criado deve ser encontrável imediatamente pela busca (nome, CPF ou e-mail).

## 💡 Sugestão
Garantir que a indexação contemple registros recém-criados (invalidar/atualizar o índice no commit do cadastro).

## 🎯 Impacto
**Alto.** O usuário cria um colaborador e não consegue localizá-lo, quebrando o fluxo de gestão e gerando retrabalho/duplicidade.
EOF
)"
edit_issue 681 "$(cat <<'EOF'
## 📝 Descrição
Colaboradores cujo **Cargo/Departamento não consta nas opções** do `<select>` não podem ser editados: o combo carrega "Selecione..." e o save dispara "é obrigatório", bloqueando qualquer alteração — mesmo só o telefone.

## 🔍 Evidência
Reproduzido em 11/06/2026 com "Henrique": Departamento e Cargo = "Selecione..."; ao Salvar → "Cargo é obrigatório" / "Departamento é obrigatório". Valores legados (ex.: Jurídico/Advogado) não existem na lista de opções.

## ✅ Resultado Esperado
Carregar o valor atual do colaborador (mesmo legado) ou permitir salvar mantendo o existente.

## 💡 Sugestão
O select aceitar/exibir o valor atual do registro; e/ou normalizar os dados legados.

## 🎯 Impacto
**Alto.** Impede a edição de uma parcela da base — colaboradores com cargo/depto legado ficam travados.
EOF
)"
edit_issue 682 "$(cat <<'EOF'
## 📝 Descrição
Ao buscar estando em uma página diferente da primeira, a aplicação **mantém o offset atual** em vez de reposicionar na página 1.

## 🔍 Evidência
Reproduzido em 11/06/2026: ir à página 2 ("Mostrando 11-20 de 46 itens") e digitar um termo (ex.: "a") → a paginação permanece "Mostrando 11-20 de 46 itens".

## ✅ Resultado Esperado
Os resultados começam na página 1 sempre que o termo mudar ("Mostrando 1-… de N itens").

## 💡 Sugestão
Resetar o índice de paginação para 1 a cada alteração do termo de busca.

## 🎯 Impacto
**Médio.** A busca pode exibir uma página vazia/incorreta dos resultados.
EOF
)"
edit_issue 683 "$(cat <<'EOF'
## 📝 Descrição
Ao cadastrar com CPF inválido, o **backend valida e retorna a mensagem específica**, mas o **frontend não a exibe** — mostra um toast genérico, sem validação inline.

## 🔍 Evidência
Reproduzido em 11/06/2026 com `363.044.490-00` e `111.111.111-11`:
- API: `400 {"message":["cpf inválido"],"error":"Bad Request","statusCode":400}`.
- Tela: toast genérico **"Não foi possível salvar o colaborador. Tente novamente."** (o "tente novamente" é enganoso — repetir o mesmo CPF sempre falha).

## ✅ Resultado Esperado
Exibir "CPF inválido" (mensagem da API) junto ao campo CPF.

## 💡 Sugestão
Surfaceiar a `message` retornada pela API no tratamento de erro do submit, idealmente como validação inline.

## 🎯 Impacto
**Baixo/Médio.** O usuário não entende o erro. (A validação de CPF funciona no backend — não há furo de integridade.)
EOF
)"
edit_issue 684 "$(cat <<'EOF'
## 📝 Descrição
No mobile (375px), as tabelas são mais largas que a viewport: a partir da coluna **E-mail**, as colunas seguintes (Departamento, Cargo, Status, Ações) ficam **inacessíveis**, sem scroll horizontal claro.

## 🔍 Evidência
Reproduzido em 375px nas rotas **/colaboradores, /pedidos e /configuracoes**.

## ✅ Resultado Esperado
As colunas devem ser acessíveis no mobile (scroll horizontal claro ou layout adaptado).

## 💡 Sugestão
Container com `overflow-x: auto`, ou layout responsivo (cards) no mobile.

## 🎯 Impacto
**Médio.** Em telas pequenas, parte dos dados e as ações por linha ficam indisponíveis.
EOF
)"
edit_issue 685 "$(cat <<'EOF'
## 📝 Descrição
No diálogo "Tratativa de Caso Grave", o campo de comentário **não tem `maxlength`** e o comentário renderizado **não quebra palavras longas** (`overflow-wrap: normal`). Texto longo sem espaços transborda o cartão e é cortado.

## 🔍 Evidência
Medição: elemento do comentário com **scrollWidth 15.052px** dentro de um container de **463px** → transborda e clipa, ilegível.

## ✅ Resultado Esperado
Qualquer comentário deve quebrar linha e caber no cartão, com limite razoável de caracteres.

## 💡 Sugestão
`overflow-wrap: break-word` na renderização do comentário **e** `maxlength` na textarea.

## 🎯 Impacto
**Médio.** Comentário ilegível e layout do painel quebrado; permite payloads arbitrariamente longos.
EOF
)"
edit_issue 686 "$(cat <<'EOF'
## 📝 Descrição
No painel "Gerenciar Casos", em larguras intermediárias (~768–960px), os cards de KPI ficam estreitos e, como o rótulo usa `overflow: visible`, o texto **transborda para fora do card** e colide com o vizinho.

## 🔍 Evidência
- Em ~820px: "AGUARDANDO"+"EM", "CONCLUÍDOS"+"ARQUIVA" sobrepostos.
- Medição: caixa do rótulo de **11–50px** vs texto de **96px** ("CASOS GRAVES IDENTIFICADOS"). No desktop (1280px) não ocorre.

## ✅ Resultado Esperado
O rótulo deve caber dentro do card em qualquer largura.

## 💡 Sugestão
Permitir quebra de linha (`white-space: normal`, sem `overflow: visible`) e/ou reduzir fonte / ajustar o grid responsivo.

## 🎯 Impacto
**Médio.** Em tablets e janelas reduzidas, os rótulos ficam ilegíveis/sobrepostos.
EOF
)"
edit_issue 687 "$(cat <<'EOF'
## 📝 Descrição
Os KPIs "Volume de Interações" e "Quantidade de Usuários" exibem badges **"+12% neste período"** e **"+8% enviaram ao menos 1 mensagem"** que são **estáticos** — não mudam com o período nem com o dado, e a API não retorna percentual (estão chumbados no frontend).

## 🔍 Evidência
A API `/screens/metricas-ia` retorna só `kpis` e `serie`. Os KPIs mudam, os badges não:
| Período | API (interações/usuários) | Badge |
|---|---|---|
| 7 dias | 0 / 0 | +12% / +8% |
| 15 dias | 7 / 7 | +12% / +8% |
| 30 dias | 15 / 13 | +12% / +8% |

Com base 0, "+12% neste período" é impossível.

## ✅ Resultado Esperado
Exibir a variação real vs. o período anterior, ou ocultar quando não houver base de comparação.

## 💡 Sugestão
A API fornecer o percentual de variação (delta vs. período anterior) e o frontend exibir esse valor.

## 🎯 Impacto
**Médio.** Indicador enganoso — sugere crescimento inexistente e pode embasar decisões erradas.
EOF
)"
edit_issue 688 "$(cat <<'EOF'
## 📝 Descrição
A rota /auditoria **não faz nenhuma requisição de dados de auditoria** ao carregar e exibe "Nenhum registro encontrado." de forma incondicional. Ações do sistema não aparecem, embora devam ser registradas.

## 🔍 Evidência
Na carga, as únicas chamadas são `/me`, `/configuracoes` e `/screens/casos-graves` — nenhuma de auditoria. A tabela e a busca retornam sempre vazio. Ações como cadastros, edições de colaborador e tratativas não aparecem.

## ✅ Resultado Esperado
A tela deve consultar o log de auditoria e listar os eventos.

## 💡 Sugestão
Implementar/conectar o endpoint de auditoria e a chamada do frontend. (Não distingue "front não chama" de "endpoint inexistente" — o efeito é o mesmo.)

## 🎯 Impacto
**Médio/Alto.** Sem trilha de auditoria visível, perde-se rastreabilidade — relevante para compliance e investigação de incidentes.
EOF
)"
edit_issue 689 "$(cat <<'EOF'
## 📝 Descrição
Nos relatórios (Consolidado e COPSOQ), a API retorna o `label` de status para **bemEstar** e **risco**, mas **não para balanca** — o card "Balança: Trabalho vs. Vida" aparece sem o descritor qualitativo.

## 🔍 Evidência
```json
"bemEstar": { "valor": 54, "label": "Regular" },
"risco":    { "valor": 2.8, "label": "Moderado" },
"balanca":  { "valor": 2.7 }   // sem "label"
```
Na tela: "BALANÇA TxV / 2.7 / escala 1–5", sem status (no dashboard de Casos Graves a Balança aparece como "Atenção"). Ocorre em Consolidado e COPSOQ.

## ✅ Resultado Esperado
A API retornar o `label` de status da Balança em todos os relatórios, como nos demais KPIs.

## 💡 Sugestão
Incluir o campo `label` no objeto `balanca` do payload dos relatórios.

## 🎯 Impacto
**Baixo/Médio.** Um dos KPIs principais aparece sem a leitura qualitativa que os outros têm.
EOF
)"
edit_issue 690 "$(cat <<'EOF'
## 📝 Descrição
A UI dos relatórios **Consolidado e COPSOQ** exibe "Últimos 30 dias", mas a API devolve uma janela menor — e a requisição é feita **sem parâmetro de período**. O rótulo não descreve o período exibido.

## 🔍 Evidência
- Consolidado: `periodo = 19/05/2026 a 26/05/2026` (7 dias).
- COPSOQ: `periodo = 27/05/2026 a 27/05/2026` (1 dia).
- A requisição não envia `?periodo=`.
- (Nos relatórios individuais o período é rotulado com datas reais — lá não há esse problema.)

## ✅ Resultado Esperado
O rótulo deve corresponder ao período exibido (ou o filtro de "30 dias" deve ser aplicado de fato).

## 💡 Sugestão
Alinhar o rótulo ao período retornado pela API, ou enviar o parâmetro de período e respeitar a janela.

## 🎯 Impacto
**Médio.** O usuário interpreta os dados como dos últimos 30 dias quando se referem a uma janela menor — leitura equivocada.
EOF
)"
edit_issue 691 "$(cat <<'EOF'
## 📝 Descrição
Dos 4 relatórios individuais (BAI, BHS, BDI, BSS), **apenas o BHS não exibe a seção "Análise por Pergunta"** — presente nos outros três.

## 🔍 Evidência
Payload `/screens/relatorios/protocolo/{protocolo}`:
- BAI → `perguntas: 21` · BDI → `perguntas: 21` · BSS → `perguntas: 19`
- **BHS → `perguntas` AUSENTE; as 20 perguntas vêm sob a chave `perguntasBhs`**

O frontend lê `perguntas`; como o BHS não a possui, a seção não renderiza (bodyLen 903 vs ~2200).

## ✅ Resultado Esperado
O relatório BHS deve exibir a seção "Análise por Pergunta" como os demais protocolos.

## 💡 Sugestão
Padronizar a chave da API (BHS retornar `perguntas`), ou o frontend tratar `perguntasBhs` no caso do BHS.

## 🎯 Impacto
**Médio.** O relatório do BHS fica incompleto — falta a análise pergunta a pergunta.
EOF
)"
echo "Reformatação concluída."
