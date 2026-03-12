<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Badge;

class BadgePolicy
{
    public function viewAny(User $user)
    {
        return true;
    }

    public function view(User $user, Badge $badge)
    {
        return true;
    }

    public function create(User $user)
    {
        return $user->tipo === 'gerente';
    }

    public function update(User $user, Badge $badge)
    {
        return $user->tipo === 'gerente';
    }

    public function delete(User $user, Badge $badge)
    {
        return $user->tipo === 'gerente';
    }
}
