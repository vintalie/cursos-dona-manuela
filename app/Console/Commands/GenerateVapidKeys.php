<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class GenerateVapidKeys extends Command
{
    protected $signature = 'webpush:generate-keys';
    protected $description = 'Generate VAPID keys for Web Push notifications';

    public function handle(): int
    {
        $config = [
            'private_key_type' => OPENSSL_KEYTYPE_EC,
            'curve_name' => 'prime256v1',
        ];

        $res = @openssl_pkey_new($config);
        if (!$res) {
            $this->error('Failed to generate keys. Ensure OpenSSL is installed with EC support.');
            return 1;
        }

        $keyDetails = openssl_pkey_get_details($res);
        if (!$keyDetails || !isset($keyDetails['ec'])) {
            $this->error('Failed to get key details.');
            return 1;
        }

        $publicKeyHex = '04' . bin2hex($keyDetails['ec']['x']) . bin2hex($keyDetails['ec']['y']);
        $publicKey = base64_encode(hex2bin($publicKeyHex));
        $privateKeyRaw = $keyDetails['ec']['d'];
        $privateKey = base64_encode(str_pad($privateKeyRaw, 32, "\0", STR_PAD_LEFT));

        $publicKey = rtrim(strtr($publicKey, '+/', '-_'), '=');
        $privateKey = rtrim(strtr($privateKey, '+/', '-_'), '=');

        $this->info('Add these to your .env file:');
        $this->newLine();
        $this->line('VAPID_PUBLIC_KEY=' . $publicKey);
        $this->line('VAPID_PRIVATE_KEY=' . $privateKey);
        $this->line('VAPID_SUBJECT=mailto:admin@example.com');
        $this->newLine();
        $this->info('Also set VITE_VAPID_PUBLIC_KEY=' . $publicKey . ' for the frontend.');

        return 0;
    }
}
