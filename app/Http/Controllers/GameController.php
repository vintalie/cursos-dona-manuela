<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\GameProgress;
use App\Models\GameSession;
use App\Services\BadgeAwardService;
use Illuminate\Http\Request;

class GameController extends Controller
{
    public function index(Request $request)
    {
        $query = Game::where('is_active', true)->orderBy('order')->orderBy('title');

        if ($request->filled('course_id')) {
            $query->where('course_id', $request->course_id);
        }
        if ($request->filled('module_id')) {
            $query->where('module_id', $request->module_id);
        }
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $games = $query->get();
        $user = auth()->user();

        $games = $games->map(function ($game) use ($user) {
            $progress = $user->gameProgress()->where('game_id', $game->id)->first();
            return [
                'id' => $game->id,
                'slug' => $game->slug,
                'title' => $game->title,
                'description' => $game->description,
                'type' => $game->type,
                'config' => $game->config,
                'course_id' => $game->course_id,
                'module_id' => $game->module_id,
                'best_score' => $progress?->best_score ?? 0,
                'attempts' => $progress?->attempts ?? 0,
                'unlocked' => $progress?->unlocked ?? true,
            ];
        });

        return response()->json(['games' => $games]);
    }

    public function show(Game $game)
    {
        if (!$game->is_active) {
            abort(404);
        }

        $user = auth()->user();
        $progress = $user->gameProgress()->where('game_id', $game->id)->first();

        return response()->json([
            'id' => $game->id,
            'slug' => $game->slug,
            'title' => $game->title,
            'description' => $game->description,
            'type' => $game->type,
            'config' => $game->config,
            'best_score' => $progress?->best_score ?? 0,
            'attempts' => $progress?->attempts ?? 0,
        ]);
    }

    public function complete(Request $request, Game $game)
    {
        $validated = $request->validate([
            'score' => 'required|integer|min:0',
            'time_seconds' => 'nullable|integer|min:0',
            'completed' => 'boolean',
            'metadata' => 'nullable|array',
        ]);

        $user = auth()->user();

        $session = GameSession::create([
            'user_id' => $user->id,
            'game_id' => $game->id,
            'score' => $validated['score'],
            'time_seconds' => $validated['time_seconds'] ?? null,
            'completed' => $validated['completed'] ?? true,
            'metadata' => $validated['metadata'] ?? null,
            'started_at' => now()->subSeconds($validated['time_seconds'] ?? 0),
            'completed_at' => now(),
        ]);

        $progress = $user->gameProgress()->firstOrCreate(
            ['game_id' => $game->id],
            ['best_score' => 0, 'attempts' => 0, 'unlocked' => true]
        );

        $newBest = $validated['score'] > $progress->best_score;
        $progress->update([
            'best_score' => max($progress->best_score, $validated['score']),
            'attempts' => $progress->attempts + 1,
            'last_played_at' => now(),
        ]);

        app(BadgeAwardService::class)->checkGameComplete($user, $game, $validated['score']);

        return response()->json([
            'session_id' => $session->id,
            'score' => $validated['score'],
            'best_score' => $progress->best_score,
            'new_best' => $newBest,
        ]);
    }
}
