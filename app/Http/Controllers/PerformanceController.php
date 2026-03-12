<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Course;
use App\Models\Assessment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PerformanceController extends Controller
{
    const APPROVAL_THRESHOLD = 70;

    /**
     * Overview for manager: users list, courses, overall stats
     */
    public function overview(Request $request)
    {
        $user = $request->user();
        if ($user->tipo !== 'gerente') {
            return response()->json(['message' => 'Não autorizado'], 403);
        }

        $users = User::where('tipo', 'aluno')->get()->map(function ($u) {
            $stats = $this->getUserStats($u->id);
            $coursesCompleted = DB::table('course_user')
                ->where('user_id', $u->id)
                ->where('progress', 100)
                ->count();
            return [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'courses_completed' => $coursesCompleted,
                'average_score' => $stats['average_score'],
                'assessments_completed' => $stats['assessments_completed'],
                'approved' => $stats['approved'],
            ];
        });

        $courses = Course::with('category')->get(['id', 'title', 'category_id']);

        $overall = $this->getOverallStats();

        return response()->json([
            'users' => $users,
            'courses' => $courses,
            'overall' => $overall,
        ]);
    }

    /**
     * Stats for a specific course (for manager dashboard)
     */
    public function courseStats(Request $request, Course $course)
    {
        $user = $request->user();
        if ($user->tipo !== 'gerente') {
            return response()->json(['message' => 'Não autorizado'], 403);
        }

        $moduleIds = $course->modules()->pluck('id');
        $assessmentIds = Assessment::whereIn('module_id', $moduleIds)->pluck('id');

        $completions = DB::table('assessment_user')
            ->whereIn('assessment_id', $assessmentIds)
            ->join('assessments', 'assessments.id', '=', 'assessment_user.assessment_id')
            ->select(
                'assessment_user.user_id',
                'assessment_user.score',
                'assessment_user.completed_at',
                'assessments.max_score'
            )
            ->get();

        $totalScore = 0;
        $totalMax = 0;
        $timeline = [];
        $userResults = [];

        foreach ($completions as $c) {
            $max = $c->max_score ?? 100;
            $score = $c->score ?? 0;
            $pct = $max > 0 ? round(($score / $max) * 100) : 0;
            $totalScore += $score;
            $totalMax += $max;

            $date = date('Y-m-d', strtotime($c->completed_at));
            if (!isset($timeline[$date])) {
                $timeline[$date] = ['total' => 0, 'sum' => 0, 'count' => 0];
            }
            $timeline[$date]['sum'] += $pct;
            $timeline[$date]['count']++;
            $timeline[$date]['total'] = $timeline[$date]['count'] > 0
                ? round($timeline[$date]['sum'] / $timeline[$date]['count'])
                : 0;

            if (!isset($userResults[$c->user_id])) {
                $userResults[$c->user_id] = ['total' => 0, 'max' => 0, 'count' => 0];
            }
            $userResults[$c->user_id]['total'] += $score;
            $userResults[$c->user_id]['max'] += $max;
            $userResults[$c->user_id]['count']++;
        }

        $acertosPct = $totalMax > 0 ? round(($totalScore / $totalMax) * 100) : 0;
        $errosPct = 100 - $acertosPct;

        $approved = 0;
        $failed = 0;
        foreach ($userResults as $ur) {
            if ($ur['count'] === 0) continue;
            $avg = $ur['max'] > 0 ? ($ur['total'] / $ur['max']) * 100 : 0;
            if ($avg >= self::APPROVAL_THRESHOLD) {
                $approved++;
            } else {
                $failed++;
            }
        }

        $timelineData = collect($timeline)->map(fn ($v, $k) => [
            'date' => $k,
            'media' => $v['total'],
        ])->sortKeys()->values();

        $pieData = [
            ['name' => 'Aprovados', 'value' => $approved, 'color' => '#22c55e'],
            ['name' => 'Reprovados', 'value' => $failed, 'color' => '#ef4444'],
        ];
        if ($approved === 0 && $failed === 0) {
            $pieData = [['name' => 'Sem dados', 'value' => 1, 'color' => '#94a3b8']];
        }

        return response()->json([
            'course' => ['id' => $course->id, 'title' => $course->title],
            'speedometer' => ['acertos' => $acertosPct, 'erros' => $errosPct],
            'timeline' => $timelineData,
            'pie' => $pieData,
            'total_assessments' => $completions->count(),
        ]);
    }

    /**
     * Current user's performance (for aluno or gerente viewing own)
     */
    public function myPerformance(Request $request)
    {
        $user = $request->user();
        return response()->json($this->getUserPerformanceData($user->id));
    }

    /**
     * Specific user's performance (for gerente)
     */
    public function userPerformance(Request $request, User $user)
    {
        $auth = $request->user();
        if ($auth->tipo !== 'gerente') {
            return response()->json(['message' => 'Não autorizado'], 403);
        }

        return response()->json($this->getUserPerformanceData($user->id));
    }

    private function getUserPerformanceData(int $userId): array
    {
        $stats = $this->getUserStats($userId);
        $courses = $this->getUserCourseProgress($userId);
        $timeline = $this->getUserTimeline($userId);

        return [
            'user' => User::find($userId)->only(['id', 'name', 'email']),
            'stats' => $stats,
            'courses' => $courses,
            'timeline' => $timeline,
        ];
    }

    private function getUserStats(int $userId): array
    {
        $completions = DB::table('assessment_user')
            ->join('assessments', 'assessments.id', '=', 'assessment_user.assessment_id')
            ->where('assessment_user.user_id', $userId)
            ->whereNotNull('assessments.max_score')
            ->where('assessments.max_score', '>', 0)
            ->select('assessment_user.score', 'assessments.max_score')
            ->get();

        $totalScore = 0;
        $totalMax = 0;
        foreach ($completions as $c) {
            $totalScore += $c->score ?? 0;
            $totalMax += $c->max_score ?? 0;
        }

        $averageScore = $totalMax > 0 ? round(($totalScore / $totalMax) * 100) : 0;
        $approved = $averageScore >= self::APPROVAL_THRESHOLD;

        return [
            'average_score' => $averageScore,
            'assessments_completed' => DB::table('assessment_user')->where('user_id', $userId)->count(),
            'courses_completed' => DB::table('course_user')->where('user_id', $userId)->where('progress', 100)->count(),
            'approved' => $approved,
        ];
    }

    private function getUserCourseProgress(int $userId): array
    {
        return DB::table('course_user')
            ->join('courses', 'courses.id', '=', 'course_user.course_id')
            ->where('course_user.user_id', $userId)
            ->select('courses.id', 'courses.title', 'course_user.progress')
            ->get()
            ->map(fn ($r) => [
                'id' => $r->id,
                'title' => $r->title,
                'progress' => $r->progress,
            ])
            ->toArray();
    }

    private function getUserTimeline(int $userId): array
    {
        $rows = DB::table('assessment_user')
            ->join('assessments', 'assessments.id', '=', 'assessment_user.assessment_id')
            ->join('modules', 'modules.id', '=', 'assessments.module_id')
            ->join('courses', 'courses.id', '=', 'modules.course_id')
            ->where('assessment_user.user_id', $userId)
            ->select(
                'assessment_user.completed_at',
                'assessment_user.score',
                'assessments.max_score',
                'assessments.title as assessment_title',
                'courses.title as course_title'
            )
            ->orderBy('assessment_user.completed_at')
            ->get();

        $byDate = [];
        foreach ($rows as $r) {
            $max = $r->max_score ?? 100;
            $pct = $max > 0 ? round((($r->score ?? 0) / $max) * 100) : 0;
            $date = date('Y-m-d', strtotime($r->completed_at));
            if (!isset($byDate[$date])) {
                $byDate[$date] = ['total' => 0, 'count' => 0];
            }
            $byDate[$date]['total'] += $pct;
            $byDate[$date]['count']++;
        }

        return collect($byDate)->map(fn ($v, $k) => [
            'date' => $k,
            'media' => $v['count'] > 0 ? round($v['total'] / $v['count']) : 0,
        ])->sortKeys()->values()->toArray();
    }

    private function getOverallStats(): array
    {
        $alunos = User::where('tipo', 'aluno')->pluck('id');
        $approved = 0;
        $failed = 0;
        foreach ($alunos as $aid) {
            $s = $this->getUserStats($aid);
            if ($s['approved']) {
                $approved++;
            } else {
                $failed++;
            }
        }

        $totalCompletions = DB::table('assessment_user')->count();
        $totalScore = DB::table('assessment_user')
            ->join('assessments', 'assessments.id', '=', 'assessment_user.assessment_id')
            ->whereNotNull('assessments.max_score')
            ->where('assessments.max_score', '>', 0)
            ->selectRaw('SUM(assessment_user.score) as s, SUM(assessments.max_score) as m')
            ->first();
        $avg = ($totalScore && $totalScore->m > 0) ? round(($totalScore->s / $totalScore->m) * 100) : 0;

        return [
            'total_users' => $alunos->count(),
            'approved' => $approved,
            'failed' => $failed,
            'average_score' => $avg,
            'total_assessments' => $totalCompletions,
        ];
    }
}
