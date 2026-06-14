# Guia do Usuário — Plataforma Aurora

Bem-vindo(a) ao **Aurora**, a plataforma de acompanhamento de bem-estar e saúde ocupacional.
Este manual reúne, **tela por tela**, tudo o que você precisa para usar o sistema no dia a dia.

## Acesso
O Aurora é acessado pelo navegador. O login é feito com sua **conta corporativa
(Microsoft / inbot)** — clique em entrar e autentique com seu usuário da empresa. O que você
enxerga depende do seu **perfil de acesso**. A navegação entre as telas é feita pelo **menu
lateral**.

## Sumário
1. Home / Painel
2. Gestão de Colaboradores
3. Pedidos de Protocolo
4. Adesão e Engajamento
5. Métricas da IA
6. Casos Graves
7. Relatórios Individuais
8. Relatório COPSOQ
9. Resultados Consolidados
10. Auditoria do Sistema
11. Configurações


# 1. Home / Painel

| | |
|---|---|
| **Tela** | Home / Painel |
| **Endereço** | `/` |
| **A quem se destina** | Gestão e RH que precisam de uma visão geral rápida do bem-estar da empresa |
| **O que permite fazer** | Consultar os indicadores-chave, acessar os relatórios e a gestão de casos graves |

---

## 1. Visão geral

A **Home** é o painel de entrada da plataforma Aurora. Ela reúne, em uma única tela, os
**indicadores gerais** da organização e os atalhos para as áreas de análise (relatórios) e de
acompanhamento (casos graves). É o ponto de partida para a leitura rápida da situação atual.

---

## 2. Conhecendo a tela

### 2.1 Indicadores (cards superiores)

| Indicador | O que mostra |
|-----------|--------------|
| **Índice de Bem-Estar** | Valor consolidado do bem-estar (com rótulo qualitativo, ex.: *Regular*) |
| **Média Geral de Risco** | Nível médio de risco psicossocial (ex.: *Moderado*) |
| **Balança: Trabalho vs. Vida** | Equilíbrio trabalho/vida, com rótulo de status (ex.: *Atenção*) |
| **Casos Graves** | Contador de casos que requerem atenção imediata, com botão **Gerenciar Casos** |

> Cada indicador exibe um valor numérico e um descritor qualitativo. O ícone de ajuda (**?**)
> traz a explicação do indicador.

### 2.2 Acordeões de relatórios

Três blocos expansíveis dão acesso às análises detalhadas:

- **Relatórios das Entrevistas Individuais** — Ansiedade (BAI), Desesperança (BHS), Ideação Suicida (BSS), Depressão (BDI)
- **Relatório da Entrevista Ocupacional (COPSOQ)** — Copenhague
- **Resultados Consolidados** — Dashboard Consolidado

Cada item tem o atalho **"Visualizar Dashboard →"**.

---

## 3. Tarefas do dia a dia

### 3.1 Ler os indicadores
Ao abrir a Home, os quatro indicadores carregam automaticamente. Use o ícone **?** de cada card
para entender como o número é calculado e o que o rótulo (ex.: *Atenção*) significa.

### 3.2 Abrir um relatório
1. Clique no acordeão desejado (Individuais, COPSOQ ou Consolidados) para expandi-lo.
2. Clique em **"Visualizar Dashboard →"** do item para abrir a análise correspondente.

### 3.3 Acessar os casos graves
No card vermelho **Casos Graves**, clique em **Gerenciar Casos** para ir ao painel de
acompanhamento e tratativa.

---

## 4. Notas internas (equipe)

> Seção destinada à equipe técnica/QA — descreve o ambiente, não é necessária para o uso da tela.

- **Ambiente de validação:** sandbox em `https://sandbox-inbot-aurora.vercel.app/`.
- **Dados:** os indicadores vêm da API de dashboard; no primeiro acesso o carregamento pode levar
  alguns instantes (inicialização do SPA + renovação de sessão).
- **Cobertura automatizada:** comportamento coberto pela suíte Playwright em `tests/home/`.
  Panorama em [`docs/relatorio-cobertura-testes-aurora.md`](relatorio-cobertura-testes-aurora.md).


# 2. Gestão de Colaboradores

| | |
|---|---|
| **Tela** | Gestão de Colaboradores |
| **Endereço** | `/colaboradores` |
| **A quem se destina** | Pessoas responsáveis por gerir o quadro de colaboradores (RH, gestão) |
| **O que permite fazer** | Consultar, cadastrar, importar, editar, inativar e reativar colaboradores |

---

## 1. Visão geral

A tela **Colaboradores** é o cadastro central de pessoas da organização dentro da
plataforma Aurora. A partir dela você consegue, em um só lugar:

- **Ver** todos os colaboradores em uma tabela paginada;
- **Encontrar** uma pessoa por nome, e-mail ou CPF;
- **Filtrar** a lista por departamento e alternar a exibição de inativos;
- **Cadastrar** um colaborador manualmente ou **importar vários de uma vez** por planilha (CSV);
- **Editar** os dados de um colaborador existente;
- **Inativar** quem não faz mais parte do quadro e **reativar** quando necessário.

Por padrão, a lista mostra apenas os colaboradores **ativos**.

---

## 2. Conhecendo a tela

Ao abrir `/colaboradores`, a tela é composta por três áreas principais:

### 2.1 Barra de ações (topo)

| Controle | Para que serve |
|----------|----------------|
| **Adicionar** | Abre as opções de inclusão: *Cadastro Manual* ou *Importar Planilha* |
| **Mostrar Inativos** (interruptor) | Quando ligado, inclui na tabela os colaboradores inativos |
| **Departamento** (seletor) | Filtra a lista por um departamento; use *Todos os departamentos* para limpar |
| **Buscar** (campo) | Localiza por **nome, e-mail ou CPF** |

### 2.2 Tabela de colaboradores

A tabela tem **7 colunas**:

| Coluna | Conteúdo | Ordenável? |
|--------|----------|:----------:|
| Nome | Nome completo | ✅ |
| E-mail | E-mail de contato | ✅ |
| CPF | CPF cadastrado | — |
| Departamento | Área de trabalho | ✅ |
| Cargo | Ocupação | ✅ |
| Status | Indicação visual de ativo (verde) / inativo | ✅ |
| Ações | Botões de editar e inativar/ativar | — |

Para **ordenar**, clique no cabeçalho de uma coluna ordenável. Cada clique alterna entre
ordem crescente (A→Z) e decrescente (Z→A). As colunas **CPF** e **Ações** não são ordenáveis.

### 2.3 Rodapé (paginação)

| Controle | Para que serve |
|----------|----------------|
| **Mostrando X-Y de N itens** | Indica o intervalo exibido e o total de registros |
| **Itens por página** | Permite escolher **10**, **25** ou **50** registros por página |
| **Anterior / Próxima** | Navega entre as páginas (desabilitam nos extremos) |

> Alterar a quantidade de *itens por página* leva você de volta à **página 1**.

---

## 3. Tarefas do dia a dia

### 3.1 Localizar um colaborador (busca)

1. No campo **Buscar**, digite parte do **nome**, do **e-mail** ou o **CPF**.
2. A lista é filtrada conforme você digita.

A busca **não diferencia maiúsculas de minúsculas** e **ignora acentuação** (buscar por
`jose` encontra "José"). Se nada corresponder, a tabela exibe **"Nenhum colaborador
encontrado."**. Para voltar à lista completa, **apague o conteúdo** do campo de busca.

### 3.2 Filtrar por departamento

1. Clique no seletor **Departamento**.
2. Escolha o departamento desejado — a tabela passa a mostrar apenas as pessoas daquela área.
3. Para remover o filtro, selecione **Todos os departamentos**.

O filtro de departamento pode ser combinado com a busca, com a ordenação e com o interruptor
*Mostrar Inativos*; ele permanece aplicado enquanto você navega entre páginas.

### 3.3 Exibir colaboradores inativos

Por padrão os inativos ficam ocultos. Ligue o interruptor **Mostrar Inativos** para incluí-los
na tabela; desligue para ocultá-los novamente. O estado desse interruptor é mantido enquanto
você faz buscas.

### 3.4 Cadastrar um colaborador manualmente

1. Clique em **Adicionar**.
2. Escolha **Cadastro Manual**.
3. Preencha o formulário (veja os campos na [seção 4](#4-referência-dos-campos-do-formulário)).
   Os campos marcados com **\*** são obrigatórios.
4. Clique em **Salvar**.

Em caso de sucesso, aparece a mensagem **"Colaborador cadastrado com sucesso."** e o
formulário é fechado. Se algum dado for inválido, o formulário **permanece aberto** e exibe a
mensagem correspondente (veja a [seção 5](#5-mensagens-do-sistema)).

Para desistir, use **Cancelar** ou o botão **X** — nada é salvo.

### 3.5 Importar colaboradores por planilha (CSV)

Use a importação para cadastrar **várias pessoas de uma só vez**.

1. Clique em **Adicionar** e escolha **Importar Planilha**.
2. Clique em **Template CSV** para baixar a planilha modelo já com os cabeçalhos corretos.
3. Preencha o modelo (uma linha por colaborador) e salve como **.csv**.
4. De volta à tela, **arraste o arquivo** para a área indicada ou clique para **selecioná-lo**.
5. O sistema valida o arquivo e informa **quantos novos colaboradores foram identificados**.
6. Clique em **Confirmar Importação**.
7. Ao final, aparece **"Importação concluída!"** com o total importado com sucesso.

**Cabeçalhos esperados na planilha** (nesta ordem):

```
nome,cpf,email,departamento,cargo,dataNascimento,telefone,escolaridade,estadoCivil,genero
```

Pontos de atenção da importação:

- Apenas arquivos **.csv** são aceitos — outros formatos são recusados com a mensagem
  *"Apenas arquivos .csv são aceitos"* e o botão *Confirmar Importação* permanece desabilitado.
- Linhas com **campos obrigatórios vazios** bloqueiam a importação, com aviso indicando
  quantas linhas estão incompletas.
- O botão **Confirmar Importação** só fica disponível depois que um arquivo válido é anexado.

### 3.6 Editar um colaborador

1. Localize a pessoa na tabela (use a busca, se necessário).
2. Na coluna **Ações** da linha correspondente, clique no botão de **editar**.
3. O formulário abre **já preenchido** com os dados atuais.
4. Ajuste o que precisar e clique em **Salvar**.

Em caso de sucesso, aparece **"Colaborador atualizado com sucesso."**. Para sair sem aplicar
alterações, use **Cancelar** ou **X**.

### 3.7 Inativar um colaborador

1. Localize a pessoa (que deve estar **ativa**).
2. Na coluna **Ações**, clique no botão de **inativar**.
3. Confirme na janela clicando em **Sim, Inativar**.

A pessoa deixa de aparecer na lista padrão (ela continua acessível ligando *Mostrar Inativos*).
Para desistir, clique em **Cancelar** na janela de confirmação.

### 3.8 Reativar um colaborador

1. Ligue o interruptor **Mostrar Inativos**.
2. Localize a pessoa inativa.
3. Na coluna **Ações**, clique no botão de **ativar** e confirme em **Sim, Ativar**.

A pessoa volta a aparecer normalmente na lista de ativos.

---

## 4. Referência dos campos do formulário

Campos de **Cadastro Manual** e **Edição**. Os marcados com **\*** são obrigatórios.

| Campo | Obrigatório | Observações |
|-------|:-----------:|-------------|
| **Nome Completo** | ✅ | Nome da pessoa |
| **CPF** | ✅ | Deve conter 11 dígitos |
| **E-mail** | ✅ | Precisa ter formato de e-mail válido |
| **Data de Nascimento** | ✅ | Não pode ser uma data futura |
| **Área de Trabalho (Depto)** | ✅ | Selecione entre os departamentos disponíveis |
| **Ocupação (Cargo)** | ✅ | Selecione entre os cargos disponíveis |
| **Telefone** | — | Formatado automaticamente, ex.: `(11) 99999-8888` |
| **Gênero** | — | Opcional |
| **Estado Civil** | — | Opcional |
| **Escolaridade** | — | Opcional |

> O campo **Telefone** aplica máscara automática conforme você digita os números.

---

## 5. Mensagens do sistema

| Mensagem | Quando aparece |
|----------|----------------|
| **Colaborador cadastrado com sucesso.** | Cadastro manual concluído |
| **Colaborador atualizado com sucesso.** | Edição salva com sucesso |
| **CPF já cadastrado** | O CPF informado já pertence a outro colaborador |
| **CPF inválido** | O CPF não tem o formato esperado (11 dígitos) |
| **E-mail inválido** | O e-mail informado não tem formato válido |
| **Data de nascimento não pode ser futura** | A data informada está no futuro |
| **Nenhum colaborador encontrado.** | A busca/filtro não retornou resultados |
| **Apenas arquivos .csv são aceitos** | O arquivo de importação não é um `.csv` |
| **… linha(s) com campos obrigatórios vazios** | A planilha tem linhas incompletas |
| **… novos colaboradores identificados** | Pré-validação da importação bem-sucedida |
| **Importação concluída!** | A importação foi finalizada |

---

## 6. Notas internas (equipe)

> Esta seção é destinada à equipe técnica/QA e descreve comportamentos do ambiente — não é
> necessária para o uso da tela.

- **Ambiente de validação:** sandbox em `https://sandbox-inbot-aurora.vercel.app/colaboradores`.
- **Autenticação:** a tela carrega após o fluxo de SSO (Keycloak). No primeiro acesso o
  carregamento da tabela pode levar mais tempo, pois envolve a inicialização do SPA, a
  renovação de sessão e a chamada à API antes de a tabela ser preenchida.
- **Status na tabela:** o estado de um colaborador é representado pelo botão de ação da linha —
  *Inativar* indica que a pessoa está ativa; *Ativar* indica que está inativa.
- **Cobertura automatizada:** o comportamento desta tela é coberto pela suíte Playwright em
  `tests/colaboradores/`. Os resultados detalhados e os achados de teste estão registrados em
  [`docs/relatorio-testes-colaboradores.md`](relatorio-testes-colaboradores.md).


# 3. Pedidos de Protocolo

| | |
|---|---|
| **Tela** | Pedidos de Protocolo |
| **Endereço** | `/pedidos` |
| **A quem se destina** | Gestão/RH que solicitam questionários (protocolos) aos colaboradores |
| **O que permite fazer** | Consultar pedidos, acompanhar adesão por protocolo e criar novos pedidos (individual ou em lote) |

---

## 1. Visão geral

A tela **Pedidos de Protocolo** controla as solicitações de questionários (BAI, BHS, BDI, BSI,
COPSOQ) enviadas aos colaboradores. A partir dela você acompanha o que já foi pedido, o status de
cada solicitação e cria novos pedidos — para uma pessoa específica ou para todos os ativos.

---

## 2. Conhecendo a tela

### 2.1 Cards de adesão por protocolo (topo)
Cards **informativos** que resumem a adesão de cada protocolo no formato `SIGLA  %  atendidos/total`
(ex.: *BAI 75% 3/4*). São apenas indicativos — não filtram a tabela.

### 2.2 Tabela de pedidos

| Coluna | Conteúdo |
|--------|----------|
| **Colaborador** | E-mail do colaborador |
| **Protocolo** | Sigla do protocolo solicitado |
| **Status** | *Aberto* ou *Atendido* |
| **Criado em** | Data de criação do pedido |
| **Atendido em** | Data em que foi respondido (quando aplicável) |

A busca localiza por **e-mail**; o rodapé permite escolher **10 / 25 / 50** itens por página.

### 2.3 Botão "Novo Pedido"
Abre a escolha entre **Individual** e **Em Lote**.

---

## 3. Tarefas do dia a dia

### 3.1 Buscar e acompanhar pedidos
1. Digite parte do **e-mail** no campo de busca.
2. A lista filtra conforme você digita; use as setas de paginação para navegar.

### 3.2 Criar um pedido individual
1. Clique em **Novo Pedido** → **Individual**.
2. Selecione o **Protocolo**.
3. Selecione o **Colaborador** na lista.
4. Clique em **Criar Pedido**.

> Se o colaborador já tiver um pedido em aberto daquele protocolo, o sistema avisa que já existe
> um pedido aberto e não cria um duplicado.

### 3.3 Criar pedidos em lote
1. Clique em **Novo Pedido** → **Em Lote**.
2. Selecione o **Protocolo**.
3. Confirme em **Criar em Lote** — serão criados pedidos para **todos os colaboradores ativos**
   (quem já tem pedido aberto do protocolo é ignorado).

---

## 4. Notas internas (equipe)

> Seção destinada à equipe técnica/QA — descreve o ambiente, não é necessária para o uso da tela.

- **Ambiente de validação:** sandbox em `https://sandbox-inbot-aurora.vercel.app/pedidos`.
- **Cards de adesão:** são informativos por definição (não filtram a tabela ao clicar).
- **Cobertura automatizada:** suíte Playwright em `tests/pedidos/` (UI) + contrato de API de
  pedidos. Panorama em [`docs/relatorio-cobertura-testes-aurora.md`](relatorio-cobertura-testes-aurora.md).


# 4. Adesão e Engajamento

| | |
|---|---|
| **Tela** | Adesão e Engajamento |
| **Endereço** | `/adesao` |
| **A quem se destina** | Gestão/RH que acompanham a taxa de resposta dos questionários por lote |
| **O que permite fazer** | Consultar a adesão de cada lote, ver quem respondeu/está pendente e exportar o relatório |

---

## 1. Visão geral

A tela **Adesão e Engajamento** mostra, por **lote** de envio, quantos colaboradores já
responderam ao questionário. É a visão de acompanhamento da participação — útil para cobrar quem
ainda está pendente e medir o engajamento de cada campanha.

---

## 2. Conhecendo a tela

### 2.1 Seletor de Lote
Combobox no topo que lista os lotes no formato `Protocolo (SIGLA) — DD/MM/AAAA`
(ex.: *Ansiedade (BAI) — 30/05/2026*). Cada lote corresponde a um envio.

### 2.2 Resumo de adesão
Exibe o medidor (donut) com o **percentual** e o texto **"X de Y colaboradores responderam"** do
lote selecionado.

### 2.3 Tabela "Acompanhamento por Colaborador"

| Coluna | Conteúdo |
|--------|----------|
| **Colaborador** | Nome/identificação da pessoa |
| **Status** | *Respondido* ou *Pendente* |

### 2.4 Exportar
Botão **Exportar Excel** que gera o arquivo de relatório de adesão (CSV compatível com Excel).

---

## 3. Tarefas do dia a dia

### 3.1 Trocar de lote
1. Clique no seletor de **Lote**.
2. Escolha o lote desejado — o resumo (% e "X de Y") e a tabela são atualizados para aquele lote.

### 3.2 Ver quem respondeu / está pendente
Na tabela **Acompanhamento por Colaborador**, a coluna **Status** indica quem já respondeu
(*Respondido*) e quem falta (*Pendente*).

### 3.3 Exportar o relatório de adesão
1. Selecione o lote desejado.
2. Clique em **Exportar Excel**.
3. O arquivo `Relatorio_Adesao_<SIGLA>_<data>.csv` é baixado, com as colunas **Colaborador** e
   **Status** e uma linha por colaborador do lote.

---

## 4. Notas internas (equipe)

> Seção destinada à equipe técnica/QA — descreve o ambiente, não é necessária para o uso da tela.

- **Ambiente de validação:** sandbox em `https://sandbox-inbot-aurora.vercel.app/adesao`.
- **Export:** o arquivo é um CSV com BOM (abre direto no Excel) e separador `;`.
- **Cobertura automatizada:** suíte Playwright em `tests/adesao/` (inclui validação do conteúdo do
  CSV exportado). Panorama em [`docs/relatorio-cobertura-testes-aurora.md`](relatorio-cobertura-testes-aurora.md).


# 5. Métricas da IA

| | |
|---|---|
| **Tela** | Métricas da IA (Inteligência Artificial) |
| **Endereço** | `/metricas-ia` |
| **A quem se destina** | Gestão que acompanha o uso do assistente de IA pela organização |
| **O que permite fazer** | Consultar o volume de interações e usuários, e a evolução ao longo do tempo |

---

## 1. Visão geral

A tela **Métricas da IA** mostra como o assistente de inteligência artificial vem sendo usado:
quantas **interações** ocorreram, quantos **usuários** participaram e como esse uso **evoluiu** no
período escolhido.

---

## 2. Conhecendo a tela

### 2.1 Indicadores (KPIs)

| KPI | O que mostra |
|-----|--------------|
| **Volume de Interações** | Total de interações com a IA no período |
| **Quantidade de Usuários** | Número de usuários distintos que interagiram |

Cada KPI acompanha um selo de **variação** percentual.

### 2.2 Gráfico "Evolução de Interações"
Gráfico de **linha** que mostra a quantidade de interações ao longo dos dias do período
selecionado.

### 2.3 Seletor de período
Alternador com as opções **7 dias / 15 dias / 30 dias** — muda o recorte de tempo dos KPIs e do
gráfico.

---

## 3. Tarefas do dia a dia

### 3.1 Trocar o período de análise
1. Clique na opção desejada (**7 dias**, **15 dias** ou **30 dias**).
2. Os KPIs (Volume e Quantidade de Usuários) e o gráfico de evolução são recalculados para o novo
   recorte.

### 3.2 Ler a evolução
Passe o cursor sobre o gráfico de **Evolução de Interações** para ver os valores por dia.

---

## 4. Notas internas (equipe)

> Seção destinada à equipe técnica/QA — descreve o ambiente, não é necessária para o uso da tela.

- **Ambiente de validação:** sandbox em `https://sandbox-inbot-aurora.vercel.app/metricas-ia`.
- **Dados:** os KPIs e a série do gráfico vêm da API de métricas, com a quantidade de pontos
  proporcional ao período (7/15/30 dias).
- **Cobertura automatizada:** suíte Playwright em `tests/metricas-ia/`.
  Panorama em [`docs/relatorio-cobertura-testes-aurora.md`](relatorio-cobertura-testes-aurora.md).


# 6. Casos Graves

| | |
|---|---|
| **Tela** | Casos Graves |
| **Endereço** | `/casos-graves` |
| **A quem se destina** | Gestão/saúde ocupacional responsável por acompanhar e tratar casos de risco |
| **O que permite fazer** | Visualizar indicadores, gerenciar casos e registrar a tratativa (status, responsável, comentários) |

---

## 1. Visão geral

A tela **Casos Graves** é o centro de acompanhamento dos casos que requerem atenção imediata. Ela
começa como um **painel de indicadores** e dá acesso ao painel de **gestão de casos**, onde cada
caso pode ser tratado individualmente.

---

## 2. Conhecendo a tela

### 2.1 Painel inicial
- Três medidores (gauges): **Índice de Bem-Estar**, **Média Geral de Risco**, **Balança: Trabalho vs. Vida**.
- Card vermelho **Casos Graves** (contador + *"Requerem atenção imediata"*) com botão **Gerenciar Casos**.
- Acordeões de relatórios (Individuais, COPSOQ, Consolidados).

### 2.2 Painel "Gerenciar Casos"
Revelado ao clicar em **Gerenciar Casos**:
- **Filtro de Período:** Últimos 30 dias / Últimos 7 dias / Todo o histórico.
- **5 indicadores:** Casos Graves Identificados, Aguardando Ação, Em Tratativa, Concluídos, Arquivados.
- **2 gráficos:** *Status das Tratativas* (rosca) e *Origem dos Alertas* (barras).
- **Tabela "Detalhamento por Paciente":** Colaborador/Evento · Nível de Risco · Último Alerta · Status/Tratativa · **Ação** (botão **Gerenciar**).

### 2.3 Diálogo "Tratativa de Caso Grave"
Aberto pelo botão **Gerenciar** de uma linha:
- Dados do caso (nome, nível, data, descrição do alerta).
- **Status da Tratativa:** Aberto / Em Andamento / Concluído / Arquivado.
- **Responsável:** lista de responsáveis (ou *Ninguém atribuído*).
- **Histórico & Comentários:** linha do tempo + campo para **Comentar**.

---

## 3. Tarefas do dia a dia

### 3.1 Filtrar por período
No painel **Gerenciar Casos**, use o seletor de **Período** para alternar entre 7 dias, 30 dias ou
todo o histórico — os indicadores e a tabela se ajustam.

### 3.2 Abrir a tratativa de um caso
Na tabela **Detalhamento por Paciente**, clique em **Gerenciar** na linha do caso.

### 3.3 Atualizar status / responsável
1. No diálogo, selecione o novo **Status** e/ou o **Responsável**.
2. A alteração é registrada (a máquina de estados pode recusar transições inválidas de status).

### 3.4 Adicionar um comentário
1. Escreva no campo **"Adicionar um comentário..."**.
2. Clique em **Comentar** — o comentário entra no **Histórico** (registro append-only).

### 3.5 Fechar o diálogo
Use o **X** (canto superior) ou **Esc** para fechar e voltar à lista.

---

## 4. Notas internas (equipe)

> Seção destinada à equipe técnica/QA — descreve o ambiente, não é necessária para o uso da tela.

- **Ambiente de validação:** sandbox em `https://sandbox-inbot-aurora.vercel.app/casos-graves`.
- **Escritas:** mudança de status/responsável e comentário são confirmadas pela API; a leitura na
  tela pode refletir com pequeno atraso de propagação.
- **Cobertura automatizada:** suíte Playwright em `tests/casos-graves/` (UI) + contrato de API da
  tratativa. Panorama em [`docs/relatorio-cobertura-testes-aurora.md`](relatorio-cobertura-testes-aurora.md).


# 7. Relatórios Individuais

| | |
|---|---|
| **Tela** | Relatórios Individuais |
| **Endereço** | `/relatorios/individuais` |
| **A quem se destina** | Gestão/saúde ocupacional que analisa os resultados por protocolo clínico |
| **O que permite fazer** | Consultar os resultados das entrevistas individuais por protocolo (BAI, BHS, BDI, BSS) |

---

## 1. Visão geral

A tela **Relatórios Individuais** apresenta os resultados das entrevistas individuais, organizados
por **protocolo clínico**: Ansiedade (BAI), Desesperança (BHS), Depressão (BDI) e Ideação Suicida
(BSS). Para cada protocolo, mostra distribuições, perfil dos respondentes, casos de atenção e a
análise por pergunta.

---

## 2. Conhecendo a tela

### 2.1 Abas de protocolo
Quatro abas no topo: **BAI · BHS · BDI · BSS**. A aba ativa define qual protocolo está sendo
analisado.

### 2.2 Seções do relatório

| Seção | O que mostra |
|-------|--------------|
| **Filtros** | Recortes do relatório |
| **Distribuição por Nível** | Distribuição dos respondentes por faixa de severidade |
| **Perfil dos Respondentes** | Caracterização demográfica de quem respondeu |
| **Casos Moderados e Graves** | Destaque dos resultados que exigem atenção |
| **Análise (Detalhada) por Pergunta** | Resultado item a item do questionário |

> O protocolo BSS inclui ainda uma seção específica de **Tentativas Anteriores**.

---

## 3. Tarefas do dia a dia

### 3.1 Trocar de protocolo
Clique na aba do protocolo desejado (**BAI / BHS / BDI / BSS**) — o relatório recarrega com os
dados daquele protocolo.

### 3.2 Ler a distribuição e os casos de atenção
Use a seção **Distribuição por Nível** para a visão geral e **Casos Moderados e Graves** para
identificar quem precisa de acompanhamento.

### 3.3 Analisar por pergunta
Role até **Análise por Pergunta** para ver o desempenho item a item do questionário.

---

## 4. Notas internas (equipe)

> Seção destinada à equipe técnica/QA — descreve o ambiente, não é necessária para o uso da tela.

- **Ambiente de validação:** sandbox em `https://sandbox-inbot-aurora.vercel.app/relatorios/individuais`.
- **Navegação:** a troca de protocolo é feita pelas **abas** (a tela carrega por navegação interna
  da SPA).
- **Cobertura automatizada:** suíte Playwright em `tests/relatorios-individuais/` + contrato de API
  dos relatórios. Panorama em [`docs/relatorio-cobertura-testes-aurora.md`](relatorio-cobertura-testes-aurora.md).


# 8. Relatório COPSOQ

| | |
|---|---|
| **Tela** | Relatório COPSOQ (Entrevista Ocupacional) |
| **Endereço** | `/relatorios/copsoq` |
| **A quem se destina** | Gestão/saúde ocupacional que analisa os fatores psicossociais do trabalho |
| **O que permite fazer** | Consultar os indicadores e as dimensões do protocolo ocupacional COPSOQ |

---

## 1. Visão geral

O **Relatório COPSOQ** (Copenhagen Psychosocial Questionnaire) apresenta a avaliação dos **fatores
psicossociais do trabalho**. Reúne os indicadores-chave (bem-estar, risco e balança trabalho×vida)
e o detalhamento por dimensões, pontos fortes e pontos de atenção.

---

## 2. Conhecendo a tela

### 2.1 Indicadores (KPIs)

| KPI | O que mostra |
|-----|--------------|
| **Índice de Bem-Estar** | Bem-estar consolidado (escala 0–100) com rótulo qualitativo |
| **Média Geral de Risco** | Nível de risco (escala 1–5) com rótulo |
| **Balança: Trabalho vs. Vida** | Equilíbrio trabalho/vida (escala 1–5) |

### 2.2 Seções do relatório

| Seção | O que mostra |
|-------|--------------|
| **Distribuições Demográficas** | Perfil de quem respondeu |
| **Análise de Pontuações** | Resultados por dimensão |
| **Pontos Fortes** | Dimensões com melhor avaliação |
| **Pontos de Atenção** | Dimensões que requerem cuidado |
| **Análise de Risco por Grupos** | Risco segmentado por grupos |

---

## 3. Tarefas do dia a dia

### 3.1 Ler os indicadores
Os três KPIs no topo dão a leitura rápida; o ícone **?** explica cada escala.

### 3.2 Identificar pontos fortes e de atenção
Use as seções **Pontos Fortes** e **Pontos de Atenção** para priorizar ações; a **Análise de Risco
por Grupos** ajuda a localizar onde o risco se concentra.

---

## 4. Notas internas (equipe)

> Seção destinada à equipe técnica/QA — descreve o ambiente, não é necessária para o uso da tela.

- **Ambiente de validação:** sandbox em `https://sandbox-inbot-aurora.vercel.app/relatorios/copsoq`.
- **Dados:** indicadores e dimensões vêm da API de relatório COPSOQ.
- **Cobertura automatizada:** suíte Playwright em `tests/relatorios-copsoq/` + contrato de API.
  Panorama em [`docs/relatorio-cobertura-testes-aurora.md`](relatorio-cobertura-testes-aurora.md).


# 9. Resultados Consolidados

| | |
|---|---|
| **Tela** | Resultados Consolidados |
| **Endereço** | `/relatorios/consolidado` |
| **A quem se destina** | Gestão que precisa da visão geral consolidada de toda a organização |
| **O que permite fazer** | Consultar a participação, os indicadores e os resultados individuais consolidados, com exportação |

---

## 1. Visão geral

A tela **Resultados Consolidados** reúne, em um único painel, a leitura **agregada** de todos os
protocolos: taxa de participação, distribuição por níveis, indicadores gerais, casos graves e a
tabela com os resultados individuais — com opção de exportar.

---

## 2. Como acessar

A tela é aberta pela **Home** (ou pelo painel de Casos Graves): expanda **Resultados Consolidados**
e clique em **Visualizar Dashboard →**.

---

## 3. Conhecendo a tela

| Seção | O que mostra |
|-------|--------------|
| **Período** | Janela de datas real dos dados exibidos |
| **Taxa de Participação** | Participantes / total (ex.: 5/116) |
| **Níveis BAI / BHS** | Distribuição por faixa de severidade (gráficos de barras) |
| **Indicadores gerais** | Índice de Bem-Estar, Balança Trabalho × Vida |
| **Casos Graves** | Casos que requerem atenção |
| **Resultados Individuais** | Tabela: Colaborador · Protocolo · Score · Nível |

A tabela de resultados oferece **Exportar CSV**.

---

## 4. Tarefas do dia a dia

### 4.1 Ler a participação e os níveis
A **Taxa de Participação** mostra quantos responderam; os gráficos de **Níveis BAI/BHS** dão a
distribuição por severidade.

### 4.2 Exportar os resultados
Na tabela **Resultados Individuais**, clique em **Exportar CSV** para baixar o arquivo
(`resultados-consolidados.csv`).

---

## 5. Notas internas (equipe)

> Seção destinada à equipe técnica/QA — descreve o ambiente, não é necessária para o uso da tela.

- **Ambiente de validação:** sandbox em `https://sandbox-inbot-aurora.vercel.app/relatorios/consolidado`.
- **Acesso:** carregado por navegação interna (Home → Resultados Consolidados → Visualizar Dashboard).
- **Período:** a faixa exibida corresponde à janela real retornada pela API (datas em formato BR).
- **Cobertura automatizada:** suíte Playwright em `tests/relatorios-consolidado/` + contrato de API.
  Panorama em [`docs/relatorio-cobertura-testes-aurora.md`](relatorio-cobertura-testes-aurora.md).


# 10. Auditoria do Sistema

| | |
|---|---|
| **Tela** | Auditoria do Sistema |
| **Endereço** | `/auditoria` |
| **A quem se destina** | Gestão/segurança que precisa rastrear ações realizadas na plataforma |
| **O que permite fazer** | Consultar o histórico de eventos do sistema e buscar por usuário, ação ou recurso |

---

## 1. Visão geral

A tela **Auditoria do Sistema** registra o **histórico de ações** realizadas na plataforma —
quem fez o quê, quando e com qual resultado. É a trilha de auditoria usada para rastreabilidade e
conformidade.

---

## 2. Conhecendo a tela

### 2.1 Tabela de eventos

| Coluna | Conteúdo |
|--------|----------|
| **Data e Hora** | Momento do evento |
| **Usuário** | Quem realizou a ação |
| **Ação** | O que foi feito |
| **Recurso** | Sobre qual recurso/entidade |
| **Decisão** | Resultado (ex.: permitido/negado) |

### 2.2 Busca
Campo de busca que filtra o histórico por **usuário, ação ou recurso**.

---

## 3. Tarefas do dia a dia

### 3.1 Consultar o histórico
Abra `/auditoria` para ver os eventos mais recentes na tabela.

### 3.2 Localizar um evento
Digite no campo de busca o **usuário**, a **ação** ou o **recurso** desejado para filtrar a lista.

---

## 4. Notas internas (equipe)

> Seção destinada à equipe técnica/QA — descreve o ambiente, não é necessária para o uso da tela.

- **Ambiente de validação:** sandbox em `https://sandbox-inbot-aurora.vercel.app/auditoria`.
- **Acesso:** a consulta de registros depende da permissão de auditoria do perfil do usuário.
- **Cobertura automatizada:** estrutura da tela (título, colunas, busca) coberta pela suíte
  Playwright em `tests/auditoria/`; a listagem de dados é acompanhada por sentinelas automatizadas.
  Panorama em [`docs/relatorio-cobertura-testes-aurora.md`](relatorio-cobertura-testes-aurora.md).


# 11. Configurações

| | |
|---|---|
| **Tela** | Configurações (Visuais e de Sistema) |
| **Endereço** | `/configuracoes` |
| **A quem se destina** | Administradores que ajustam a identidade visual, integrações e campos da plataforma |
| **O que permite fazer** | Consultar e ajustar dados do bot, integração, interface, tabelas e campos de colaborador |

---

## 1. Visão geral

A tela **Configurações** concentra os ajustes da plataforma: identidade do bot, integração de
colaboradores, personalização da interface, status das tabelas de dados e os campos auxiliares
(departamentos e cargos) usados no cadastro de colaboradores.

---

## 2. Conhecendo a tela

### 2.1 Informações do Bot
Exibe o **BotID associado** e a **Intable API Key** (apresentada mascarada, ex.: `••••`).

### 2.2 Integração de Colaboradores
Controles da sincronização de colaboradores com a base de dados.

### 2.3 Personalizar Interface
Ajuste do **logo** e da **cor principal** da plataforma.

### 2.4 Tabelas de Dados

| Coluna | Conteúdo |
|--------|----------|
| **Nome** | Nome da tabela |
| **Existe** | Se a tabela está provisionada |
| **Ativa** | Se está ativa |
| **Registros** | Quantidade de registros |
| **Última Atualização** | Data da última atualização |

### 2.5 Campos de Colaborador
Gerência das listas de **departamentos** e **cargos**: campos *Novo departamento* / *Novo cargo*,
botões **Adicionar** e **Salvar**, e os chips existentes (cada um indica *"em uso por N colaboradores"*).

---

## 3. Tarefas do dia a dia

### 3.1 Conferir o status das tabelas de dados
Na seção **Tabelas de Dados**, veja se cada tabela existe, está ativa, quantos registros tem e
quando foi atualizada.

### 3.2 Personalizar a interface
Na seção **Personalizar Interface**, ajuste o logo e a cor principal e use **Salvar** para aplicar.

### 3.3 Gerenciar departamentos e cargos
1. Digite o nome em **Novo departamento** (ou **Novo cargo**).
2. Clique em **Adicionar**.
3. Use **Salvar** para confirmar a lista.

> Os chips mostram quantos colaboradores usam cada departamento/cargo (*"em uso por N colaboradores"*),
> ajudando a decidir o que pode ser removido.

---

## 4. Notas internas (equipe)

> Seção destinada à equipe técnica/QA — descreve o ambiente, não é necessária para o uso da tela.

- **Ambiente de validação:** sandbox em `https://sandbox-inbot-aurora.vercel.app/configuracoes`.
- **Cobertura automatizada:** estrutura e leitura cobertas pela suíte Playwright em
  `tests/configuracoes/` + contrato de API de configurações (leitura e escrita), com sentinelas
  para a persistência das escritas. Panorama em
  [`docs/relatorio-cobertura-testes-aurora.md`](relatorio-cobertura-testes-aurora.md).
