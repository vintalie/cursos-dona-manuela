<?php

namespace App\Services;

use App\Events\NotificationCreated;
use App\Models\Notification;
use App\Models\User;
use App\Notifications\WebPushNotification;

class NotificationService
{
    public static function notify(User $user, string $type, string $title, ?string $message = null, ?array $data = null, ?int $createdBy = null): Notification
    {
        $notification = Notification::create([
            'user_id' => $user->id,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'data' => $data,
            'created_by' => $createdBy,
        ]);

        event(new NotificationCreated($notification));

        try {
            $url = self::getUrlForType($type, $data);
            $subscriptionCount = $user->pushSubscriptions()->count();
            \Illuminate\Support\Facades\Log::info('[WebPush] Enviando notificação', [
                'user_id' => $user->id,
                'type' => $type,
                'subscriptions' => $subscriptionCount,
            ]);
            if ($subscriptionCount === 0) {
                \Illuminate\Support\Facades\Log::warning('[WebPush] Usuário sem subscrições - notificação não será enviada');
            }
            $user->notify(new WebPushNotification(
                title: $title,
                body: $message ?? '',
                url: $url,
                notificationId: $notification->id,
                type: $type,
            ));
            \Illuminate\Support\Facades\Log::info('[WebPush] Notificação enviada com sucesso');
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('[WebPush] Erro ao enviar', [
                'message' => $e->getMessage(),
                'user_id' => $user->id,
            ]);
            report($e);
        }

        return $notification;
    }

    protected static function getUrlForType(string $type, ?array $data): ?string
    {
        $data = $data ?? [];
        return match ($type) {
            'course_started', 'left_incomplete' => isset($data['course_id'])
                ? "/cursos/{$data['course_id']}"
                : '/cursos',
            'badge_earned' => '/minhas-medalhas',
            'admin_broadcast' => '/dashboard',
            default => '/dashboard',
        };
    }

    public static function courseStarted(User $user, string $courseTitle, int $courseId): Notification
    {
        return self::notify($user, 'course_started', "Curso iniciado: {$courseTitle}", "Você começou o curso \"{$courseTitle}\". Bom estudo!", ['course_id' => $courseId]);
    }

    public static function leftIncomplete(User $user, string $context, ?int $courseId = null, ?int $moduleId = null): Notification
    {
        return self::notify($user, 'left_incomplete', 'Conteúdo não finalizado', $context, [
            'course_id' => $courseId,
            'module_id' => $moduleId,
        ]);
    }

    public static function badgeEarned(User $user, string $badgeTitle, ?string $message = null, ?int $badgeId = null, ?int $courseId = null): Notification
    {
        return self::notify($user, 'badge_earned', "Medalha conquistada: {$badgeTitle}", $message ?? "Parabéns! Você conquistou a medalha \"{$badgeTitle}\".", [
            'badge_id' => $badgeId,
            'course_id' => $courseId,
        ]);
    }

    public static function adminBroadcast(User $user, string $title, string $message, int $createdBy): Notification
    {
        return self::notify($user, 'admin_broadcast', $title, $message, null, $createdBy);
    }
}
