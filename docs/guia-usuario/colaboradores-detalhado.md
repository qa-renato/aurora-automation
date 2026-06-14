# Manual de Uso — Tela de Colaboradores

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
  [`docs/relatorio-testes-colaboradores.md`](../relatorio-testes-colaboradores.md).
