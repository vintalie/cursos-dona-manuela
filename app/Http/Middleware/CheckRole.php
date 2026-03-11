<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckRole
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = auth('api')->user();

        if (!$user) {
            return response()->json([
                'message' => 'Usuário não autenticado'
            ], 401);
        }

        if (!in_array($user->tipo, $roles)) {
            return response()->json([
                'message' => 'Acesso não autorizado'
            ], 403);
        }

        return $next($request);
    }
}