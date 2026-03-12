<?php

namespace Database\Seeders;

use App\Models\Game;
use Illuminate\Database\Seeder;

class GamesSeeder extends Seeder
{
    public function run(): void
    {
        $games = [
            [
                'slug' => 'memory-padaria',
                'title' => 'Memória da Padaria',
                'description' => 'Encontre os pares de cartas com ingredientes e utensílios de padaria.',
                'type' => 'memory',
                'config' => [
                    'pairs' => [
                        ['id' => 1, 'label' => 'Farinha', 'emoji' => '🌾'],
                        ['id' => 2, 'label' => 'Fermento', 'emoji' => '🧪'],
                        ['id' => 3, 'label' => 'Açúcar', 'emoji' => '🍬'],
                        ['id' => 4, 'label' => 'Ovo', 'emoji' => '🥚'],
                        ['id' => 5, 'label' => 'Leite', 'emoji' => '🥛'],
                        ['id' => 6, 'label' => 'Manteiga', 'emoji' => '🧈'],
                    ],
                ],
                'order' => 1,
            ],
        ];

        foreach ($games as $game) {
            Game::updateOrCreate(
                ['slug' => $game['slug']],
                array_merge($game, ['is_active' => true])
            );
        }
    }
}
