<?php

namespace App\Http\Controllers;

use App\Models\TrainingModule;
use App\Models\User;
use Illuminate\Http\Request;
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

        $quizScores = [
            ['label' => 'Quiz 1', 'score' => 0],
            ['label' => 'Quiz 2', 'score' => 0],
            ['label' => 'Quiz 3', 'score' => 0],
        ];

        $simulationCompletion = 0;
        $awarenessLevel = 'Low';

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

        return response()->json([
            'totals' => [
                'total_users' => $totalUsers,
                'active_participants' => $activeParticipants,
                'average_quiz_score' => null,
            ],
            'most_failed_cyber_threats' => [],
            'user_analytics' => [
                'roles' => [
                    'admin' => (int) ($roleCounts['admin'] ?? 0),
                    'user' => (int) ($roleCounts['user'] ?? 0),
                ],
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
