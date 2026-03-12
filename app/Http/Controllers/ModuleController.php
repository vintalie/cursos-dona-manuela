<?php

namespace App\Http\Controllers;

use App\Models\Module;
use Illuminate\Http\Request;

class ModuleController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', Module::class);
        return Module::with([
            'lessons' => fn ($q) => $q->orderBy('position'),
            'assessments' => fn ($q) => $q->orderBy('position'),
        ])->orderBy('position')->get();
    }

    public function store(Request $request)
    {
        $this->authorize('create', Module::class);

        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'position' => 'nullable|integer',
            'content' => 'nullable|string'
        ]);

        return Module::create($validated);
    }

    public function show(Module $module)
    {
        $this->authorize('view', $module);
        return $module->load([
            'lessons' => fn($q) => $q->orderBy('position'),
            'assessments' => fn($q) => $q->orderBy('position')->with('questions.options')
        ]);
    }

    public function update(Request $request, Module $module)
    {
        $this->authorize('update', $module);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'position' => 'nullable|integer',
            'content' => 'nullable|string'
        ]);

        $module->update($validated);

        return $module;
    }

    public function destroy(Module $module)
    {
        $this->authorize('delete', $module);
        $module->delete();

        return response()->json(['message' => 'Módulo removido com sucesso']);
    }
}