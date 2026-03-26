# Configuração do Login com Google (OAuth 2.0)

Este guia descreve o passo a passo para gerar as chaves de integração do Google e configurar o login com Google no app.

---

## 1. Acessar o Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Faça login com sua conta Google
3. Crie um novo projeto ou selecione um existente (canto superior esquerdo)

---

## 2. Configurar a tela de consentimento OAuth

1. No menu lateral, vá em **APIs e Serviços** → **Tela de consentimento OAuth**
2. Selecione o tipo de usuário:
   - **Externo**: qualquer pessoa com conta Google (recomendado para apps públicos)
   - **Interno**: apenas usuários da sua organização Google Workspace
3. Clique em **Criar**
4. Preencha os campos obrigatórios:
   - **Nome do app**: ex. "Padaria Educação"
   - **E-mail de suporte do usuário**: seu e-mail
   - **Domínios autorizados** (se aplicável): ex. `seudominio.com.br`
5. Clique em **Salvar e continuar**
6. Na etapa **Escopos**, adicione (se necessário):
   - `email`
   - `profile`
   - `openid`
7. Clique em **Salvar e continuar**
8. Na etapa **Usuários de teste** (modo de teste): adicione e-mails que poderão testar antes da publicação
9. Clique em **Salvar e continuar**

---

## 3. Criar credenciais OAuth

1. No menu lateral, vá em **APIs e Serviços** → **Credenciais**
2. Clique em **+ Criar credenciais** → **ID do cliente OAuth**
3. Selecione o tipo de aplicativo: **Aplicativo da Web**
4. Preencha:
   - **Nome**: ex. "Padaria Educação - Web"
   - **URIs de redirecionamento autorizados**:
     - Desenvolvimento: `https://ead-api.dcmmarketingdigital.com.br/api/auth/google/callback`
     - Produção: `https://ead-api.dcmmarketingdigital.com.br/api/auth/google/callback`
5. Clique em **Criar**
6. Copie o **ID do cliente** e o **Segredo do cliente** (serão usados no `.env`)

---

## 4. Configurar o `.env` do backend

Adicione ou edite no arquivo `.env` na raiz do projeto:

```env
# Google OAuth
GOOGLE_CLIENT_ID=seu_client_id_aqui.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu_client_secret_aqui
GOOGLE_REDIRECT_URI="${APP_URL}/api/auth/google/callback"

# URL do frontend (para redirecionar após login)
APP_FRONTEND_URL=https://ead.dcmmarketingdigital.com.br
```

**Importante:**
- `APP_URL` deve ser a URL base da API (ex: `https://ead-api.dcmmarketingdigital.com.br`)
- `GOOGLE_REDIRECT_URI` deve ser **exatamente** igual a uma das URIs cadastradas no Google Console
- Em produção, use `https://` e o domínio correto

---

## 5. Executar a migration

```bash
php artisan migrate
```

Isso adiciona a coluna `google_id` e permite `password` nulo para usuários que entram apenas pelo Google.

---

## 6. Testar

1. Inicie o backend: `php artisan serve` (ou seu ambiente)
2. Inicie o frontend: `npm run dev` (em `frontend/padaria-educacao`)
3. Acesse a tela de login
4. Clique em **Entrar com Google**
5. Autorize o app na tela do Google
6. Você deve ser redirecionado de volta e logado automaticamente

---

## Troubleshooting

### "redirect_uri_mismatch"
- Verifique se a URI no `.env` (`GOOGLE_REDIRECT_URI`) é **idêntica** à cadastrada no Google Console
- Não inclua barra final: use `https://ead-api.dcmmarketingdigital.com.br/api/auth/google/callback` e não `https://ead-api.dcmmarketingdigital.com.br/api/auth/google/callback/`

### "access_denied"
- O usuário cancelou o login ou o app está em modo de teste e o e-mail não está na lista de testadores

### "invalid_client"
- Verifique `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` no `.env`
- Confirme que as credenciais estão ativas no Google Console

### CORS / sessão
- O fluxo OAuth usa redirecionamento completo (não AJAX). O backend redireciona para o Google e depois de volta para o frontend com o token na URL
- Em produção, `APP_FRONTEND_URL` deve apontar para o domínio do frontend (ex: `https://ead.dcmmarketingdigital.com.br`)

### "Missing required parameter: client_id" (erro 400 no deploy)
- **Causa**: `GOOGLE_CLIENT_ID` não está definido no `.env` de produção
- **Solução**:
  1. Adicione ao `.env` do servidor de produção:
     ```env
     GOOGLE_CLIENT_ID=seu_client_id.apps.googleusercontent.com
     GOOGLE_CLIENT_SECRET=seu_secret
     GOOGLE_REDIRECT_URI="${APP_URL}/api/auth/google/callback"
     ```
  2. Se usar cache de config: `php artisan config:clear` e depois `php artisan config:cache`
  3. Reinicie o PHP/workers (php-fpm, queue, etc.) para carregar as novas variáveis

### "406 Not Acceptable" ou "Mod_Security" no callback
- **Causa**: O ModSecurity (Apache) bloqueia o callback do Google OAuth por falsos positivos — a string `profile` em `userinfo.profile` (scope) pode acionar regras de LFI (Local File Inclusion)
- **Soluções** (tente na ordem):

  **A) Escopo reduzido (já aplicado)**
  - O app usa apenas os scopes `email` e `openid` (sem `profile`), para evitar que a string "profile" na URL do callback dispare o ModSecurity
  - O nome do usuário pode vir como parte do e-mail; avatar pode ficar vazio

  **B) Via .htaccess (HostGator e similares)**
  - O projeto inclui regras em `public/.htaccess` para desabilitar o ModSecurity nas rotas `/api/auth/google`
  - Nem todos os servidores aceitam essas diretivas

  **C) Hospedagem compartilhada — contatar suporte**
  - Peça para desabilitar o ModSecurity para as rotas `/api/auth/google` e `/api/auth/google/callback`, ou para adicionar exceção às regras 930120 e 942100

  **D) Acesso ao servidor (Apache)**
  - Crie ou edite o arquivo de configuração do ModSecurity e adicione:
    ```apache
    SecRule REQUEST_URI "@beginsWith /api/auth/google" "id:1050,phase:1,pass,nolog,ctl:ruleRemoveById=930120"
    SecRule REQUEST_URI "@beginsWith /api/auth/google" "id:1051,phase:1,pass,nolog,ctl:ruleRemoveById=942100"
    ```
  - Reinicie o Apache: `sudo systemctl restart apache2`
