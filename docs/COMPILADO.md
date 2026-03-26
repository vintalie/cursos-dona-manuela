# Documentação compilada — Sistema Educacional Padaria (EAD)

## Sumário executivo

O **Sistema Educacional Padaria** é uma plataforma EAD composta por uma **API REST Laravel** (autenticação JWT, OAuth Google, notificações, Web Push, minigames e gestão de cursos) e uma **SPA React** (Vite, TypeScript, PWA). Esta página é o **índice mestre**: reúne links para todos os documentos canônicos da pasta `docs/` e materiais de apoio na raiz do repositório, sem duplicar o conteúdo técnico (manutenção em um único lugar por tópico).

---

## Índice — documentação principal (numerada)

| # | Documento | Conteúdo |
|---|-----------|----------|
| — | [README.md](README.md) | Índice da pasta `docs/` e ordem de leitura |
| 01 | [01-visao-geral.md](01-visao-geral.md) | Produto, perfis, stack, integrações |
| 02 | [02-requisitos.md](02-requisitos.md) | Requisitos funcionais e não funcionais |
| 03 | [03-arquitetura.md](03-arquitetura.md) | Camadas, middleware, diagrama Mermaid |
| 04 | [04-modelo-dados.md](04-modelo-dados.md) | Entidades Eloquent e diagrama ER |
| 05 | [05-api-rest.md](05-api-rest.md) | Rotas `/api` agrupadas por domínio |
| 06 | [06-frontend.md](06-frontend.md) | Rotas React, páginas, serviços |
| 07 | [07-funcionalidades-por-modulo.md](07-funcionalidades-por-modulo.md) | Matriz módulo × funcionalidades × telas |

---

## Documentação temática (existente)

| Documento | Assunto |
|-----------|---------|
| [GOOGLE_OAUTH_SETUP.md](GOOGLE_OAUTH_SETUP.md) | Login com Google (Google Cloud, URLs) |
| [PWA_CHECKLIST_ANALISE.md](PWA_CHECKLIST_ANALISE.md) | Checklist e análise PWA |
| [PLANO_PROGRESSO_CONTEUDO.md](PLANO_PROGRESSO_CONTEUDO.md) | Plano de progresso de conteúdo |
| [WEBPUSH-SETUP.md](../WEBPUSH-SETUP.md) | Chaves VAPID e configuração Web Push |

---

## Projeto e histórico

| Recurso | Link |
|---------|------|
| README raiz (instalação e deploy) | [../README.md](../README.md) |
| Changelog | [../CHANGELOG.md](../CHANGELOG.md) |
| Rotas API (fonte) | [`../routes/api.php`](../routes/api.php) |
| Rotas SPA (fonte) | [`../frontend/padaria-educacao/src/App.tsx`](../frontend/padaria-educacao/src/App.tsx) |

---

## Documentação gerada (opcional)

- Pastas **`.scribe/`** no repositório podem conter endpoints gerados pelo Scribe, se estiver em uso — complementam [05-api-rest.md](05-api-rest.md).

---

*Última atualização deste índice: alinhada à estrutura de documentação do repositório (criação do pacote docs numerado + README raiz).*
