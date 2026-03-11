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
            'title' => 'required|string|max:255',
            'max_score' => 'nullable|integer'
        ]);

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
            'max_score' => 'nullable|integer'
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