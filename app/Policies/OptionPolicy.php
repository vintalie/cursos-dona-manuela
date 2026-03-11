<?php

namespace App\Policies;

use App\Models\Option;
use App\Models\User;

class OptionPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Option $option): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->tipo === 'gerente';
    }

    public function update(User $user, Option $option): bool
    {
        return $user->tipo === 'gerente';
    }

    public function delete(User $user, Option $option): bool
    {
        return $user->tipo === 'gerente';
    }

    public function restore(User $user, Option $option): bool
    {
        return $user->tipo === 'gerente';
    }

    public function forceDelete(User $user, Option $option): bool
    {
        return $user->tipo === 'gerente';
    }
}
