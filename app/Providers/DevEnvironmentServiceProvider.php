<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

/**
 * Aplica configurações padrão do Laravel Sail quando APP_MODE=development.
 *
 * Em desenvolvimento, variáveis de ambiente podem ser omitidas no .env e
 * este provider garante que os valores padrão do Sail sejam usados.
 * Em produção (APP_MODE=production), este provider não faz nada —
 * todos os valores devem estar explicitamente definidos no .env.
 */
class DevEnvironmentServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        if (env('APP_MODE') !== 'development') {
            return;
        }

        $this->applyDevDefaults();
    }

    private function applyDevDefaults(): void
    {
        config([
            // Aplicação
            'app.url'   => env('APP_URL') ?: 'https://ead-api.dcmmarketingdigital.com.br',
            'app.debug' => filter_var(env('APP_DEBUG', true), FILTER_VALIDATE_BOOLEAN),

            // Banco de dados (padrões do Laravel Sail)
            'database.default'                        => env('DB_CONNECTION') ?: 'mysql',
            'database.connections.mysql.host'         => env('DB_HOST') ?: 'mysql',
            'database.connections.mysql.port'         => env('DB_PORT') ?: '3306',
            'database.connections.mysql.database'     => env('DB_DATABASE') ?: 'laravel',
            'database.connections.mysql.username'     => env('DB_USERNAME') ?: 'sail',
            'database.connections.mysql.password'     => env('DB_PASSWORD') ?: 'password',

            // Cache, sessão e filas
            'cache.default'   => env('CACHE_STORE') ?: 'database',
            'queue.default'   => env('QUEUE_CONNECTION') ?: 'database',
            'session.driver'  => env('SESSION_DRIVER') ?: 'database',

            // Mail: em dev usa log para não enviar e-mails reais
            'mail.default'                    => env('MAIL_MAILER') ?: 'log',
            'mail.mailers.smtp.host'          => env('MAIL_HOST') ?: '127.0.0.1',
            'mail.mailers.smtp.port'          => env('MAIL_PORT') ?: 2525,
            'mail.mailers.smtp.username'      => env('MAIL_USERNAME'),
            'mail.mailers.smtp.password'      => env('MAIL_PASSWORD'),
            'mail.from.address'               => env('MAIL_FROM_ADDRESS') ?: 'hello@example.com',
            'mail.from.name'                  => env('MAIL_FROM_NAME') ?: env('APP_NAME', 'Laravel'),

            // Redis
            'database.redis.default.host'     => env('REDIS_HOST') ?: '127.0.0.1',
            'database.redis.default.port'     => env('REDIS_PORT') ?: 6379,
            'database.redis.default.password' => env('REDIS_PASSWORD') ?: null,
        ]);
    }

    public function boot(): void {}
}
