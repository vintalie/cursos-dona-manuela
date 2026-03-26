<?php

namespace App\Http\Controllers;

use App\Models\Badge;
use Illuminate\Http\Request;

class BadgeController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', Badge::class);
        return Badge::orderBy('title')->get();
    }

    public function store(Request $request)
    {
        $this->authorize('create', Badge::class);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'short_description' => 'nullable|string|max:500',
            'long_description' => 'nullable|string',
            'image' => 'nullable|string|max:500',
            'icon' => 'nullable|string|max:50',
            'notification_message' => 'nullable|string|max:255',
            'criteria_type' => 'required|string|in:module_perfect,course_time,course_perfect,course_complete,game_score,custom',
            'criteria_params' => 'nullable|array',
            'criteria_params.course_id' => 'nullable|exists:courses,id',
            'criteria_params.module_id' => 'nullable|exists:modules,id',
            'criteria_params.max_minutes' => 'nullable|integer|min:1',
            'criteria_params.game_id' => 'nullable|exists:games,id',
            'criteria_params.min_score' => 'nullable|integer|min:0|max:100',
        ]);

        $validated['icon'] = $validated['icon'] ?? 'star';
        return Badge::create($validated);
    }

    public function show(Badge $badge)
    {
        $this->authorize('view', $badge);
        return $badge;
    }

    public function update(Request $request, Badge $badge)
    {
        $this->authorize('update', $badge);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'short_description' => 'nullable|string|max:500',
            'long_description' => 'nullable|string',
            'image' => 'nullable|string|max:500',
            'icon' => 'nullable|string|max:50',
            'notification_message' => 'nullable|string|max:255',
            'criteria_type' => 'sometimes|string|in:module_perfect,course_time,course_perfect,course_complete,game_score,custom',
            'criteria_params' => 'nullable|array',
            'criteria_params.game_id' => 'nullable|exists:games,id',
            'criteria_params.min_score' => 'nullable|integer|min:0|max:100',
        ]);

        $badge->update($validated);
        return $badge;
    }

    public function destroy(Badge $badge)
    {
        $this->authorize('delete', $badge);
        $badge->delete();
        return response()->json(['message' => 'Medalha removida com sucesso']);
    }
}
