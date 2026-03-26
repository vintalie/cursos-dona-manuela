# Documentação — Sistema Educacional Padaria (EAD)

Esta pasta concentra a documentação técnica e de produto do monorepo (API Laravel + SPA React).

## Ordem de leitura sugerida

1. **[COMPILADO.md](COMPILADO.md)** — Ponto de entrada único: sumário e links para todos os documentos.
2. **[01-visao-geral.md](01-visao-geral.md)** — Contexto, perfis de usuário e stack.
3. **[02-requisitos.md](02-requisitos.md)** — Requisitos funcionais e não funcionais.
4. **[03-arquitetura.md](03-arquitetura.md)** — Camadas, integrações e diagramas.
5. **[04-modelo-dados.md](04-modelo-dados.md)** — Entidades Eloquent e diagrama ER.
6. **[05-api-rest.md](05-api-rest.md)** — Referência de rotas da API (`/api`).
7. **[06-frontend.md](06-frontend.md)** — Rotas SPA, páginas e serviços.
8. **[07-funcionalidades-por-modulo.md](07-funcionalidades-por-modulo.md)** — Matriz módulo × funcionalidades × telas.

## Documentos complementares (já existentes)

| Documento | Assunto |
|-----------|---------|
| [GOOGLE_OAUTH_SETUP.md](GOOGLE_OAUTH_SETUP.md) | Configuração do login com Google |
| [PWA_CHECKLIST_ANALISE.md](PWA_CHECKLIST_ANALISE.md) | Análise PWA |
| [PLANO_PROGRESSO_CONTEUDO.md](PLANO_PROGRESSO_CONTEUDO.md) | Plano de progresso de conteúdo |
| [../WEBPUSH-SETUP.md](../WEBPUSH-SETUP.md) | Web Push (VAPID, chaves) |

## Manutenção

- Ao alterar rotas, atualizar [`routes/api.php`](../routes/api.php) e sincronizar [`05-api-rest.md`](05-api-rest.md).
- Ao alterar rotas React, sincronizar [`src/App.tsx`](../frontend/padaria-educacao/src/App.tsx) e [`06-frontend.md`](06-frontend.md).
- O changelog do projeto está em [`../CHANGELOG.md`](../CHANGELOG.md).
