<?php

namespace App\Http\Controllers;

use App\Models\Module;
use Illuminate\Http\Request;

class ModuleController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', Module::class);
        return Module::with('lessons')->get();
    }

    public function store(Request $request)
    {
        $this->authorize('create', Module::class);

        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string'
        ]);

        return Module::create($validated);
    }

    public function show(Module $module)
    {
        $this->authorize('view', $module);
        return $module->load('lessons');
    }

    public function update(Request $request, Module $module)
    {
        $this->authorize('update', $module);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string'
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