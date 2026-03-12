# Web Push – Configuração e Comandos

## Comandos para executar (em ordem)

### 1. Backend (Laravel)

```bash
# Com Sail:
./vendor/bin/sail artisan config:clear
./vendor/bin/sail artisan cache:clear

# Verificar se as chaves VAPID estão no .env
# Se não estiverem, gere:
./vendor/bin/sail artisan webpush:generate-keys
# ou
./vendor/bin/sail artisan webpush:vapid

# Copie as chaves para o .env (VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VITE_VAPID_PUBLIC_KEY)
```

### 2. Frontend

```bash
cd frontend/padaria-educacao

# Instalar dependências (se necessário)
npm install

# Build de produção (gera sw.js e copia para public/ para uso em dev)
npm run build
```

**Importante:** Execute `npm run build` antes de `npm run dev` para que o Service Worker (`sw.js`) exista em `public/` e seja servido em desenvolvimento.

### 3. Variáveis no .env (raiz do projeto)

Confirme que existem:

```
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:seu@email.com
VITE_VAPID_PUBLIC_KEY="${VAPID_PUBLIC_KEY}"
VITE_API_BASE="${APP_URL}"
```

O `VITE_API_BASE` deve apontar para o backend. Exemplos:
- Laravel em `http://localhost:8000` → `VITE_API_BASE=http://localhost:8000`
- Sail (porta 80) → `VITE_API_BASE=http://localhost`
- Produção → `VITE_API_BASE=https://seudominio.com`

### 4. Testar Web Push

**Opção A – Produção local**
```bash
cd frontend/padaria-educacao
npm run build
npm run preview
# Acesse http://localhost:4173 (ou a porta indicada)
```

**Opção B – Desenvolvimento**
```bash
cd frontend/padaria-educacao
npm run dev
# Acesse http://localhost:8080
# O Service Worker em dev está habilitado (dev-sw.js)
```

**Enviar notificação de teste**
```bash
./vendor/bin/sail artisan webpush:test email@usuario.com
```

## Checklist

- [ ] Chaves VAPID no `.env`
- [ ] `VITE_VAPID_PUBLIC_KEY` no `.env` (ou via build)
- [ ] Site em HTTPS ou localhost
- [ ] Usuário permitiu notificações no navegador
- [ ] Usuário clicou em "Ativar no dispositivo" no painel de notificações
- [ ] `npm run build` executado após alterações no `sw.ts`
- [ ] Tabela `push_subscriptions` migrada

## Debug

- No console do navegador: `debugPushStatus()`
- Em Configurações: botão "Executar diagnóstico Web Push"
- Logs do Laravel: `storage/logs/laravel.log` (prefixo `[WebPush]`)
