<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Module;

class ModulePolicy
{
    public function viewAny(User $user){ return true; }
    public function view(User $user, Module $module){ return true; }
    public function create(User $user){ return $user->tipo === 'gerente'; }
    public function update(User $user, Module $module){ return $user->tipo === 'gerente'; }
    public function delete(User $user, Module $module){ return $user->tipo === 'gerente'; }
}