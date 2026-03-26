# Changelog

## [2026-03-26]

### Added
- **Documentação do projeto**: pacote em `docs/` com visão geral, requisitos (funcionais e não funcionais), arquitetura (diagramas Mermaid), modelo de dados, referência da API REST, frontend (rotas e serviços), matriz de funcionalidades por módulo
- **`docs/COMPILADO.md`**: índice mestre com links para todos os documentos e materiais existentes (OAuth, PWA, Web Push)
- **`docs/README.md`**: índice da pasta e ordem de leitura
- **`README.md` (raiz)**: substituído o texto padrão do Laravel por guia do produto (instalação local, deploy, links para documentação)

## [2026-03-19]

### Fixed
- **Login (Chrome)**: borda/outline dos inputs e botões cortados à esquerda
  - Removido `overflow-x: hidden` do html (substituído por `auto`)
  - `.login-slide-wrap`: `overflow: visible` e `padding: 0 6px`
  - `.login-box`: `overflow: visible` e `margin: 0 4px`
  - Inputs e botões: `outline-offset: 2px` para focus visível sem corte

### Added
- **Bloque HTML no WYSIWYG**: botão "html" na toolbar permite inserir HTML customizado com suporte a `<script>` e `<style>`
  - `HtmlBlockBlot`: renderização em iframe (`srcdoc`) para isolamento e execução segura de scripts
  - `HtmlInsertDialog`: modal com textarea para colar/editar HTML
  - Ícone `</>` no botão da toolbar

### Changed
- **URLs padrão**: substituídas variáveis localhost por URLs de produção
  - `localhost` → `https://ead-api.dcmmarketingdigital.com.br` (API)
  - `localhost:8080` → `https://ead.dcmmarketingdigital.com.br` (frontend)
  - Arquivos: `.env.example`, `config/app.php`, `config/cors.php`, `config/filesystems.php`, `config/mail.php`, `AuthController`, `DevEnvironmentServiceProvider`, `api.ts`, `auth.service.ts`, `echo.ts`, `vite.config.ts`

### Added
- **Sistema de registro de usuário**
  - Fluxo em etapas na tela de login: usuário insere e-mail → se existe, mostra campo de senha; se não existe, mostra formulário de registro (nome, e-mail pré-preenchido, senha)
  - Backend: `POST /api/auth/check-email` para verificar se e-mail está cadastrado
  - Registro via API permite `tipo` opcional (padrão: `aluno`)
- **Login com Google (OAuth 2.0)**
  - Botão "Entrar com Google" na tela de login
  - Backend: Laravel Socialite, rotas `GET /api/auth/google` e `GET /api/auth/google/callback`
  - Usuários novos via Google são criados automaticamente como `aluno`
  - Usuários existentes podem vincular conta Google (atualiza `google_id`)
  - Migration: coluna `google_id` e `password` nullable para usuários OAuth
- **Documentação**: `docs/GOOGLE_OAUTH_SETUP.md` com passo a passo para gerar chaves no Google Cloud Console

### Changed
- `AuthController`: login retorna erros específicos (`user_not_found`, `google_account`, `password_incorrect`)
- `api.ts`: usa `VITE_API_BASE` do ambiente quando disponível

---

## [2026-03-15]

### Fixed
- **Sidebar desktop**: barra de notificações e painel do usuário (logout, configurações) agora permanecem fixos na tela quando o conteúdo da página é longo; sidebar usa `position: sticky` e `height: 100vh` em telas ≥769px

---

## [2026-03-14]

### Added
- **Media upload system**
  - Backend: `MediaController` and `MediaCategoryController` routes (`/api/media`, `/api/media-categories`)
  - MediaController: `source` filter (gerente|aluno) to filter by user tipo; `update` method (PATCH) for `media_category_id`
  - AuthController: `POST /api/auth/avatar` for avatar upload (multipart, images only); creates Media record and sets `user.avatar`
  - Frontend: `media.service.ts` (uploadFile, listMedia, getMediaCategories, createMediaCategory, updateMedia, resolveMediaUrl)
  - `MediaPickerDialog`: popup with type/source/category filters, grid of media items, select button
  - `UrlFieldWithPicker`: input + button to open MediaPicker filtered by type
  - WysiwygEditor: "media" custom button opens MediaPicker; inserts img/video/audio/link based on type
  - BadgesManager: `long_description` uses WysiwygEditor; image URL uses UrlFieldWithPicker
  - Settings: avatar replaced with styled file upload (image only); uploads via auth avatar endpoint
  - MediaManager page (`/midias`): list media with filters, category management, upload; gerente-only
  - Sidebar: "Mídias" link for gerente (in "Mais" menu)
  - API base: `resolveMediaUrl()` prepends `VITE_API_BASE` for relative URLs (e.g. `/storage/...`)

### Changed
- `api.ts`: uses `VITE_API_BASE` env var; exports `getApiBase` and `resolveMediaUrl`
- MediaCategoryPolicy: `viewAny` returns true for all authenticated users (for MediaPicker)

---

## [2026-03-13]

### Added
- **Persistent login**: users now stay logged in until they explicitly click logout
  - JWT token TTL increased from 60 minutes to 30 days (`JWT_TTL=43200`)
  - JWT refresh window increased to 90 days (`JWT_REFRESH_TTL=129600`)
  - New backend endpoint `POST /api/auth/refresh` to silently renew expired tokens
  - `api.ts`: automatic silent token refresh on 401 responses — retries the original request with the new token; only redirects to login if refresh also fails
  - Concurrent request queue during refresh (prevents parallel refresh race conditions)
  - `AuthContext.tsx`: user data is now cached in `localStorage` so the app remains accessible when offline or when the API is temporarily unreachable
  - Network errors no longer log the user out — token is preserved and re-validated when connectivity returns

---

### Fixed
- Loading spinner (`PageLoader`) now always appears perfectly centered horizontally and vertically in the content area
  - Changed `page-loader-overlay` from `absolute inset-0` to `fixed inset-0` so centering is viewport-relative and not dependent on parent height
  - On desktop, the overlay is offset by 260px to align with the main content area (excluding the sidebar)
  - On mobile (≤768px), the overlay covers the full screen
  - `MyBadges` and `BadgesManager` pages now use `PageLoader` instead of an uncentered inline `<p>Carregando...</p>` text
