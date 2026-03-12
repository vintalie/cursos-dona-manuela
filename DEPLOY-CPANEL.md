# Deploy no cPanel – Queue e Pusher

A aplicação usa **Pusher** para notificações em tempo real (serviço hospedado, sem servidor próprio) e **filas** para processar jobs em segundo plano:

| Componente | Função | Como rodar no cPanel |
|------------|--------|----------------------|
| **Queue worker** | Processa jobs (incluindo broadcasts) | ✅ Cron Job |
| **Pusher** | WebSocket para clientes conectados | ✅ Serviço externo (nenhum processo a rodar) |

---

## 1. Configurar o Cron Job (Queue Worker)

1. No cPanel, acesse **Cron Jobs** (ou **Tarefas Cron**).
2. Crie uma nova tarefa com a seguinte configuração:

### Opção A: Processar jobs a cada minuto (recomendado)

- **Frequência:** `* * * * *` (a cada minuto)
- **Comando:**
  ```bash
  cd /home/SEU_USUARIO/public_html/cursos-dona-manuela && php artisan queue:work --stop-when-empty --max-time=55
  ```

> Substitua `SEU_USUARIO` pelo seu usuário do cPanel e `cursos-dona-manuela` pelo caminho real do projeto (geralmente dentro de `public_html` ou em um subdomínio).

### Opção B: Usar o caminho absoluto do PHP

Se o `php` não for encontrado no PATH, use o caminho completo:

```bash
cd /home/SEU_USUARIO/public_html/cursos-dona-manuela && /usr/local/bin/php artisan queue:work --stop-when-empty --max-time=55
```

Para descobrir o caminho do PHP no cPanel:
- Acesse **Select PHP Version** ou **MultiPHP Manager**
- Ou execute `which php` via **Terminal** no cPanel

## 2. Parâmetros importantes

| Parâmetro | Descrição |
|-----------|-----------|
| `--stop-when-empty` | Encerra o worker quando não houver mais jobs (evita processo travado) |
| `--max-time=55` | Encerra após 55 segundos (antes do próximo cron) para evitar sobreposição |

## 3. Tarefas agendadas (Schedule)

Se a aplicação usar `php artisan schedule:run`, adicione outro cron:

- **Frequência:** `* * * * *`
- **Comando:**
  ```bash
  cd /home/SEU_USUARIO/public_html/cursos-dona-manuela && php artisan schedule:run >> /dev/null 2>&1
  ```

## 4. Verificar se está funcionando

1. **Logs:** Verifique `storage/logs/laravel.log` em caso de erro.
2. **Tabela `jobs`:** Jobs pendentes ficam na tabela `jobs` do banco.
3. **Tabela `failed_jobs`:** Jobs que falharam ficam em `failed_jobs`.

## 5. Troubleshooting – Erros no `queue:work`

### Erro: "Could not find driver"
- **Causa:** Extensão PDO do banco não está habilitada.
- **Solução:** No cPanel → **Select PHP Version** → marque `pdo_mysql` (ou `pdo_sqlite` conforme seu banco).

### Erro: "SQLSTATE[]" ou "Connection refused"
- **Causa:** Banco de dados inacessível ou credenciais erradas.
- **Solução:** Verifique `DB_*` no `.env` (host, database, username, password). Em cPanel, use o host `localhost` ou o que a hospedagem indicar.

### Erro: "Class ... not found" ou "Target class does not exist"
- **Causa:** Autoload desatualizado ou cache corrompido.
- **Solução:**
  ```bash
  composer dump-autoload
  php artisan config:clear
  php artisan cache:clear
  ```

### Erro: "Permission denied" em `storage/` ou `bootstrap/cache/`
- **Causa:** Permissões incorretas.
- **Solução:**
  ```bash
  chmod -R 775 storage bootstrap/cache
  chown -R SEU_USUARIO:SEU_USUARIO storage bootstrap/cache
  ```

### Erro: "No application encryption key has been specified"
- **Causa:** Falta `APP_KEY` no `.env`.
- **Solução:** Execute `php artisan key:generate` e copie a chave para o `.env`.

### Testar localmente antes do deploy
```bash
php artisan queue:work --once
```
Se funcionar, o problema pode ser o ambiente (PATH do PHP, permissões, etc.) no cPanel.

---

## 6. Notificações nativas (Web Push)

A aplicação suporta **notificações nativas no dispositivo** – o usuário recebe notificações mesmo fora da plataforma (com o navegador fechado, em outra aba, etc.).

### Configuração

1. Gere as chaves VAPID:
   ```bash
   php artisan webpush:generate-keys
   ```

2. Adicione ao `.env`:
   ```env
   VAPID_PUBLIC_KEY=...
   VAPID_PRIVATE_KEY=...
   VAPID_SUBJECT=mailto:admin@example.com
   VITE_VAPID_PUBLIC_KEY="${VAPID_PUBLIC_KEY}"
   ```

3. O usuário ativa em **Painel de notificações** → **Ativar no dispositivo**.

### Requisitos

- HTTPS (obrigatório para Web Push)
- Service Worker registrado (PWA)
- Queue worker rodando (para broadcasts em fila; com `ShouldBroadcastNow` o broadcast é imediato)
- **Web Push:** Usa `laravel-notification-channels/webpush`. Chaves VAPID no `.env` (`VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`). Execute `php artisan webpush:generate-keys` ou `php artisan webpush:vapid`. O aluno deve: (1) permitir notificações no navegador, (2) clicar em "Ativar no dispositivo" no painel. O site deve ser HTTPS (ou localhost). Para testar: `php artisan webpush:test email@usuario.com`. **Importante:** execute `php artisan migrate` para aplicar a migração que adapta a tabela `push_subscriptions` ao formato do pacote.

---

## 7. Pusher

A aplicação usa **Pusher** como serviço hospedado. As credenciais estão no `.env`:

```env
BROADCAST_CONNECTION=pusher
PUSHER_APP_ID=2126689
PUSHER_APP_KEY=5c0657396db5ab02f5a8
PUSHER_APP_SECRET=96c29da4d59c5666a1e9
PUSHER_APP_CLUSTER=us2
```

O frontend usa `VITE_PUSHER_APP_KEY` e `VITE_PUSHER_APP_CLUSTER` (definidos no `.env` do backend e expostos via Vite). Não é necessário rodar nenhum processo adicional.

Para desativar notificações em tempo real: `BROADCAST_CONNECTION=null`.

---

## 8. Limitações em hospedagem compartilhada

- O worker não fica rodando o tempo todo; jobs podem levar até 1 minuto para serem processados.
- Para processamento quase instantâneo, seria necessário VPS ou servidor dedicado com Supervisor.
- Garanta que `QUEUE_CONNECTION=database` esteja no `.env` (padrão do Laravel).
