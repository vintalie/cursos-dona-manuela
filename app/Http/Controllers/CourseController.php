<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Lesson;
use App\Models\Assessment;
use App\Services\BadgeAwardService;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;


class CourseController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', Course::class);
        $courses = Course::with(['modules' => fn ($q) => $q->orderBy('position')->with([
            'lessons' => fn ($l) => $l->orderBy('position'),
            'assessments' => fn ($a) => $a->orderBy('position'),
        ]), 'category'])->get();

        $user = auth()->user();
        if ($user) {
            $courses->each(function ($course) use ($user) {
                $course->user_badges = $user->badges()
                    ->wherePivot('course_id', $course->id)
                    ->get(['badges.id', 'badges.title', 'badges.icon', 'badges.image']);
                $pivot = $course->users()->where('user_id', $user->id)->first();
                $course->is_enrolled = (bool) $pivot;
                $course->user_progress = $pivot ? (int) $pivot->pivot->progress : 0;
            });
        }

        return $courses;
    }

    public function store(Request $request)
    {
        $this->authorize('create', Course::class);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category_id' => 'nullable|exists:categories,id',
            'short_description' => 'nullable|string',
            'description' => 'nullable|string',
            'difficulty' => 'nullable|string',
            'featured' => 'boolean'
        ]);

        return Course::create($validated);
    }

    public function show(Course $course)
    {
        $this->authorize('view', $course);
        $course->load(['modules' => fn($q) => $q->orderBy('position')->with(['lessons', 'assessments.questions.options'])]);
        $user = auth()->user();
        $course->is_enrolled = false;
        if ($user) {
            $pivot = $course->users()->where('user_id', $user->id)->first();
            $course->is_enrolled = (bool) $pivot;
            $course->user_progress = $pivot ? $pivot->pivot->progress : 0;
            $lessonIds = $course->modules->flatMap->lessons->pluck('id')->flatten()->unique()->toArray();
            $assessmentIds = $course->modules->flatMap->assessments->pluck('id')->flatten()->unique()->toArray();
            $course->completed_lesson_ids = $pivot && !empty($lessonIds)
                ? $user->completedLessons()->whereIn('lessons.id', $lessonIds)->pluck('lessons.id')->toArray()
                : [];
            $course->completed_assessment_ids = $pivot && !empty($assessmentIds)
                ? $user->completedAssessments()->whereIn('assessments.id', $assessmentIds)->pluck('assessments.id')->toArray()
                : [];
        }
        return $course;
    }

    public function update(Request $request, Course $course)
    {
        $this->authorize('update', $course);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'category_id' => 'nullable|exists:categories,id',
            'short_description' => 'nullable|string',
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

    public function enroll(Course $course)
    {
        $user = auth()->user();
        if ($course->users()->where('user_id', $user->id)->exists()) {
            return response()->json(['message' => 'Já matriculado', 'course' => $course->load('modules.lessons', 'modules.assessments')], 200);
        }
        $course->users()->attach($user->id, ['progress' => 0]);
        NotificationService::courseStarted($user, $course->title, $course->id);
        return response()->json(['message' => 'Matriculado com sucesso', 'course' => $course->load('modules.lessons', 'modules.assessments')], 201);
    }

    public function completeLesson(Request $request, Course $course, Lesson $lesson)
    {
        $user = auth()->user();
        if ($lesson->module->course_id !== $course->id) {
            return response()->json(['message' => 'Aula não pertence ao curso'], 404);
        }
        $course->users()->syncWithoutDetaching([$user->id => []]);
        $user->completedLessons()->syncWithoutDetaching([$lesson->id => ['completed_at' => now()]]);
        $this->recalculateProgress($course, $user);

        $badgeService = app(BadgeAwardService::class);
        $badgeService->checkModuleComplete($user, $lesson->module);
        $badgeService->checkCourseComplete($user, $course);

        $pivot = $course->users()->where('user_id', $user->id)->first()->pivot;
        return response()->json(['message' => 'Aula concluída', 'progress' => $pivot->progress]);
    }

    public function completeAssessment(Request $request, Course $course, Assessment $assessment)
    {
        $user = auth()->user();
        if ($assessment->module->course_id !== $course->id) {
            return response()->json(['message' => 'Avaliação não pertence ao curso'], 404);
        }
        $score = $request->input('score');
        $course->users()->syncWithoutDetaching([$user->id => []]);
        $user->completedAssessments()->syncWithoutDetaching([$assessment->id => ['score' => $score ?? 0, 'completed_at' => now()]]);
        $this->recalculateProgress($course, $user);
        app(BadgeAwardService::class)->checkModuleComplete($user, $assessment->module);
        app(BadgeAwardService::class)->checkCourseComplete($user, $course);
        $pivot = $course->users()->where('user_id', $user->id)->first()->pivot;
        return response()->json(['message' => 'Avaliação concluída', 'progress' => $pivot->progress]);
    }

    private function recalculateProgress(Course $course, $user)
    {
        $course->load(['modules.lessons', 'modules.assessments']);
        $lessonIds = $course->modules->flatMap(fn ($m) => $m->lessons->pluck('id'))->flatten()->unique()->toArray();
        $assessmentIds = $course->modules->flatMap(fn ($m) => $m->assessments->pluck('id'))->flatten()->unique()->toArray();
        $total = count($lessonIds) + count($assessmentIds);
        if ($total === 0) {
            return;
        }
        $completedLessons = DB::table('lesson_user')->where('user_id', $user->id)->whereIn('lesson_id', $lessonIds)->count();
        $completedAssessments = DB::table('assessment_user')->where('user_id', $user->id)->whereIn('assessment_id', $assessmentIds)->count();
        $progress = (int) round((($completedLessons + $completedAssessments) / $total) * 100);
        $course->users()->updateExistingPivot($user->id, [
            'progress' => min(100, $progress),
            'completed_at' => $progress >= 100 ? now() : null
        ]);
    }
}