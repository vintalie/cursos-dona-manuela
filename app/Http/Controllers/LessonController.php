<?php

namespace App\Http\Controllers;

use App\Models\Lesson;
use Illuminate\Http\Request;

class LessonController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', Lesson::class);
        return Lesson::all();
    }

    public function store(Request $request)
    {
        $this->authorize('create', Lesson::class);

        $validated = $request->validate([
            'module_id' => 'required|exists:modules,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'position' => 'nullable|integer',
            'content' => 'nullable|string'
        ]);

        return Lesson::create($validated);
    }

    public function show(Lesson $lesson)
    {
        $this->authorize('view', $lesson);
        return $lesson;
    }

    public function update(Request $request, Lesson $lesson)
    {
        $this->authorize('update', $lesson);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'position' => 'nullable|integer',
            'content' => 'nullable|string'
        ]);

        $lesson->update($validated);

        return $lesson;
    }

    public function destroy(Lesson $lesson)
    {
        $this->authorize('delete', $lesson);
        $lesson->delete();

        return response()->json(['message' => 'Aula removida com sucesso']);
    }
}