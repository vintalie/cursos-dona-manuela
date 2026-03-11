<?php

namespace App\Http\Controllers;

use App\Models\Option;
use Illuminate\Http\Request;

class OptionController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', Option::class);
        return Option::all();
    }

    public function store(Request $request)
    {
        $this->authorize('create', Option::class);

        $validated = $request->validate([
            'question_id' => 'required|exists:questions,id',
            'label' => 'required|string',
            'text' => 'required|string',
            'is_correct' => 'boolean'
        ]);

        return Option::create($validated);
    }

    public function show(Option $option)
    {
        $this->authorize('view', $option);
        return $option;
    }

    public function update(Request $request, Option $option)
    {
        $this->authorize('update', $option);

        $validated = $request->validate([
            'text' => 'sometimes|string',
            'is_correct' => 'boolean'
        ]);

        $option->update($validated);

        return $option;
    }

    public function destroy(Option $option)
    {
        $this->authorize('delete', $option);
        $option->delete();

        return response()->json(['message' => 'Alternativa removida']);
    }
}