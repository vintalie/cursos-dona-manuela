<?php

namespace App\Http\Controllers;

use App\Models\Game;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class GameAdminController extends Controller
{
    public function index()
    {
        $games = Game::orderBy('order')->orderBy('title')->get();

        return response()->json(['games' => $games]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'type'        => 'required|in:memory,ordering,visual_quiz,true_false,matching,word_scramble,next_ingredient',
            'config'      => 'required|array',
            'course_id'   => 'nullable|exists:courses,id',
            'module_id'   => 'nullable|exists:modules,id',
            'order'       => 'nullable|integer|min:0',
            'is_active'   => 'nullable|boolean',
        ]);

        $validated['slug'] = Str::slug($validated['title']) . '-' . uniqid();
        $validated['is_active'] = $validated['is_active'] ?? true;
        $validated['order'] = $validated['order'] ?? 0;

        $game = Game::create($validated);

        return response()->json($game, 201);
    }

    public function update(Request $request, Game $game)
    {
        $validated = $request->validate([
            'title'       => 'sometimes|required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'type'        => 'sometimes|required|in:memory,ordering,visual_quiz,true_false,matching,word_scramble,next_ingredient',
            'config'      => 'sometimes|required|array',
            'course_id'   => 'nullable|exists:courses,id',
            'module_id'   => 'nullable|exists:modules,id',
            'order'       => 'nullable|integer|min:0',
            'is_active'   => 'nullable|boolean',
        ]);

        if (isset($validated['title']) && $validated['title'] !== $game->title) {
            $validated['slug'] = Str::slug($validated['title']) . '-' . uniqid();
        }

        $game->update($validated);

        return response()->json($game);
    }

    public function destroy(Game $game)
    {
        $game->delete();

        return response()->json(null, 204);
    }
}
