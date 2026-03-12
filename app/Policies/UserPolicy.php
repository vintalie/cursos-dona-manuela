<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Apenas gerente pode criar usuários
     */
    public function create(User $user)
    {
        return $user->tipo === 'gerente';
    }

    /**
     * Apenas gerente pode deletar usuários. Gerente não pode excluir a própria conta.
     */
    public function delete(User $user, User $model)
    {
        if ($user->id === $model->id) {
            return false;
        }
        return $user->tipo === 'gerente';
    }

    /**
     * Apenas gerente pode listar usuários
     */
    public function viewAny(User $user)
    {
        return $user->tipo === 'gerente';
    }

    /**
     * Usuário pode ver a si mesmo ou gerente pode ver qualquer um
     */
    public function view(User $user, User $model)
    {
        return $user->id === $model->id || $user->tipo === 'gerente';
    }

    /**
     * Usuário pode editar a si mesmo ou gerente qualquer um
     */
    public function update(User $user, User $model)
    {
        return $user->id === $model->id || $user->tipo === 'gerente';
    }
}