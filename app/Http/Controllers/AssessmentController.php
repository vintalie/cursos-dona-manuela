<?php

namespace App\Http\Controllers;

use App\Models\Assessment;
use Illuminate\Http\Request;

class AssessmentController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', Assessment::class);
        return Assessment::with('questions')->get();
    }

    public function store(Request $request)
    {
        $this->authorize('create', Assessment::class);

        $validated = $request->validate([
            'module_id' => 'required|exists:modules,id',
            'lesson_id' => 'nullable|exists:lessons,id',
            'title' => 'required|string|max:255',
            'max_score' => 'nullable|integer',
            'min_score' => 'nullable|integer',
            'position' => 'nullable|integer',
            'worth_points' => 'nullable|boolean'
        ]);
        // Avaliação em aula: não vale nota. Em matéria: vale nota.
        $validated['worth_points'] = empty($validated['lesson_id']);

        // Module-level assessment: only one per module
        if (empty($validated['lesson_id'])) {
            $exists = Assessment::where('module_id', $validated['module_id'])->whereNull('lesson_id')->exists();
            if ($exists) {
                return response()->json(['message' => 'O módulo já possui uma avaliação de nível módulo.'], 422);
            }
        }

        return Assessment::create($validated);
    }

    public function show(Assessment $assessment)
    {
        $this->authorize('view', $assessment);
        return $assessment->load('questions.options');
    }

    public function update(Request $request, Assessment $assessment)
    {
        $this->authorize('update', $assessment);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'max_score' => 'nullable|integer',
            'min_score' => 'nullable|integer',
            'position' => 'nullable|integer'
        ]);

        $assessment->update($validated);

        return $assessment;
    }

    public function destroy(Assessment $assessment)
    {
        $this->authorize('delete', $assessment);
        $assessment->delete();

        return response()->json(['message' => 'Avaliação removida']);
    }
}