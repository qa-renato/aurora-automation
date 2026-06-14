# 📚 Documentação — Aurora

Central de documentação da plataforma **Aurora** (saúde mental e bem-estar ocupacional).

## 🧭 Por público

### 💼 Comercial
- [Apresentação Comercial](apresentacao-comercial-aurora.md) · [PDF](apresentacao-comercial-aurora.pdf)
  Proposta de valor, recursos, base científica e benefícios para apresentação de vendas.

### 👤 Usuário final
- [Guia do Usuário](guia-usuario/README.md) · [PDF único](guia-usuario-aurora.pdf)
  Como usar cada rotina (com capturas de tela): Home, Colaboradores, Pedidos, Adesão, Métricas IA, Casos Graves, Relatórios, Auditoria, Configurações.

### 🛠️ Técnica
- [Documentação Técnica](documentacao-tecnica/README.md) · [PDF único](documentacao-tecnica-aurora.pdf)
  Arquitetura, [Autenticação e RBAC](documentacao-tecnica/autenticacao-rbac.md), [Referência de API](documentacao-tecnica/api-reference.md) e [Comportamentos/limitações](documentacao-tecnica/comportamentos-e-limitacoes.md).

### 📊 Gestão / QA
- [Relatório Gerencial de QA](relatorio-gerencial-aurora.md)
  Cobertura de testes automatizados, confiabilidade e status dos bugs.
- [Relatório QA geral (E2E)](relatorio-qa-geral-2026-06-10.md) · [Apresentação da automação](apresentacao-automacao-aurora.md)

## 🗂️ Estrutura
```
docs/
├── README.md                          ← você está aqui
├── apresentacao-comercial-aurora.md / .pdf
├── guia-usuario/                      (índice + 1 página por rotina + img/)
├── guia-usuario-aurora.pdf
├── documentacao-tecnica/             (README, auth-rbac, api-reference, comportamentos)
├── documentacao-tecnica-aurora.pdf
├── relatorio-gerencial-aurora.md
├── relatorio-qa-geral-2026-06-10.md
└── apresentacao-automacao-aurora.md
```

> Os testes automatizados (Playwright + contratos de API) ficam em `tests/` — ver a PR da suíte.
