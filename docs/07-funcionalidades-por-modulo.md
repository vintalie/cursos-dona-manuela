# Funcionalidades por módulo

Matriz resumida: **módulo** → **funcionalidades** → **telas / API**.

## Autenticação e conta

| Funcionalidade | Telas | Endpoints principais |
|----------------|-------|----------------------|
| Fluxo e-mail → senha ou cadastro | `Login` | `POST /auth/check-email`, `/auth/login`, `/auth/register` |
| Login Google | `Login` | `GET /auth/google`, callback |
| Perfil e avatar | `Settings` | `GET/PUT /auth/me`, `POST /auth/avatar` |
| Sessão persistente / refresh | (global) | `POST /auth/refresh`, `POST /auth/logout` |

## Cursos e aprendizado

| Funcionalidade | Telas | Endpoints principais |
|----------------|-------|----------------------|
| Listar e navegar cursos | `Courses`, `Dashboard` | `GET /courses`, `/dashboard` |
| Consumir curso (módulos, lições, avaliações) | `CourseLearning` | `GET /courses/{id}`, `POST .../enroll`, `.../complete` |
| Criação de cursos, matérias, aulas, avaliações | `ManagerDashboard` (formulários) | `apiResource` courses, modules, lessons, assessments, questions, options |
| Categorias | `ManagerDashboard` | `GET/POST/DELETE /categories` |

## Medalhas

| Funcionalidade | Telas | Endpoints principais |
|----------------|-------|----------------------|
| Gerenciar medalhas | `BadgesManager` | `apiResource /badges` |
| Ver minhas medalhas | `MyBadges` | Dados de usuário / badges |

## Minigames

| Funcionalidade | Telas | Endpoints principais |
|----------------|-------|----------------------|
| Jogar minigames | `Minigames`, `MinigamePlayer` | `GET /games`, `GET /games/{id}`, `POST .../complete` |
| CRUD minigames | `MinigamesManager` | `GET /games/admin`, `POST/PUT/DELETE /games` |

## Mídias

| Funcionalidade | Telas | Endpoints principais |
|----------------|-------|----------------------|
| Biblioteca e upload | `MediaManager` | `GET/POST/PATCH/DELETE /media`, categorias |
| Seletor de mídia no editor | componentes (WYSIWYG) | `GET /media` |

## Notificações

| Funcionalidade | Telas | Endpoints principais |
|----------------|-------|----------------------|
| Painel e lista | `NotificationPanel` (layout), `NotificationsManager` | `GET /notifications`, marcar lidas, broadcast |
| Push | popup / `push.service` | `push-subscriptions`*, VAPID |

## Desempenho

| Funcionalidade | Telas | Endpoints principais |
|----------------|-------|----------------------|
| Meu desempenho | `UserPerformance` | `GET /performance/me` |
| Visão gerente / por colaborador | `Performance`, `UserPerformance` | `GET /performance/overview`, `/performance/user/{id}`, `/performance/course/{id}` |

## Usuários (gerente)

| Funcionalidade | Telas | Endpoints principais |
|----------------|-------|----------------------|
| Listar e editar usuários | `Users`, `EditUser` | `apiResource /users` |

## Infraestrutura de UI

| Funcionalidade | Onde |
|----------------|------|
| Layout, sidebar, notificações | `AppLayout` |
| Offline / PWA | `OfflineIndicator`, `PWAUpdatePrompt`, `sw.ts` |
| Loading global | `PageLoader`, `Suspense` |
