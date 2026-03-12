<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $query = $user->notifications();

        if ($request->boolean('unread_only')) {
            $query->whereNull('read_at');
        }

        $notifications = $query->limit(50)->get();
        $unreadCount = $user->notifications()->whereNull('read_at')->count();

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $unreadCount,
        ]);
    }

    public function markAsRead(Notification $notification)
    {
        if ($notification->user_id !== auth()->id()) {
            abort(403);
        }
        $notification->markAsRead();
        return response()->json(['message' => 'Marcada como lida']);
    }

    public function markAllAsRead()
    {
        auth()->user()->notifications()->whereNull('read_at')->update(['read_at' => now()]);
        return response()->json(['message' => 'Todas marcadas como lidas']);
    }

    public function deleteAll()
    {
        auth()->user()->notifications()->delete();
        return response()->json(['message' => 'Notificações removidas']);
    }

    public function broadcast(Request $request)
    {
        if (auth()->user()->tipo !== 'gerente') {
            abort(403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string|max:1000',
            'user_ids' => 'nullable|array',
            'user_ids.*' => 'exists:users,id',
            'send_to_all' => 'boolean',
        ]);

        $userIds = $validated['send_to_all'] ?? false
            ? User::where('tipo', 'aluno')->pluck('id')->toArray()
            : ($validated['user_ids'] ?? []);

        $count = 0;
        foreach ($userIds as $userId) {
            $user = User::find($userId);
            if ($user) {
                NotificationService::adminBroadcast(
                    $user,
                    $validated['title'],
                    $validated['message'],
                    auth()->id()
                );
                $count++;
            }
        }

        return response()->json(['message' => "Notificação enviada para {$count} usuário(s)", 'count' => $count]);
    }

    public function reportLeftIncomplete(Request $request)
    {
        $validated = $request->validate([
            'context' => 'required|string|max:500',
            'course_id' => 'nullable|exists:courses,id',
            'module_id' => 'nullable|exists:modules,id',
        ]);

        NotificationService::leftIncomplete(
            auth()->user(),
            $validated['context'],
            $validated['course_id'] ?? null,
            $validated['module_id'] ?? null
        );

        return response()->json(['message' => 'Registrado']);
    }
}
