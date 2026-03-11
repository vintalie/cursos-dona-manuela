<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Course;

class CoursePolicy
{
    public function viewAny(User $user)
    {
        return true;
    }

    public function view(User $user, Course $course)
    {
        return true;
    }

    public function create(User $user)
    {
        return $user->tipo === 'gerente';
    }

    public function update(User $user, Course $course)
    {
        return $user->tipo === 'gerente';
    }

    public function delete(User $user, Course $course)
    {
        return $user->tipo === 'gerente';
    }
}