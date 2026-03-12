<?php

namespace App\Services;

use App\Models\Badge;
use App\Models\Game;
use App\Models\User;
use App\Models\Course;
use App\Models\Module;
use App\Services\NotificationService;

class BadgeAwardService
{
    public function checkModuleComplete(User $user, Module $module): void
    {
        $lessons = $module->lessons;
        $assessments = $module->assessments;
        $completedLessons = $user->completedLessons()->whereIn('lessons.id', $lessons->pluck('id'))->count();
        $completedAssessments = $user->completedAssessments()->whereIn('assessments.id', $assessments->pluck('id'))->count();

        if ($completedLessons < $lessons->count() || $completedAssessments < $assessments->count()) {
            return;
        }

        $perfect = $this->isModulePerfect($user, $module);
        $badges = Badge::where('criteria_type', 'module_perfect')->get();
        $badges = $badges->filter(function ($b) use ($module) {
            $params = $b->criteria_params ?? [];
            return empty($params['module_id']) || (int) $params['module_id'] === $module->id;
        });

        foreach ($badges as $badge) {
            if ($perfect && !$user->badges()->where('badge_id', $badge->id)->exists()) {
                $user->badges()->attach($badge->id, [
                    'course_id' => $module->course_id,
                    'module_id' => $module->id,
                    'earned_at' => now(),
                ]);
                NotificationService::badgeEarned(
                    $user,
                    $badge->title,
                    $badge->notification_message ?? "Parabéns! Você conquistou a medalha \"{$badge->title}\".",
                    $badge->id,
                    $module->course_id
                );
            }
        }
    }

    public function checkCourseComplete(User $user, Course $course): void
    {
        $course->load(['modules.lessons', 'modules.assessments']);
        $lessonIds = $course->modules->flatMap->lessons->pluck('id');
        $assessmentIds = $course->modules->flatMap->assessments->pluck('id');
        $totalLessons = $lessonIds->count();
        $totalAssessments = $assessmentIds->count();
        $completedLessons = $user->completedLessons()->whereIn('lessons.id', $lessonIds)->count();
        $completedAssessments = $user->completedAssessments()->whereIn('assessments.id', $assessmentIds)->count();

        if ($completedLessons < $totalLessons || $completedAssessments < $totalAssessments) {
            return;
        }

        $perfect = $this->isCoursePerfect($user, $course);
        $badges = Badge::whereIn('criteria_type', ['course_perfect', 'course_complete'])->get();
        $badges = $badges->filter(function ($b) use ($course) {
            $params = $b->criteria_params ?? [];
            return empty($params['course_id']) || (int) $params['course_id'] === $course->id;
        });

        foreach ($badges as $badge) {
            if (!$user->badges()->where('badge_id', $badge->id)->exists()) {
                $award = false;
                if ($badge->criteria_type === 'course_complete') {
                    $award = true;
                } elseif ($badge->criteria_type === 'course_perfect' && $perfect) {
                    $award = true;
                }
                if ($award) {
                    $user->badges()->attach($badge->id, [
                        'course_id' => $course->id,
                        'module_id' => null,
                        'earned_at' => now(),
                    ]);
                    NotificationService::badgeEarned(
                        $user,
                        $badge->title,
                        $badge->notification_message ?? "Parabéns! Você conquistou a medalha \"{$badge->title}\".",
                        $badge->id,
                        $course->id
                    );
                }
            }
        }
    }

    private function isModulePerfect(User $user, Module $module): bool
    {
        foreach ($module->assessments as $assessment) {
            $pivot = $user->completedAssessments()->where('assessments.id', $assessment->id)->first();
            if (!$pivot || !$pivot->pivot) return false;
            $minScore = $assessment->min_score ?? 0;
            if ($pivot->pivot->score < $minScore) return false;
        }
        return true;
    }

    public function checkGameComplete(User $user, Game $game, int $score): void
    {
        $badges = Badge::where('criteria_type', 'game_score')->get();
        $badges = $badges->filter(function ($b) use ($game) {
            $params = $b->criteria_params ?? [];
            return empty($params['game_id']) || (int) $params['game_id'] === $game->id;
        });

        foreach ($badges as $badge) {
            $params = $badge->criteria_params ?? [];
            $minScore = $params['min_score'] ?? 0;
            if ($score >= $minScore && !$user->badges()->where('badge_id', $badge->id)->exists()) {
                $user->badges()->attach($badge->id, [
                    'course_id' => $game->course_id,
                    'module_id' => $game->module_id,
                    'earned_at' => now(),
                ]);
                NotificationService::badgeEarned(
                    $user,
                    $badge->title,
                    $badge->notification_message ?? "Parabéns! Você conquistou a medalha \"{$badge->title}\".",
                    $badge->id,
                    $game->course_id
                );
            }
        }
    }

    private function isCoursePerfect(User $user, Course $course): bool
    {
        foreach ($course->modules as $module) {
            if (!$this->isModulePerfect($user, $module)) return false;
        }
        return true;
    }
}
