<?php

namespace App\Http\Controllers;

use App\Models\Media;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;

class AuthController extends Controller
{
    /**
     * Verifica se o e-mail já está cadastrado.
     * Retorna exists: true/false para o frontend decidir entre login ou registro.
     */
    public function checkEmail(Request $request)
    {
        $request->validate(['email' => 'required|email']);
        $exists = User::where('email', $request->email)->exists();
        return response()->json(['exists' => $exists]);
    }

    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'tipo' => 'nullable|in:gerente,aluno',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $tipo = $request->tipo ?? 'aluno';

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'tipo' => $tipo,
        ]);

        $token = Auth::login($user);

        return $this->respondWithToken($token);
    }

    public function login(Request $request)
    {
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['error' => 'user_not_found', 'message' => 'E-mail não cadastrado.'], 404);
        }

        if (!$user->password) {
            return response()->json([
                'error' => 'google_account',
                'message' => 'Esta conta usa login com Google. Use o botão "Entrar com Google".',
            ], 400);
        }

        if (!\Hash::check($request->password, $user->password)) {
            return response()->json(['error' => 'password_incorrect', 'message' => 'Senha incorreta.'], 401);
        }

        return $this->respondWithToken(Auth::login($user));
    }

    /**
     * Redireciona o usuário para a tela de login do Google.
     */
    public function redirectToGoogle(Request $request)
    {
        $clientId = config('services.google.client_id');
        if (empty($clientId)) {
            $frontendUrl = rtrim($request->query('frontend_url', config('app.frontend_url')), '/');
            return redirect($frontendUrl . '/login?error=google_not_configured');
        }

        $frontendUrl = rtrim($request->query('frontend_url', config('app.frontend_url')), '/');
        session(['google_frontend_url' => $frontendUrl]);

        // Usa apenas email+openid para evitar ModSecurity (scope "profile" aciona regras LFI em alguns hosts)
        return Socialite::driver('google')
            ->scopes(['email', 'openid'])
            ->redirect();
    }

    /**
     * Callback do Google OAuth: cria ou atualiza o usuário e redireciona para o frontend com o token.
     */
    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (\Exception $e) {
            $frontendUrl = session('google_frontend_url', config('app.frontend_url', 'https://ead.dcmmarketingdigital.com.br'));
            return redirect($frontendUrl . '/login?error=google_auth_failed');
        }

        $user = User::where('google_id', $googleUser->getId())->first();

        if (!$user) {
            $user = User::where('email', $googleUser->getEmail())->first();

            if ($user) {
                $user->update([
                    'google_id' => $googleUser->getId(),
                    'avatar' => $user->avatar ?? $googleUser->getAvatar(),
                ]);
            } else {
                $name = $googleUser->getName() ?: explode('@', $googleUser->getEmail())[0];
                $avatar = $googleUser->getAvatar();
                $user = User::create([
                    'name' => $name ?: 'Usuário',
                    'email' => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'avatar' => $avatar,
                    'password' => null,
                    'tipo' => 'aluno',
                ]);
            }
        }

        $token = Auth::login($user);
        $frontendUrl = session('google_frontend_url', config('app.frontend_url', 'https://ead.dcmmarketingdigital.com.br'));

        return redirect($frontendUrl . '/login?token=' . urlencode($token));
    }

    public function me()
    {
        return response()->json(Auth::user());
    }

    public function updateProfile(Request $request)
    {
        $user = Auth::user();
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'full_name' => 'nullable|string|max:255',
            'avatar' => 'nullable|string|max:500',
            'gender' => 'nullable|string|in:masculino,feminino,outro,prefiro_nao_informar',
            'address' => 'nullable|string|max:500',
            'whatsapp' => 'nullable|string|max:20',
            'phone' => 'nullable|string|max:20',
        ]);
        $user->update($validated);
        return response()->json($user);
    }

    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'file' => 'required|file|image|mimes:jpeg,png,gif,webp|max:5120', // 5MB, images only
        ]);

        $user = Auth::user();

        $file = $request->file('file');
        $year = now()->format('Y');
        $month = now()->format('m');
        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $path = "media/avatars/{$year}/{$month}/{$filename}";

        $storedPath = Storage::disk('public')->putFileAs(
            "media/avatars/{$year}/{$month}",
            $file,
            $filename
        );

        // Use relative URL so frontend can resolve with correct API base (port/host)
        $url = '/storage/' . $storedPath;

        $media = Media::create([
            'user_id' => $user->id,
            'media_category_id' => null,
            'filename' => $filename,
            'original_name' => $file->getClientOriginalName(),
            'path' => $storedPath,
            'url' => $url,
            'mime_type' => $file->getMimeType(),
            'type' => 'image',
            'size' => $file->getSize(),
        ]);

        $user->update(['avatar' => $url]);

        return response()->json($user);
    }

    public function logout()
    {
        Auth::logout();
        return response()->json(['message' => 'Successfully logged out']);
    }

    public function refresh()
    {
        try {
            $token = JWTAuth::getToken();
            if (!$token) {
                return response()->json(['error' => 'Token not provided'], 401);
            }
            $newToken = JWTAuth::refresh($token);
            return $this->respondWithToken($newToken);
        } catch (JWTException $e) {
            return response()->json(['error' => 'Token cannot be refreshed. Please log in again.'], 401);
        }
    }

    protected function respondWithToken($token)
    {
        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth('api')->factory()->getTTL() * 60,
            'user' => Auth::user()
        ]);
    }
}