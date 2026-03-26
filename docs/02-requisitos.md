# Requisitos

## Requisitos funcionais (RF)

### Autenticação e perfil (RF-AUTH)

| ID | Descrição |
|----|-----------|
| RF-AUTH-01 | O usuário pode informar e-mail para verificar se já existe conta (fluxo em etapas). |
| RF-AUTH-02 | Login com e-mail e senha; emissão de JWT. |
| RF-AUTH-03 | Registro de novo usuário com nome, e-mail e senha. |
| RF-AUTH-04 | Login com Google (OAuth 2.0); criação ou vinculação de conta. |
| RF-AUTH-05 | Refresh de token JWT sem nova digitação de credenciais. |
| RF-AUTH-06 | Perfil: leitura e atualização (`/auth/me`), upload de avatar. |
| RF-AUTH-07 | Logout invalida sessão/token no servidor quando aplicável. |

### Cursos e conteúdo (RF-CURSO)

| ID | Descrição |
|----|-----------|
| RF-CURSO-01 | CRUD de cursos, módulos, lições, avaliações, perguntas e opções (via API). |
| RF-CURSO-02 | Categorias de curso: listagem, criação e exclusão. |
| RF-CURSO-03 | Matrícula/inscrição em curso (`enroll`). |
| RF-CURSO-04 | Conclusão de lição e de avaliação com registro de pontuação. |
| RF-CURSO-05 | Curso em destaque (`feature`). |
| RF-CURSO-06 | Dashboard agregado com dados do usuário logado. |

### Medalhas (RF-BADGE)

| ID | Descrição |
|----|-----------|
| RF-BADGE-01 | CRUD de medalhas (gerente). |
| RF-BADGE-02 | Visualização das medalhas do usuário (aluno). |
| RF-BADGE-03 | Atribuição automática conforme regras de negócio (serviço de badges). |

### Minigames (RF-GAME)

| ID | Descrição |
|----|-----------|
| RF-GAME-01 | Listagem e detalhe de jogos ativos; conclusão de sessão (`complete`). |
| RF-GAME-02 | Gerente: CRUD administrativo de jogos (`games/admin`, `POST/PUT/DELETE games`). |

### Mídias (RF-MEDIA)

| ID | Descrição |
|----|-----------|
| RF-MEDIA-01 | Upload, listagem com filtros, atualização e exclusão de mídias. |
| RF-MEDIA-02 | Categorias de mídia: listagem para todos; criar/excluir apenas gerente. |

### Notificações (RF-NOTIF)

| ID | Descrição |
|----|-----------|
| RF-NOTIF-01 | Listagem, marcar como lida, marcar todas, excluir todas. |
| RF-NOTIF-02 | Broadcast de notificação (gerente). |
| RF-NOTIF-03 | Relatório de “saiu sem concluir” (evento). |
| RF-NOTIF-04 | Push: chave VAPID pública, registro e remoção de subscription. |

### Desempenho (RF-PERF)

| ID | Descrição |
|----|-----------|
| RF-PERF-01 | Visão geral (gerente): `overview`. |
| RF-PERF-02 | Estatísticas por curso. |
| RF-PERF-03 | Desempenho do usuário logado e desempenho por usuário (para gerente). |

### Usuários (RF-USER)

| ID | Descrição |
|----|-----------|
| RF-USER-01 | Gerente: CRUD completo de usuários (`apiResource users`). |

---

## Requisitos não funcionais (RNF)

| ID | Categoria | Descrição |
|----|-----------|-----------|
| RNF-SEG-01 | Segurança | API protegida por JWT; rotas sensíveis exigem `auth:api`. |
| RNF-SEG-02 | Segurança | Operações exclusivas de gerente exigem middleware `role:gerente`. |
| RNF-SEG-03 | Segurança | Senhas armazenadas com hash (Laravel). |
| RNF-SEG-04 | Segurança | OAuth Google com redirect URI configurável; uso de HTTPS em produção. |
| RNF-INT-01 | Integração | CORS configurável para origem do frontend (`config/cors.php`). |
| RNF-DISP-01 | Disponibilidade | Frontend SPA com cache de usuário e refresh de token para resiliência a falhas de rede. |
| RNF-PERF-01 | Performance | Uso de índices no BD; cache/queue configuráveis (Laravel). |
| RNF-UX-01 | UX | PWA (offline parcial), indicador de offline; notificações em tempo real quando conectado. |
| RNF-MAN-01 | Manutenção | Migrations e seeders para evolução do schema. |
| RNF-DOC-01 | Documentação | Markdown em `docs/`; changelog em `CHANGELOG.md`. |

---

## Rastreabilidade (fonte)

| Área | Onde está implementado |
|------|-------------------------|
| Rotas API | `routes/api.php` |
| Papéis | `App\Http\Middleware\CheckRole`, policies onde existirem |
| Frontend | `frontend/padaria-educacao/src/App.tsx`, `AuthContext`, `AppLayout` |
