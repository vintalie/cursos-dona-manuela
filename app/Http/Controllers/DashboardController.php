<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Badge;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['message' => 'Não autenticado'], 401);
        }

        $featured = Course::with(['category', 'modules'])
            ->where('featured', true)
            ->get()
            ->map(fn ($c) => $this->formatCourse($c, $user));

        $enrolled = $user->courses()
            ->with(['category', 'modules.lessons', 'modules.assessments'])
            ->get()
            ->map(fn ($c) => [
                'id' => $c->id,
                'title' => $c->title,
                'short_description' => $c->short_description,
                'progress' => $c->pivot->progress ?? 0,
                'category' => $c->category,
            ]);

        $badges = $user->badges()
            ->withPivot(['course_id', 'earned_at'])
            ->orderByPivot('earned_at', 'desc')
            ->get()
            ->map(fn ($b) => [
                'id' => $b->id,
                'title' => $b->title,
                'short_description' => $b->short_description,
                'long_description' => $b->long_description,
                'image' => $b->image,
                'icon' => $b->icon,
                'earned_at' => $b->pivot->earned_at,
            ]);

        return response()->json([
            'featured_courses' => $featured,
            'courses_in_progress' => $enrolled,
            'badges' => $badges,
        ]);
    }

    private function formatCourse(Course $course, $user)
    {
        $pivot = $course->users()->where('user_id', $user->id)->first();
        $badges = $user->badges()
            ->wherePivot('course_id', $course->id)
            ->get(['badges.id', 'badges.title', 'badges.icon', 'badges.image']);

        return [
            'id' => $course->id,
            'title' => $course->title,
            'short_description' => $course->short_description,
            'category' => $course->category,
            'progress' => $pivot ? (int) $pivot->pivot->progress : 0,
            'badges' => $badges,
        ];
    }
}
