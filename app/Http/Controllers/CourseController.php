<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\Request;


class CourseController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', Course::class);
        return Course::with('modules')->get();
    }

    public function store(Request $request)
    {
        $this->authorize('create', Course::class);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'difficulty' => 'nullable|string',
            'featured' => 'boolean'
        ]);

        return Course::create($validated);
    }

    public function show(Course $course)
    {
        $this->authorize('view', $course);
        return $course->load('modules');
    }

    public function update(Request $request, Course $course)
    {
        $this->authorize('update', $course);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'difficulty' => 'nullable|string',
            'featured' => 'boolean'
        ]);

        $course->update($validated);

        return $course;
    }

    public function destroy(Course $course)
    {
        $this->authorize('delete', $course);
        $course->delete();

        return response()->json(['message' => 'Curso removido com sucesso']);
    }

    public function toggleFeature(Course $course)
    {
        $this->authorize('update', $course);
        $course->featured = !$course->featured;
        $course->save();

        return $course;
    }
}