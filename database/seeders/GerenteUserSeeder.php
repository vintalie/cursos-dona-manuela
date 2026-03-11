<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class GerenteUserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'aluno@aluno.com'], // evita duplicação
            [
                'name' => 'aluno do Sistema',
                'email' => 'aluno@aluno.com',
                'tipo' => 'aluno',
                'password' => Hash::make('12345678')
            ]
        );
        User::updateOrCreate(
            ['email' => 'gerente@gerente.com'], // evita duplicação
            [
                'name' => 'gerente do Sistema',
                'email' => 'gerente@gerente.com',
                'tipo' => 'gerente',
                'password' => Hash::make('12345678')
            ]
        );
    }
}