# Visão geral do sistema

## Nome e propósito

**Sistema Educacional — Padaria** é uma plataforma de ensino a distância (EAD) orientada a cursos modulares, com avaliações, medalhas (badges), minigames educativos, notificações e acompanhamento de desempenho. O objetivo é permitir que funcionários (alunos) consumam conteúdo e que gerentes criem e gerenciem cursos, usuários e mídias.

## Perfis de usuário

| Perfil | `tipo` (API) | Descrição |
|--------|--------------|-----------|
| Aluno / funcionário | `aluno` | Acessa dashboard, cursos, minigames, medalhas próprias, desempenho individual e configurações. |
| Gerente | `gerente` | Tudo do aluno, mais: gestão de usuários, criação de conteúdo (criação), medalhas, notificações, minigames (admin), mídias e visão geral de desempenhos. |

A distinção é aplicada no backend (middleware `role:gerente` em rotas específicas) e na interface (navegação condicional em `AppLayout`).

## Stack tecnológica

| Camada | Tecnologia |
|--------|------------|
| API | PHP **Laravel** (rotas em `routes/api.php`, prefixo `/api`) |
| Autenticação | **JWT** (`tymon/jwt-auth`), refresh silencioso no cliente |
| OAuth | **Laravel Socialite** (Google) |
| Banco de dados | Configurável (ex.: SQLite em dev, MySQL/MySQL em produção) |
| Frontend | **React 18 + TypeScript**, **Vite**, **React Router**, **TanStack Query** |
| UI | Tailwind CSS, componentes Radix/shadcn-style |
| Tempo real | **Laravel Echo** + **Pusher** (notificações em tempo real) |
| Notificações push | **Web Push** (VAPID), `laravel-notification-channels/webpush` |
| PWA | Service worker, manifest (ver `PWA_CHECKLIST_ANALISE.md`) |

## Repositório (monorepo)

- **Raiz**: backend Laravel (`app/`, `routes/`, `database/`, `public/`).
- **`frontend/padaria-educacao/`**: SPA; build gera assets em `dist/` ou deploy para hospedagem estática.

## URLs típicas

- API: `APP_URL` (ex.: `https://ead-api.exemplo.com`) — endpoints em `/api/...`.
- Frontend: `APP_FRONTEND_URL` / `VITE_API_BASE` — SPA servida separadamente ou em subpasta.

## Integrações externas

- **Google OAuth**: login social; redirecionamento após callback para o frontend com token.
- **Pusher**: broadcasting para painel de notificações.
- **Web Push**: notificações nativas no navegador/dispositivo.
