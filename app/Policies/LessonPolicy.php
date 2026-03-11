<?php

namespace App\Policies;

use App\Models\Lesson;
use App\Models\User;

class LessonPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Lesson $lesson): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->tipo === 'gerente';
    }

    public function update(User $user, Lesson $lesson): bool
    {
        return $user->tipo === 'gerente';
    }

    public function delete(User $user, Lesson $lesson): bool
    {
        return $user->tipo === 'gerente';
    }

    public function restore(User $user, Lesson $lesson): bool
    {
        return $user->tipo === 'gerente';
    }

    public function forceDelete(User $user, Lesson $lesson): bool
    {
        return $user->tipo === 'gerente';
    }
}
