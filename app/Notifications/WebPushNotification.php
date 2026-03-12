<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushChannel;
use NotificationChannels\WebPush\WebPushMessage;

class WebPushNotification extends Notification
{
    use Queueable;

    public function __construct(
        public string $title,
        public string $body,
        public ?string $url = null,
        public ?int $notificationId = null,
        public ?string $type = null,
    ) {}

    public function via(object $notifiable): array
    {
        return [WebPushChannel::class];
    }

    public function toWebPush(object $notifiable, Notification $notification): WebPushMessage
    {
        $data = array_filter([
            'id' => $this->notificationId,
            'type' => $this->type,
            'url' => $this->url ?? '/dashboard',
        ]);

        return (new WebPushMessage)
            ->title($this->title)
            ->body($this->body)
            ->data($data)
            ->options(['TTL' => 86400]);
    }
}
