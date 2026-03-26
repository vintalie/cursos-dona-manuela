# Sistema Educacional — Padaria (EAD)

Plataforma de ensino a distância com cursos modulares, avaliações, medalhas, minigames, notificações e acompanhamento de desempenho. O repositório é um **monorepo**:

- **Backend**: Laravel (API REST em `/api`, JWT, OAuth Google, Web Push, broadcasting).
- **Frontend**: React + TypeScript + Vite em [`frontend/padaria-educacao/`](frontend/padaria-educacao/).

## Documentação

| Recurso | Descrição |
|---------|-----------|
| [docs/COMPILADO.md](docs/COMPILADO.md) | **Índice mestre** — links para toda a documentação técnica |
| [docs/README.md](docs/README.md) | Índice da pasta `docs/` e ordem de leitura |
| [CHANGELOG.md](CHANGELOG.md) | Histórico de alterações |
| [docs/GOOGLE_OAUTH_SETUP.md](docs/GOOGLE_OAUTH_SETUP.md) | Configuração do login com Google |
| [WEBPUSH-SETUP.md](WEBPUSH-SETUP.md) | Web Push (VAPID) |
| [docs/PWA_CHECKLIST_ANALISE.md](docs/PWA_CHECKLIST_ANALISE.md) | Análise PWA |

## Pré-requisitos

- PHP ≥ 8.2 (conforme `composer.json`)
- Composer
- Node.js 18+ e npm
- Banco de dados (SQLite para desenvolvimento rápido ou MySQL/MariaDB em produção)

## Configuração local (backend)

```bash
cp .env.example .env
composer install
php artisan key:generate
php artisan jwt:secret
php artisan migrate
# opcional: php artisan db:seed
php artisan serve
```

Variáveis importantes em `.env`:

- `APP_URL` — URL base da API (ex.: `http://127.0.0.1:8000`).
- `APP_FRONTEND_URL` — URL do SPA (ex.: `http://localhost:5173`) para OAuth e CORS.
- `DB_*` — conexão do banco.
- `JWT_SECRET` — gerado por `jwt:secret`.
- Google OAuth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` — ver [docs/GOOGLE_OAUTH_SETUP.md](docs/GOOGLE_OAUTH_SETUP.md).
- Pusher / Web Push — ver `.env.example` e [WEBPUSH-SETUP.md](WEBPUSH-SETUP.md).

## Configuração local (frontend)

```bash
cd frontend/padaria-educacao
cp .env.example .env
# Ajuste VITE_API_BASE para apontar para a API (ex.: http://127.0.0.1:8000)
npm install
npm run dev
```

Build de produção:

```bash
npm run build
```

Os assets ficam em `frontend/padaria-educacao/dist/`.

## Colocar em produção (visão geral)

1. **Servidor PHP**: implantar o código Laravel; `composer install --no-dev --optimize-autoloader`; `php artisan config:cache` e `route:cache` quando aplicável; permissões em `storage/` e `bootstrap/cache/`.
2. **Ambiente**: definir `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL` e `APP_FRONTEND_URL` com HTTPS.
3. **Banco**: executar migrations no servidor.
4. **Frontend**: `npm run build` e publicar o conteúdo de `dist/` em hospedagem estática ou copiar para `public/` do Laravel conforme a estratégia de deploy (SPA em subpasta ou domínio separado).
5. **CORS**: ajustar [`config/cors.php`](config/cors.php) para a origem do frontend.
6. **Servidor web**: Apache/Nginx apontando o document root para `public/`; em hospedagens compartilhadas, pode ser necessário `.htaccess` (ex.: `public/.htaccess` e regras para OAuth — ver histórico no projeto).
7. **HTTPS**: obrigatório para OAuth, push e boas práticas de segurança.

Detalhes de rotas, entidades e requisitos estão em [docs/](docs/).

## Testes e qualidade

```bash
php artisan test
```

No frontend (se configurado):

```bash
cd frontend/padaria-educacao
npm run lint
```

## Licença

O projeto utiliza Laravel e dependências com licenças próprias; consulte `composer.json` e `package.json`.
