<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{

    public function index()
    {
        $this->authorize('viewAny', User::class);

        return response()->json(User::paginate(10));
    }

    public function store(Request $request)
    {
        $this->authorize('create', User::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'tipo' => 'required|in:gerente,aluno,instrutor',
            'password' => 'required|min:6'
        ]);

        $user = User::create([
            ...$validated,
            'password' => Hash::make($validated['password'])
        ]);

        return response()->json($user, 201);
    }

    public function show(User $user)
    {
        $this->authorize('view', $user);

        return response()->json($user);
    }

    public function update(Request $request, User $user)
    {
        $this->authorize('update', $user);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => "sometimes|email|unique:users,email,$user->id",
            'tipo' => 'sometimes|in:gerente,aluno,instrutor',
            'password' => 'sometimes|min:6'
        ]);

        if(isset($validated['password'])){
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->update($validated);

        return response()->json($user);
    }

    public function destroy(User $user)
    {
        $this->authorize('delete', $user);

        $user->delete();

        return response()->json([
            'message' => 'Usuário removido'
        ]);
    }
}