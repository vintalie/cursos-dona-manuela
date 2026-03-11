<?php

namespace App\Http\Controllers;

use App\Models\Question;
use Illuminate\Http\Request;

class QuestionController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', Question::class);
        return Question::with('options')->get();
    }

    public function store(Request $request)
    {
        $this->authorize('create', Question::class);

        $validated = $request->validate([
            'assessment_id' => 'required|exists:assessments,id',
            'text' => 'required|string',
            'score' => 'nullable|integer'
        ]);

        return Question::create($validated);
    }

    public function show(Question $question)
    {
        $this->authorize('view', $question);
        return $question->load('options');
    }

    public function update(Request $request, Question $question)
    {
        $this->authorize('update', $question);

        $validated = $request->validate([
            'text' => 'sometimes|string',
            'score' => 'nullable|integer'
        ]);

        $question->update($validated);

        return $question;
    }

    public function destroy(Question $question)
    {
        $this->authorize('delete', $question);
        $question->delete();

        return response()->json(['message' => 'Pergunta removida']);
    }
}