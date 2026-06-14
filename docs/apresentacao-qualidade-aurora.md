# 🎯 Apresentação — Qualidade e Cobertura de Testes do Aurora

**Público:** time gerencial · **Objetivo:** explicar, sem tecnês, como está a qualidade da plataforma
**Formato sugerido:** ~11 slides

---

## Slide 1 — Capa
- **Título:** Qualidade e Cobertura de Testes — Plataforma Aurora
- **Subtítulo:** Visão de gestão · Responsável: QA
- *Mensagem:* "Como garantimos que o Aurora funciona antes de chegar ao usuário."

## Slide 2 — O problema que resolvemos
- Toda mudança no sistema pode quebrar algo que já funcionava.
- Testar tudo manualmente, a cada versão, é inviável (lento e sujeito a falha humana).
- *Mensagem:* "Precisamos de uma forma rápida, confiável e repetível de validar a plataforma."

## Slide 3 — O que é o Playwright (sem tecnês)
- Uma ferramenta que **simula uma pessoa usando o sistema de verdade** no navegador — clica, digita e confere o que aparece na tela.
- Também **consulta os dados direto na fonte**, para garantir que os números estão corretos.
- Roda **centenas de verificações em minutos**, sempre que precisarmos.
- *Analogia:* "É como ter um time de testadores incansável que revisa o sistema inteiro em poucos minutos."

## Slide 4 — Cobertura hoje (o número-chave)
- **274 cenários automatizados** validando o Aurora.
- Em duas camadas:
  - **190 na interface** — o que o usuário vê e faz, nas 11 telas.
  - **68 nos dados / APIs** — a "fonte" por trás das telas.
- *Mensagem:* "As 11 telas da plataforma estão cobertas e aprovadas."

## Slide 5 — Cobertura por tela
- As **11 telas** estão cobertas: Colaboradores, Pedidos, Casos Graves, Relatórios (Individuais, COPSOQ, Consolidados), Configurações, Adesão, Métricas da IA, Home e Auditoria.
- As áreas mais críticas (Colaboradores e Pedidos) são as mais testadas.
- *Mensagem:* "Cobertura ampla — nenhuma tela ficou de fora."

## Slide 6 — Testes de dados (APIs), em linguagem simples
- Além de olhar a tela, verificamos **os dados na origem**: se vêm completos, no formato certo e se **só quem tem permissão acessa**.
- Por que importa: alguns erros **não aparecem na tela**, só nos dados — e esses testes os pegam.
- Bônus: rodam em **segundos** (vs. minutos da interface).
- *Mensagem:* "Testamos a fachada E o alicerce."

## Slide 7 — Confiabilidade (sem falso alarme)
- Cada problema conhecido tem um **monitor automático** que avisa quando é corrigido — fica "verde" sozinho.
- Os testes se **adaptam ao ambiente**, então a instabilidade do ambiente de testes não vira alarme falso.
- *Mensagem:* "Quando um teste acusa, é problema de verdade — não ruído."

## Slide 8 — Documentação entregue
- **Guia do Usuário** — manual completo, tela por tela (como usar o sistema).
- **Documentação Técnica** — para o time de desenvolvimento.
- **Apresentação Comercial** — proposta de valor para vendas.
- **Relatório de Cobertura** — este panorama, sempre atualizável.
- *Mensagem:* "Conhecimento registrado e acessível — não na cabeça de uma única pessoa."

## Slide 9 — Situação atual da qualidade
- As 11 telas estão **estáveis e aprovadas**.
- Há **bugs mapeados e monitorados** — os de maior impacto estão em **Auditoria**, **Configurações** e **Relatórios**.
- Cada um é acompanhado automaticamente: quando corrigido, o sistema confirma sozinho.
- *Mensagem:* "Sabemos exatamente o que falta e acompanhamos a evolução."

## Slide 10 — Futuras melhorias
- **Execução automática contínua:** rodar os testes sozinho a cada nova versão.
- **Cobrir o que hoje é manual:** ampliar para os poucos itens visuais / de ambiente ainda não automatizados.
- **Relatórios automáticos** de qualidade para a gestão.
- **Estabilizar o ambiente de testes** para acelerar a bateria completa.
- *Mensagem:* "A base está sólida; o próximo passo é automatizar o acompanhamento de ponta a ponta."

## Slide 11 — Fechamento
- **Em uma frase:** "Cobertura ampla, em duas camadas, com 274 verificações automáticas — qualidade acompanhada de forma contínua e transparente."
- Espaço para perguntas.

---

## Dicas de condução
- **Abra pelo valor** (slides 2–3), não pelos números — gestão compra "segurança e previsibilidade".
- Use **uma analogia forte**: Playwright = time de testadores incansável.
- No slide de bugs, enquadre como **controle** ("sabemos e acompanhamos"), não como problema.
- Tenha à mão o **Relatório de Cobertura** (documento de apoio com os números detalhados).
