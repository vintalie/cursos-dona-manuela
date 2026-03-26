# Frontend (SPA)

**Pasta**: `frontend/padaria-educacao/`.

## Rotas React (`src/App.tsx`)

| Rota | Componente | Observação |
|------|------------|------------|
| `/`, `/login` | `Login` | Público. |
| `/dashboard` | `Dashboard` | Autenticado; aluno/gerente. |
| `/cursos` | `Courses` | Lista de cursos. |
| `/curso/:id` | `CourseLearning` | Sem layout lateral (rota dedicada). |
| `/minhas-medalhas` | `MyBadges` | |
| `/minigames` | `Minigames` | |
| `/minigame/play/:id` | `MinigamePlayer` | Standalone (ex.: iframe). |
| `/meu-desempenho` | `UserPerformance` | Próprio usuário. |
| `/configuracoes` | `Settings` | |
| `/usuarios` | `Users` | UI gerente. |
| `/usuarios/:id/editar` | `EditUser` | |
| `/medalhas` | `BadgesManager` | |
| `/notificacoes` | `NotificationsManager` | |
| `/criacao` | `ManagerDashboard` | Criação de conteúdo. |
| `/minigames-gerente` | `MinigamesManager` | |
| `/midias` | `MediaManager` | |
| `/desempenhos` | `Performance` | Visão geral gerente. |
| `/desempenhos/:id` | `UserPerformance` | Desempenho por usuário. |
| `*` | `NotFound` | |

Todas as rotas exceto `/`, `/login` e `*` estão sob `PrivateRoute` (redireciona para `/` se não autenticado).

**Papéis**: não há `requiredRole` no `PrivateRoute` por padrão; a navegação principal troca itens quando `isGerente` é verdadeiro (`AppLayout`). A API ainda bloqueia ações de gerente se o usuário não for gerente.

## Serviços (`src/services/`)

| Arquivo | Domínio |
|---------|---------|
| `api.ts` | Cliente HTTP (axios), base URL, interceptors JWT/refresh. |
| `auth.service.ts` | Login, registro, check-email, Google URL, me, perfil. |
| `course.service.ts` | Cursos, matrícula, conclusões. |
| `module.service.ts` | Módulos. |
| `lesson.service.ts` | Lições. |
| `assessment.service.ts` | Avaliações. |
| `question.service.ts` | Perguntas. |
| `option.service.ts` | Opções. |
| `category.service.ts` | Categorias. |
| `user.service.ts` | CRUD usuários. |
| `dashboard.service.ts` | Dashboard. |
| `badge.service.ts` | Medalhas. |
| `notification.service.ts` | Notificações. |
| `push.service.ts` | Web Push. |
| `game.service.ts` | Jogos (aluno). |
| `game.admin.service.ts` | Jogos (gerente). |
| `media.service.ts` | Mídias e categorias. |
| `performance.service.ts` | Desempenho. |

## Contextos e hooks relevantes

- `AuthContext`: token, usuário, `isGerente`, `loginStore`, logout.
- `AlertPopupContext`: alertas globais (`showAlert`).
- `useDocumentTitle`: títulos de página.

## Build e variáveis

- `VITE_API_BASE` — base da API.
- `VITE_PUSHER_*`, `VITE_VAPID_PUBLIC_KEY` — tempo real e push (ver `.env.example`).
