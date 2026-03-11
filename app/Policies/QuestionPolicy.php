<?php

namespace App\Policies;

use App\Models\Question;
use App\Models\User;

class QuestionPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Question $question): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->tipo === 'gerente';
    }

    public function update(User $user, Question $question): bool
    {
        return $user->tipo === 'gerente';
    }

    public function delete(User $user, Question $question): bool
    {
        return $user->tipo === 'gerente';
    }

    public function restore(User $user, Question $question): bool
    {
        return $user->tipo === 'gerente';
    }

    public function forceDelete(User $user, Question $question): bool
    {
        return $user->tipo === 'gerente';
    }
}
