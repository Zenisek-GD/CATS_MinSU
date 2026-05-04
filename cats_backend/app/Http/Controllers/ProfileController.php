<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProfileController extends Controller
{
    /**
     * Get user profile with stats including achievements, badges, and progress
     */
    public function show(Request $request)
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Get user's achievements with details
        $achievements = $user->achievements()
            ->with('achievement')
            ->get()
            ->map(function ($ua) {
                return [
                    'id' => $ua->achievement->id,
                    'name' => $ua->achievement->name,
                    'description' => $ua->achievement->description,
                    'icon' => $ua->achievement->icon,
                    'xp_reward' => $ua->achievement->xp_reward,
                    'unlocked_at' => $ua->unlocked_at,
                ];
            });

        // Get user's badges with details
        $badges = $user->badges()
            ->with('badge')
            ->get()
            ->map(function ($ub) {
                return [
                    'id' => $ub->badge->id,
                    'name' => $ub->badge->name,
                    'description' => $ub->badge->description,
                    'icon' => $ub->badge->icon,
                    'awarded_at' => $ub->awarded_at,
                ];
            });

        // Get user's module progress
        $moduleProgress = $user->moduleProgress()
            ->with('module')
            ->get()
            ->map(function ($mp) {
                $module = $mp->module;
                return [
                    'module_id' => $module->id,
                    'module_name' => $module->title,
                    'is_completed' => $mp->is_completed,
                    'last_topic_id' => $mp->last_topic_id,
                ];
            });

        // Calculate overall stats
        $totalModules = $moduleProgress->count();
        $completedModules = $moduleProgress->filter(fn($mp) => $mp['is_completed'])->count();
        $completionPercentage = $totalModules > 0 ? round(($completedModules / $totalModules) * 100) : 0;

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'xp' => $user->xp,
                'participant_code' => $user->participant_code,
            ],
            'stats' => [
                'total_modules' => $totalModules,
                'completed_modules' => $completedModules,
                'completion_percentage' => $completionPercentage,
                'total_achievements' => $achievements->count(),
                'total_badges' => $badges->count(),
                'total_xp' => $user->xp,
            ],
            'achievements' => $achievements,
            'badges' => $badges,
            'module_progress' => $moduleProgress,
        ]);
    }
}
