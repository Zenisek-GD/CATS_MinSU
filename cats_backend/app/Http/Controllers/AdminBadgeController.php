<?php

namespace App\Http\Controllers;

use App\Models\Achievement;
use App\Models\Badge;
use App\Models\UserAchievement;
use App\Models\UserBadge;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminBadgeController extends Controller
{
    /* ─── Badges ─── */

    public function indexBadges()
    {
        $badges = Badge::query()->withCount('userBadges')->orderBy('name')->get();
        return response()->json(['badges' => $badges]);
    }

    public function storeBadge(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', Rule::unique('badges', 'slug')],
            'description' => ['nullable', 'string'],
            'icon' => ['nullable', 'string', 'max:60'],
            'condition_type' => ['nullable', 'string', 'max:60'],
            'condition_value' => ['nullable', 'integer', 'min:0'],
        ]);

        $badge = Badge::query()->create($validated);
        return response()->json(['badge' => $badge], 201);
    }

    public function updateBadge(Request $request, Badge $badge)
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'slug' => ['sometimes', 'string', 'max:255', Rule::unique('badges', 'slug')->ignore($badge->id)],
            'description' => ['sometimes', 'nullable', 'string'],
            'icon' => ['sometimes', 'string', 'max:60'],
            'condition_type' => ['sometimes', 'nullable', 'string', 'max:60'],
            'condition_value' => ['sometimes', 'nullable', 'integer', 'min:0'],
        ]);

        $badge->fill($validated);
        $badge->save();

        return response()->json(['badge' => $badge]);
    }

    public function destroyBadge(Badge $badge)
    {
        $badge->userBadges()->delete();
        $badge->delete();
        return response()->json(['message' => 'Badge deleted.']);
    }

    /* ─── Achievements ─── */

    public function indexAchievements()
    {
        $achievements = Achievement::query()->withCount('userAchievements')->orderBy('name')->get();
        return response()->json(['achievements' => $achievements]);
    }

    public function storeAchievement(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', Rule::unique('achievements', 'slug')],
            'description' => ['nullable', 'string'],
            'icon' => ['nullable', 'string', 'max:60'],
            'xp_reward' => ['nullable', 'integer', 'min:0'],
            'condition_type' => ['nullable', 'string', 'max:60'],
            'condition_value' => ['nullable', 'integer', 'min:0'],
        ]);

        $achievement = Achievement::query()->create($validated);
        return response()->json(['achievement' => $achievement], 201);
    }

    public function updateAchievement(Request $request, Achievement $achievement)
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'slug' => ['sometimes', 'string', 'max:255', Rule::unique('achievements', 'slug')->ignore($achievement->id)],
            'description' => ['sometimes', 'nullable', 'string'],
            'icon' => ['sometimes', 'string', 'max:60'],
            'xp_reward' => ['sometimes', 'integer', 'min:0'],
            'condition_type' => ['sometimes', 'nullable', 'string', 'max:60'],
            'condition_value' => ['sometimes', 'nullable', 'integer', 'min:0'],
        ]);

        $achievement->fill($validated);
        $achievement->save();

        return response()->json(['achievement' => $achievement]);
    }

    public function destroyAchievement(Achievement $achievement)
    {
        $achievement->userAchievements()->delete();
        $achievement->delete();
        return response()->json(['message' => 'Achievement deleted.']);
    }
}
