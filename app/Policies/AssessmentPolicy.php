<?php

namespace App\Policies;

use App\Models\Assessment;
use App\Models\User;

class AssessmentPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Assessment $assessment): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->tipo === 'gerente';
    }

    public function update(User $user, Assessment $assessment): bool
    {
        return $user->tipo === 'gerente';
    }

    public function delete(User $user, Assessment $assessment): bool
    {
        return $user->tipo === 'gerente';
    }

    public function restore(User $user, Assessment $assessment): bool
    {
        return $user->tipo === 'gerente';
    }

    public function forceDelete(User $user, Assessment $assessment): bool
    {
        return $user->tipo === 'gerente';
    }
}
