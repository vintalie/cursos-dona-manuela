<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Notifications\WebPushNotification;
use Illuminate\Console\Command;

class TestWebPush extends Command
{
    protected $signature = 'webpush:test {email : Email do usuário para enviar notificação de teste}';

    protected $description = 'Envia uma notificação Web Push de teste para um usuário';

    public function handle(): int
    {
        $email = $this->argument('email');
        $user = User::where('email', $email)->first();

        if (!$user) {
            $this->error("Usuário com email '{$email}' não encontrado.");
            return 1;
        }

        $count = $user->pushSubscriptions()->count();
        if ($count === 0) {
            $this->warn("Usuário não possui subscrições push. Peça para ele clicar em 'Ativar no dispositivo' no painel de notificações.");
            return 1;
        }

        $this->info("Enviando notificação de teste para {$user->name} ({$count} subscrição(ões))...");

        try {
            $user->notify(new WebPushNotification(
                title: 'Teste Web Push',
                body: 'Se você está vendo isso, as notificações nativas estão funcionando!',
                url: '/dashboard',
            ));
            $this->info('Notificação enviada com sucesso.');
            return 0;
        } catch (\Throwable $e) {
            $this->error('Erro: ' . $e->getMessage());
            report($e);
            return 1;
        }
    }
}
