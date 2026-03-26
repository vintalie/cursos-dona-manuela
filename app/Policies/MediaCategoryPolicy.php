<?php

namespace App\Policies;

use App\Models\MediaCategory;
use App\Models\User;

class MediaCategoryPolicy
{
    public function viewAny(User $user): bool
    {
        return true; // All authenticated users can list categories (for MediaPicker)
    }

    public function view(User $user, MediaCategory $mediaCategory): bool
    {
        return $user->tipo === 'gerente';
    }

    public function create(User $user): bool
    {
        return $user->tipo === 'gerente';
    }

    public function update(User $user, MediaCategory $mediaCategory): bool
    {
        return $user->tipo === 'gerente';
    }

    public function delete(User $user, MediaCategory $mediaCategory): bool
    {
        return $user->tipo === 'gerente';
    }
}
