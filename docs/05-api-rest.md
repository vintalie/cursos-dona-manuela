# API REST

Base URL: `{APP_URL}/api` (ex.: `https://seudominio.com/api`).

**Autenticação**: header `Authorization: Bearer {token}` nas rotas protegidas, exceto onde indicado.

Legenda de middleware:

- **—** = público ou fluxo especial (sem JWT na requisição inicial).
- **`auth`** = `auth:api` (JWT válido).
- **`gerente`** = `auth:api` + `role:gerente`.

---

## Auth (`/api/auth`)

| Método | Caminho | Middleware | Descrição |
|--------|---------|------------|-----------|
| POST | `/auth/check-email` | — | Verifica se e-mail já está cadastrado. |
| POST | `/auth/register` | — | Registro. |
| POST | `/auth/login` | — | Login; retorna JWT. |
| POST | `/auth/refresh` | — | Renova token (aceita token expirado no fluxo). |
| GET | `/auth/google` | `web` | Redireciona para Google OAuth. |
| GET | `/auth/google/callback` | `web` | Callback OAuth; redireciona ao frontend. |
| GET | `/auth/me` | auth | Dados do usuário logado. |
| PUT | `/auth/me` | auth | Atualiza perfil. |
| POST | `/auth/avatar` | auth | Upload de avatar. |
| POST | `/auth/logout` | auth | Logout. |

---

## Usuários (apenas gerente)

`apiResource('users', UserController::class)` → `/api/users`

| Método | Caminho | Middleware |
|--------|---------|------------|
| GET | `/users` | gerente |
| POST | `/users` | gerente |
| GET | `/users/{user}` | gerente |
| PUT/PATCH | `/users/{user}` | gerente |
| DELETE | `/users/{user}` | gerente |

---

## Cursos e categorias

| Método | Caminho | Middleware | Descrição |
|--------|---------|------------|-----------|
| * | `/courses` | auth | `apiResource` — CRUD de cursos. |
| POST | `/courses/{course}/feature` | auth | Alterna destaque. |
| POST | `/courses/{course}/enroll` | auth | Inscrição no curso. |
| POST | `/courses/{course}/lessons/{lesson}/complete` | auth | Conclui lição. |
| POST | `/courses/{course}/assessments/{assessment}/complete` | auth | Conclui avaliação. |
| GET | `/categories` | auth | Lista categorias. |
| POST | `/categories` | auth | Cria categoria. |
| DELETE | `/categories/{category}` | auth | Remove categoria. |

---

## Módulos, lições, avaliações, perguntas, opções

Cada recurso usa `apiResource` com prefixo `/api`:

| Recurso | Prefixo | Métodos |
|---------|---------|---------|
| modules | `/modules` | GET, POST, GET/{id}, PUT/PATCH, DELETE |
| lessons | `/lessons` | idem |
| assessments | `/assessments` | idem |
| questions | `/questions` | idem |
| options | `/options` | idem |

**Middleware**: `auth` para todas.

---

## Dashboard e medalhas

| Método | Caminho | Middleware |
|--------|---------|------------|
| GET | `/dashboard` | auth |
| * | `/badges` | auth | `apiResource` — CRUD de medalhas (policies podem restringir ações). |

---

## Notificações

| Método | Caminho | Middleware |
|--------|---------|------------|
| GET | `/notifications` | auth |
| POST | `/notifications/read-all` | auth |
| DELETE | `/notifications` | auth |
| POST | `/notifications/{notification}/read` | auth |
| POST | `/notifications/report-left-incomplete` | auth |
| POST | `/notifications/broadcast` | auth |

---

## Push (Web Push)

| Método | Caminho | Middleware |
|--------|---------|------------|
| GET | `/push-subscriptions/vapid-public-key` | auth |
| GET | `/push-subscriptions/debug` | auth |
| POST | `/push-subscriptions` | auth |
| DELETE | `/push-subscriptions` | auth |

---

## Jogos (minigames)

| Método | Caminho | Middleware |
|--------|---------|------------|
| GET | `/games` | auth |
| GET | `/games/{game}` | auth |
| POST | `/games/{game}/complete` | auth |
| GET | `/games/admin` | gerente |
| POST | `/games` | gerente |
| PUT | `/games/{game}` | gerente |
| DELETE | `/games/{game}` | gerente |

---

## Mídias

| Método | Caminho | Middleware |
|--------|---------|------------|
| GET | `/media` | auth |
| POST | `/media` | auth |
| PATCH | `/media/{media}` | auth |
| DELETE | `/media/{media}` | auth |
| GET | `/media-categories` | auth |
| POST | `/media-categories` | gerente |
| DELETE | `/media-categories/{mediaCategory}` | gerente |

---

## Desempenho

| Método | Caminho | Middleware |
|--------|---------|------------|
| GET | `/performance/overview` | auth |
| GET | `/performance/course/{course}` | auth |
| GET | `/performance/me` | auth |
| GET | `/performance/user/{user}` | auth |

---

## Health

| Método | Caminho | Descrição |
|--------|---------|-----------|
| GET | `/up` | Health check (Laravel; fora do prefixo `api` em `bootstrap/app.php`). |

---

## Documentação complementar

- Artefatos **Scribe** em `.scribe/` (se o pacote estiver configurado e a documentação gerada).
- Variáveis de ambiente: [`../.env.example`](../.env.example).
