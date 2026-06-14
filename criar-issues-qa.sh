#!/usr/bin/env bash
# Cria as 12 issues de QA (sessão 10–11/06/2026) em in-bot/aurora.
# Cada issue recebe labels + Type=Bug. Idempotência: NÃO há — rodar 2x cria duplicatas.
# Uso: bash criar-issues-qa.sh
set -uo pipefail
REPO="in-bot/aurora"

# 0) conectividade (o GitHub estava bloqueado por proxy nesta sessão)
if ! gh api rate_limit >/dev/null 2>&1; then
  echo "❌ GitHub inacessível (rede/proxy). Resolva a conectividade e rode de novo."
  echo "   Dica: '! nslookup api.github.com' deve apontar para 140.82.x.x (não 4.228.31.x)."
  exit 1
fi
echo "✅ GitHub acessível — iniciando."

# 1) garante labels (no-op se já existirem; precisa de permissão de escrita)
ensure_label(){ gh label create "$1" --repo "$REPO" --color "$2" --description "$3" >/dev/null 2>&1 || true; }
ensure_label bug            d73a4a "Algo não está funcionando"
ensure_label frontend       0052cc "Implementação e design de interface"
ensure_label backend        5319e7 "Backend / API"
ensure_label colaboradores  0e8a16 "Módulo Colaboradores"
ensure_label metricas-ia    1d76db "Módulo Métricas da IA"
ensure_label auditoria      1d76db "Módulo Auditoria"
ensure_label relatorios     1d76db "Relatórios"
ensure_label responsividade fbca04 "Responsividade / mobile"
ensure_label casos-graves   c5def5 "Módulo Casos Graves"

# 2) helper de criação + Type=Bug
create_issue(){
  local title="$1" labels="$2" body="$3" url num
  url=$(gh issue create --repo "$REPO" --title "$title" --label "$labels" --body "$body" 2>&1) || { echo "❌ FALHOU: $title -> $url"; return 1; }
  echo "✅ $url"
  num="${url##*/}"
  if [[ "$num" =~ ^[0-9]+$ ]]; then
    gh api "repos/$REPO/issues/$num" -X PATCH -f type=Bug >/dev/null 2>&1 && echo "   Type=Bug aplicado" || echo "   (Type não aplicado)"
  fi
}

# ========================= COLABORADORES =========================
create_issue "[BUG] Colaborador recém-criado não aparece na busca (índice desatualizado)" "bug,colaboradores,backend" "$(cat <<'EOF'
Severidade: Alta (UX crítica)

Após um cadastro bem-sucedido, o novo colaborador não é retornado pela busca — nem por nome, nem por CPF, nem após recarregar a página. Registros antigos são pesquisáveis normalmente.

Passos:
1. Cadastrar colaborador com CPF válido (toast "Colaborador cadastrado com sucesso.")
2. Buscar pelo nome completo -> sem resultados
3. Buscar pelo CPF (com e sem máscara) -> sem resultados
4. Recarregar e repetir -> ainda sem resultados

Reproduzido em 11/06/2026 (CPF válido 254.826.058-50): cadastro OK, busca por nome e por CPF não retornam o registro.

Esperado: registro encontrável imediatamente após o cadastro.
Causa provável: índice de busca não contempla registros recém-criados.
EOF
)"

create_issue "[BUG] Edição bloqueada para colaboradores com Cargo/Departamento fora das opções" "bug,colaboradores" "$(cat <<'EOF'
Severidade: Alta (impede edição de parte da base)

Colaboradores cujo Cargo/Departamento não consta nas opções do <select> não podem ser editados: o combo carrega "Selecione..." e o save dispara "é obrigatório", bloqueando qualquer alteração (mesmo só telefone).

Reproduzido em 11/06/2026 com "Henrique": Departamento="Selecione...", Cargo="Selecione...", e ao Salvar aparece "Cargo é obrigatório" / "Departamento é obrigatório". (Valores legados como Jurídico/Advogado não existem na lista de opções.)

Esperado: carregar o valor atual do registro (mesmo legado) ou permitir manter o existente; alternativamente, alinhar as opções do select à base de dados.
EOF
)"

create_issue "[BUG] Busca não retorna à primeira página (mantém offset)" "bug,colaboradores,frontend" "$(cat <<'EOF'
Severidade: Média

Ao buscar estando em uma página diferente da 1a, a aplicação mantém o offset atual em vez de reposicionar na página 1.

Passos:
1. Ir para a página 2 (ex.: "Mostrando 11-20 de 46 itens")
2. Digitar um termo no campo de busca (ex.: "a")

Reproduzido em 11/06/2026: após buscar, a paginação continua "Mostrando 11-20 de 46 itens".

Esperado: resetar o índice de paginação para 1 sempre que o termo de busca mudar ("Mostrando 1-... de N itens").
EOF
)"

create_issue "[BUG] Frontend não exibe a mensagem \"cpf inválido\" da API — mostra erro genérico" "bug,colaboradores,frontend" "$(cat <<'EOF'
Severidade: Baixa/Média (UX / tratamento de erro)

Ao cadastrar com um CPF inválido, o backend valida corretamente e retorna:
  400 {"message":["cpf inválido"],"error":"Bad Request","statusCode":400}
(confirmado em 11/06/2026 com 363.044.490-00 e 111.111.111-11)

Mas o frontend NÃO exibe essa mensagem: mostra o toast genérico "Não foi possível salvar o colaborador. Tente novamente.", sem validação inline no campo CPF e sem informar que o CPF é inválido. O "tente novamente" é enganoso (não é erro transitório — repetir o mesmo CPF sempre falha).

Esperado: exibir a mensagem "CPF inválido" (vinda da API) junto ao campo CPF.
EOF
)"

# ========================= RESPONSIVIDADE =========================
create_issue "[BUG] Tabelas cortam colunas no mobile (375px) — colaboradores, pedidos, configurações" "bug,frontend,responsividade" "$(cat <<'EOF'
Severidade: Média

Em /colaboradores, /pedidos e /configuracoes, as tabelas são mais largas que a viewport (375px). A partir da coluna E-mail o conteúdo é cortado e as colunas seguintes (Departamento, Cargo, Status, Ações) ficam inacessíveis, sem scroll horizontal claro.

Esperado: container com overflow-x scrollável, ou layout responsivo (cards) no mobile.
EOF
)"

# ========================= CASOS GRAVES =========================
create_issue "[BUG] Comentário da tratativa sem maxlength e sem quebra de palavra estoura o layout" "bug,casos-graves,frontend" "$(cat <<'EOF'
Severidade: Média

No diálogo "Tratativa de Caso Grave", o campo de comentário não tem maxlength, e o comentário renderizado no histórico não quebra palavras longas (overflow-wrap: normal). Um comentário longo SEM espaços transborda o cartão e é cortado na borda do painel, ficando ilegível.

Medição: elemento do comentário com scrollWidth 15.052px dentro de um container de 463px.

Esperado: aplicar overflow-wrap: break-word no comentário e definir um maxlength no campo.
EOF
)"

create_issue "[BUG] Rótulos dos KPIs do painel \"Gerenciar Casos\" vazam do card em telas médias" "bug,casos-graves,frontend,responsividade" "$(cat <<'EOF'
Severidade: Média

No painel "Gerenciar Casos", em larguras intermediárias (~768–960px), os 5 cards de KPI ficam estreitos e, como o rótulo usa overflow: visible, o texto transborda para fora do card e colide com o vizinho (ex.: "AGUARDANDO"+"EM", "CONCLUÍDOS"+"ARQUIVA").

Medição: caixa do rótulo de 11–50px contra texto de 96px ("CASOS GRAVES IDENTIFICADOS"). No desktop (1280px) não ocorre.

Esperado: permitir quebra de linha / reduzir fonte para o rótulo caber no card.
EOF
)"

# ========================= MÉTRICAS DA IA =========================
create_issue "[BUG] Indicadores de variação (%) das Métricas da IA são estáticos/fabricados" "bug,metricas-ia,frontend" "$(cat <<'EOF'
Severidade: Média

Os KPIs "Volume de Interações" e "Quantidade de Usuários" exibem badges "+12% neste período" e "+8% enviaram ao menos 1 mensagem" que são FIXOS — não mudam com o período nem com o dado.

Evidência (a API /screens/metricas-ia retorna só kpis e serie, SEM percentual):
- 7 dias  -> interações 0 / usuários 0  -> badge +12% / +8%
- 15 dias -> 7 / 7                        -> badge +12% / +8%
- 30 dias -> 15 / 13                       -> badge +12% / +8%

Com base 0, "+12% neste período" é impossível. Os valores estão chumbados no frontend.

Esperado: calcular a variação real vs. o período anterior (API fornecer o dado), ou ocultar o indicador quando não houver base de comparação.
EOF
)"

# ========================= AUDITORIA =========================
create_issue "[BUG] Tela de Auditoria não consulta nem exibe registros" "bug,auditoria" "$(cat <<'EOF'
Severidade: Média

A rota /auditoria não faz nenhuma requisição de dados de auditoria ao carregar (capturadas apenas /me, /configuracoes, /screens/casos-graves) e exibe "Nenhum registro encontrado." de forma incondicional (a busca também retorna vazio).

Ações do sistema (cadastros, edições de colaborador, tratativas) não aparecem, embora devam ser registradas.

Esperado: a tela consultar o log de auditoria e listar os eventos.
(Observação: não distingue "frontend não chama" de "endpoint inexistente"; o efeito para o usuário é o mesmo.)
EOF
)"

# ========================= RELATÓRIOS (sistêmicos) =========================
create_issue "[BUG] KPI \"Balança: Trabalho vs. Vida\" sem rótulo de status nos relatórios" "bug,relatorios,backend" "$(cat <<'EOF'
Severidade: Baixa/Média

Nos relatórios Consolidado e COPSOQ, a API retorna "label" para os KPIs bemEstar e risco, mas NÃO para balanca:
  bemEstar: { valor: 54, label: "Regular" }
  risco:    { valor: 2.8, label: "Moderado" }
  balanca:  { valor: 2.7 }   <- sem "label"

Na tela, o card da Balança aparece sem o descritor qualitativo (no dashboard de Casos Graves ela aparece como "Atenção").

Esperado: a API retornar o label de status da Balança em todos os relatórios.
EOF
)"

create_issue "[BUG] Rótulo \"Últimos 30 dias\" não corresponde ao período real nos relatórios" "bug,relatorios" "$(cat <<'EOF'
Severidade: Média

A UI dos relatórios Consolidado e COPSOQ exibe "Últimos 30 dias", mas a API devolve uma janela bem menor, e a requisição é feita SEM parâmetro de período:
- Consolidado: periodo = 19/05/2026 a 26/05/2026 (7 dias)
- COPSOQ:      periodo = 27/05/2026 a 27/05/2026 (1 dia)

O rótulo é enganoso (não descreve o período exibido). (Nos relatórios individuais o período é rotulado com datas reais — lá não há esse problema.)

Esperado: alinhar o rótulo ao período real, ou aplicar/enviar o filtro de 30 dias.
EOF
)"

# ========================= RELATÓRIOS INDIVIDUAIS =========================
create_issue "[BUG] Relatório BHS não exibe a seção \"Análise por Pergunta\"" "bug,relatorios,backend" "$(cat <<'EOF'
Severidade: Média

Dos 4 relatórios individuais (BAI, BHS, BDI, BSS), apenas o BHS não exibe a seção "Análise por Pergunta" (presente nos outros 3).

Causa-raiz (payload /screens/relatorios/protocolo/{protocolo}):
- BAI -> perguntas: 21
- BDI -> perguntas: 21
- BSS -> perguntas: 19
- BHS -> "perguntas" AUSENTE; as 20 perguntas vêm sob a chave "perguntasBhs"

O frontend lê "perguntas"; como o BHS não a possui, a seção inteira some (bodyLen 903 vs ~2200 dos demais).

Esperado: padronizar a chave da API (BHS retornar "perguntas") ou o front tratar "perguntasBhs".
EOF
)"

echo ""
echo "Concluído. Lembrete: #68 e #423 já existem (não recriar). #438 deve ser REABERTO manualmente."
