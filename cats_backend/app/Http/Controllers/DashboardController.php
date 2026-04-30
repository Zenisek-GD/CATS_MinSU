<?php

namespace App\Http\Controllers;

use App\Models\Certificate;
use App\Models\QuizAttempt;
use App\Models\QuizAttemptAnswer;
use App\Models\QuizCategory;
use App\Models\SimulationRun;
use App\Models\TrainingModule;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function userDashboard(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $totalModules = TrainingModule::query()->count();
        $completedModules = 0;
        $trainingPercent = $totalModules > 0 ? (int) floor(($completedModules / $totalModules) * 100) : 0;

        // Real quiz scores from recent attempts
        $recentAttempts = QuizAttempt::query()
            ->where('user_id', $user->id)
            ->where('status', 'submitted')
            ->orderByDesc('updated_at')
            ->limit(5)
            ->get(['id', 'quiz_id', 'score', 'max_score', 'updated_at']);

        $quizScores = $recentAttempts->map(fn($a, $i) => [
            'label' => 'Attempt ' . ($i + 1),
            'score' => $a->max_score > 0 ? round(($a->score / $a->max_score) * 100) : 0,
        ])->values()->toArray();

        if (empty($quizScores)) {
            $quizScores = [['label' => 'No attempts', 'score' => 0]];
        }

        // Simulation completion
        $totalRuns = SimulationRun::query()->where('user_id', $user->id)->count();
        $completedRuns = SimulationRun::query()->where('user_id', $user->id)->where('status', 'completed')->count();
        $simulationCompletion = $totalRuns > 0 ? (int) round(($completedRuns / $totalRuns) * 100) : 0;

        // Awareness level based on average quiz score
        $avgScore = QuizAttempt::query()
            ->where('user_id', $user->id)
            ->where('status', 'submitted')
            ->where('max_score', '>', 0)
            ->selectRaw('AVG(score * 100.0 / max_score) as avg_pct')
            ->value('avg_pct');

        $awarenessLevel = 'Low';
        if ($avgScore !== null) {
            if ($avgScore >= 80) $awarenessLevel = 'High';
            elseif ($avgScore >= 60) $awarenessLevel = 'Medium';
        }

        return response()->json([
            'welcome' => 'Welcome, ' . $user->name . '!',
            'training_progress' => [
                'completed_modules' => $completedModules,
                'total_modules' => $totalModules,
                'percent' => $trainingPercent,
            ],
            'quiz_scores' => $quizScores,
            'simulation_completion_percent' => $simulationCompletion,
            'cyber_awareness_level' => $awarenessLevel,
            'badges' => [],
            'certificates' => [],
            'recent_activities' => [
                ['text' => 'Logged in', 'at' => now()->toIso8601String()],
            ],
            'notifications' => [],
        ]);
    }

    public function adminDashboard(Request $request)
    {
        $totalUsers = User::query()->count();

        $since = now()->subDay()->timestamp;
        $activeParticipants = (int) DB::table('sessions')
            ->whereNotNull('user_id')
            ->where('last_activity', '>=', $since)
            ->distinct('user_id')
            ->count('user_id');

        $roleCounts = User::query()
            ->select('role', DB::raw('COUNT(*) as count'))
            ->groupBy('role')
            ->pluck('count', 'role');

        $modulesTotal = TrainingModule::query()->count();
        $modulesActive = TrainingModule::query()->where('is_active', true)->count();

        // Quiz completion rate
        $totalAttempts = QuizAttempt::query()->count();
        $completedAttempts = QuizAttempt::query()->where('status', 'submitted')->count();
        $quizCompletionRate = $totalAttempts > 0 ? round(($completedAttempts / $totalAttempts) * 100, 1) : 0;

        // Simulation completion rate
        $totalRuns = SimulationRun::query()->count();
        $completedRuns = SimulationRun::query()->where('status', 'completed')->count();
        $simCompletionRate = $totalRuns > 0 ? round(($completedRuns / $totalRuns) * 100, 1) : 0;

        // Average awareness score
        $avgQuizScore = QuizAttempt::query()
            ->where('status', 'submitted')
            ->where('max_score', '>', 0)
            ->selectRaw('ROUND(AVG(score * 100.0 / max_score), 1) as avg_pct')
            ->value('avg_pct');

        // Most failed category
        $mostFailedCategory = DB::table('quiz_attempt_answers as qaa')
            ->join('quiz_questions as qq', 'qaa.question_id', '=', 'qq.id')
            ->join('quizzes as qz', 'qq.quiz_id', '=', 'qz.id')
            ->join('quiz_categories as qc', 'qz.category_id', '=', 'qc.id')
            ->where('qaa.is_correct', false)
            ->select('qc.name', DB::raw('COUNT(*) as fail_count'))
            ->groupBy('qc.name')
            ->orderByDesc('fail_count')
            ->first();

        // Certificates issued
        $certificatesIssued = Certificate::query()->count();

        // Most active users (by attempts + runs)
        $mostActiveUsers = DB::select("
            SELECT u.id, u.name, u.email,
                   COALESCE(qa.attempt_count, 0) + COALESCE(sr.run_count, 0) as activity_count,
                   COALESCE(qa.attempt_count, 0) as quiz_attempts,
                   COALESCE(sr.run_count, 0) as simulation_runs
            FROM users u
            LEFT JOIN (SELECT user_id, COUNT(*) as attempt_count FROM quiz_attempts GROUP BY user_id) qa ON qa.user_id = u.id
            LEFT JOIN (SELECT user_id, COUNT(*) as run_count FROM simulation_runs GROUP BY user_id) sr ON sr.user_id = u.id
            WHERE u.role = 'user'
            ORDER BY activity_count DESC
            LIMIT 10
        ");

        // User growth (last 12 months)
        $userGrowth = DB::table('users')
            ->where('created_at', '>=', now()->subMonths(12))
            ->select(DB::raw("DATE_FORMAT(created_at, '%Y-%m') as month"), DB::raw('COUNT(*) as count'))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Quiz score trends (last 12 months)
        $quizTrends = DB::table('quiz_attempts')
            ->where('status', 'submitted')
            ->where('max_score', '>', 0)
            ->where('updated_at', '>=', now()->subMonths(12))
            ->select(
                DB::raw("DATE_FORMAT(updated_at, '%Y-%m') as month"),
                DB::raw('ROUND(AVG(score * 100.0 / max_score), 1) as avg_score')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Threat category performance
        $categoryPerformance = DB::table('quiz_attempt_answers as qaa')
            ->join('quiz_questions as qq', 'qaa.question_id', '=', 'qq.id')
            ->join('quizzes as qz', 'qq.quiz_id', '=', 'qz.id')
            ->join('quiz_categories as qc', 'qz.category_id', '=', 'qc.id')
            ->select(
                'qc.name as category',
                DB::raw('COUNT(*) as total'),
                DB::raw('SUM(CASE WHEN qaa.is_correct = 1 THEN 1 ELSE 0 END) as correct')
            )
            ->groupBy('qc.name')
            ->get()
            ->map(fn($r) => [
                'category' => $r->category,
                'total' => (int) $r->total,
                'correct' => (int) $r->correct,
                'percent' => $r->total > 0 ? round(($r->correct / $r->total) * 100, 1) : 0,
            ]);

        // Daily activity (last 30 days)
        $dailyActivity = DB::select("
            SELECT d.date,
                   COALESCE(qa.count, 0) as quiz_attempts,
                   COALESCE(sr.count, 0) as simulation_runs
            FROM (
                SELECT DATE(DATE_SUB(CURDATE(), INTERVAL n DAY)) as date
                FROM (SELECT 0 n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4
                      UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9
                      UNION SELECT 10 UNION SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14
                      UNION SELECT 15 UNION SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19
                      UNION SELECT 20 UNION SELECT 21 UNION SELECT 22 UNION SELECT 23 UNION SELECT 24
                      UNION SELECT 25 UNION SELECT 26 UNION SELECT 27 UNION SELECT 28 UNION SELECT 29) nums
            ) d
            LEFT JOIN (SELECT DATE(created_at) as dt, COUNT(*) as count FROM quiz_attempts GROUP BY dt) qa ON qa.dt = d.date
            LEFT JOIN (SELECT DATE(started_at) as dt, COUNT(*) as count FROM simulation_runs GROUP BY dt) sr ON sr.dt = d.date
            ORDER BY d.date
        ");

        // Simulation completion analytics
        $simAnalytics = [
            'completed' => $completedRuns,
            'in_progress' => SimulationRun::query()->where('status', 'in_progress')->count(),
            'expired' => SimulationRun::query()->where('status', 'expired')->count(),
        ];

        return response()->json([
            'totals' => [
                'total_users' => $totalUsers,
                'active_participants' => $activeParticipants,
                'average_quiz_score' => $avgQuizScore ? (float) $avgQuizScore : null,
                'quiz_completion_rate' => $quizCompletionRate,
                'simulation_completion_rate' => $simCompletionRate,
                'certificates_issued' => $certificatesIssued,
                'most_failed_category' => $mostFailedCategory->name ?? null,
            ],
            'most_active_users' => $mostActiveUsers,
            'most_failed_cyber_threats' => $categoryPerformance->where('percent', '<', 70)
                ->sortBy('percent')->values()->map(fn($c) => ['title' => $c['category'], 'count' => $c['total'] - $c['correct']])->take(5)->values(),
            'user_analytics' => [
                'roles' => [
                    'admin' => (int) ($roleCounts['admin'] ?? 0),
                    'user' => (int) ($roleCounts['user'] ?? 0),
                ],
            ],
            'charts' => [
                'user_growth' => $userGrowth,
                'quiz_trends' => $quizTrends,
                'category_performance' => $categoryPerformance,
                'daily_activity' => $dailyActivity,
                'simulation_analytics' => $simAnalytics,
            ],
            'system_reports' => [
                ['title' => 'System status', 'value' => 'OK', 'at' => now()->toIso8601String()],
            ],
            'training_modules' => [
                'total' => $modulesTotal,
                'active' => $modulesActive,
            ],
        ]);
    }
}
