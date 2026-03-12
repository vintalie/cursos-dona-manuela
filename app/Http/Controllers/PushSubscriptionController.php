<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PushSubscriptionController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'endpoint' => 'required|string|max:500',
            'keys' => 'required|array',
            'keys.p256dh' => 'required|string',
            'keys.auth' => 'required|string',
        ]);

        $request->user()->updatePushSubscription(
            $validated['endpoint'],
            $validated['keys']['p256dh'],
            $validated['keys']['auth']
        );

        return response()->json(['success' => true]);
    }

    public function destroy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'endpoint' => 'required|string',
        ]);

        $request->user()->deletePushSubscription($validated['endpoint']);

        return response()->json(['success' => true]);
    }

    public function index(Request $request): JsonResponse
    {
        $count = $request->user()->pushSubscriptions()->count();
        return response()->json(['count' => $count]);
    }

    public function vapidPublicKey(): JsonResponse
    {
        $key = config('webpush.vapid.public_key') ?? config('services.webpush.vapid_public');
        if (empty($key)) {
            return response()->json(['error' => 'VAPID not configured'], 503);
        }
        return response()->json(['publicKey' => $key]);
    }
}
