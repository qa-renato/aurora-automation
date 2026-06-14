# 📊 Relatório Gerencial — Qualidade (QA) do Projeto Aurora
**Atualizado:** 13/06/2026 · **Responsável:** QA

## 1. Resumo executivo
A automação do Aurora evoluiu para um **sistema de verificação contínua em duas camadas** — telas (interface) e dados (API). Hoje são **mais de 250 verificações automáticas** cobrindo **todas as telas** e **todas as APIs de produto** (leitura e escrita). Nesta fase, o time de desenvolvimento corrigiu um lote de problemas e a automação **confirmou objetivamente o que já está no ar** (fechamos vários cards com evidência), além de **descobrir novos problemas** — vários na camada de API, que não apareciam só olhando a tela.

## 2. O que é o Playwright (em uma frase)
Ferramenta que **simula um usuário real usando o sistema** e também **consulta o sistema de dados diretamente**, rodando centenas de checagens em minutos, sempre que precisarmos.

## 3. O que está automatizado
| Frente | Cobertura |
|--------|-----------|
| **Telas** | Colaboradores, Relatórios (Individuais/COPSOQ/Consolidado), Casos Graves, Pedidos, Métricas, Adesão, Auditoria, Home, Configurações, Login |
| **APIs (dados)** | **Completa** — leitura e escrita de Colaboradores, Configurações, Pedidos e Tratativa de Casos Graves; relatórios; permissões por perfil (RBAC) |
| **Radar de correções** | Confirma automaticamente quando uma correção entra no ar |

> A camada de API roda em **segundos** (vs. ~horas da bateria de telas) e é mais estável — ideal para rodar a cada nova versão.

## 4. Confiabilidade
- ✅ **Detecção de regressão** e **radar de deploy** — cada problema conhecido tem um "sentinela" que vira verde sozinho quando corrigido.
- ✅ **Cobertura de API completa** — pega na origem bugs de contrato/permissão que a tela esconde.
- ⚠️ **Transparência:** o ambiente de testes (sandbox) é lento/instável (bateria completa de telas ~2h, em avaliação) e algumas gravações dependem de uma sincronização demorada do ambiente — esses casos ficam marcados como "pendentes de ambiente", não como falha.

## 5. ✅ Corrigidos e confirmados nesta fase (cards fechados)
Verificados pela automação: **período dos relatórios**, **análise por pergunta do BHS**, **mensagem de CPF inválido**, **busca volta à 1ª página**, **importação com CPF sem máscara não derruba mais o sistema**, **select de departamento**, **cards de indicadores**, **responsividade no mobile**, **rótulos de KPI**, **comentário da tratativa** e **Home/Dashboard**. *(11 cards encerrados nesta fase.)*

## 6. 🐞 Problemas em aberto (principais, por impacto)
**🔴 Alto**
- Lista de Colaboradores mostra só ~50 de ~150 ativos (#698) · Auditoria não funciona (acesso negado pelo servidor mesmo com permissão) (#688) · Variação (%) das Métricas da IA é fabricada (#687) · Colaborador recém-criado some da busca (#680).

**🟠 Médio**
- **Salvar Configurações não persiste** (retorna sucesso, mas nada muda) (#700) · Relatórios: rótulo "Ansiedade" fixo (#696), Balança sem status (#689), gráficos fora do padrão aprovado (#692/#693), link de relatório não respeita o protocolo ao recarregar (#695) · Filtro de "ativos" da API vazio (#697) · Validações de pedidos retornam status errado (#701) · Data de nascimento válida recusada (#497).

**🟡 Baixo**
- Botões "Adicionar/Salvar" encavalados em Configurações (#699) · Adesão sem paginação/itens-por-página (#502/#503) · ajustes visuais (ícones, tooltips, hover).

## 7. Recomendações
1. **Priorizar alto impacto** (#698, #688, #687, #680) e o **"Salvar" da Configuração** (#700) — afetam uso e confiança nos dados.
2. **Publicar o lote já corrigido** que ainda não está no ar (gráficos, fechar diálogo, hover) — o radar confirma em segundos.
3. **Estabilizar o ambiente de testes** para acelerar a bateria e liberar as gravações pendentes.

---
*Issues abertas nesta fase: #695–#701. Cards fechados (verificados): 11. Detalhes técnicos e cobertura: suíte `aurora-automation` (PR #1).*
