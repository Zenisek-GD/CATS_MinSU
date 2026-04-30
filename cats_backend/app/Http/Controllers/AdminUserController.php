<?php

namespace App\Http\Controllers;

use App\Models\QuizAttempt;
use App\Models\SimulationRun;
use App\Models\User;
use App\Models\UserBadge;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AdminUserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query()->orderBy('id');

        if ($request->filled('search')) {
            $s = '%' . $request->input('search') . '%';
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', $s)->orWhere('email', 'like', $s);
            });
        }

        if ($request->filled('role')) {
            $query->where('role', $request->input('role'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $users = $query->get(['id', 'name', 'email', 'role', 'status', 'xp', 'participant_code', 'last_login_at', 'created_at']);

        return response()->json(['users' => $users]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['nullable', 'string', Rule::in(['user', 'admin'])],
        ]);

        $user = User::query()->create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'] ?? 'user',
            'status' => 'active',
            'participant_code' => null,
        ]);

        return response()->json([
            'user' => $user->only(['id', 'name', 'email', 'role', 'status', 'created_at']),
        ], 201);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => ['sometimes', 'string', 'min:8'],
            'role' => ['sometimes', 'string', Rule::in(['user', 'admin'])],
        ]);

        if (array_key_exists('name', $validated)) $user->name = $validated['name'];
        if (array_key_exists('email', $validated)) $user->email = $validated['email'];
        if (array_key_exists('role', $validated)) $user->role = $validated['role'];
        if (array_key_exists('password', $validated)) $user->password = Hash::make($validated['password']);

        $user->save();

        return response()->json([
            'user' => $user->only(['id', 'name', 'email', 'role', 'status']),
        ]);
    }

    public function destroy(User $user)
    {
        $current = Auth::user();
        if ($current && (int) $current->id === (int) $user->id) {
            return response()->json(['message' => 'You cannot delete your own account.'], 409);
        }

        $user->delete();
        return response()->json(['message' => 'User deleted.']);
    }

    public function updateStatus(Request $request, User $user)
    {
        $current = Auth::user();
        if ($current && (int) $current->id === (int) $user->id) {
            return response()->json(['message' => 'You cannot change your own status.'], 409);
        }

        $validated = $request->validate([
            'status' => ['required', 'string', Rule::in(['active', 'suspended'])],
        ]);

        $user->status = $validated['status'];
        $user->save();

        return response()->json([
            'user' => $user->only(['id', 'name', 'email', 'role', 'status']),
            'message' => 'User status updated.',
        ]);
    }

    public function resetPassword(Request $request, User $user)
    {
        $newPassword = Str::random(12);
        $user->password = Hash::make($newPassword);
        $user->save();

        return response()->json([
            'message' => 'Password reset successfully.',
            'temporary_password' => $newPassword,
        ]);
    }

    public function performance(User $user)
    {
        // Quiz performance
        $quizAttempts = QuizAttempt::query()
            ->where('user_id', $user->id)
            ->where('status', 'submitted')
            ->with('quiz:id,title')
            ->orderByDesc('updated_at')
            ->limit(20)
            ->get(['id', 'quiz_id', 'score', 'max_score', 'updated_at']);

        $avgQuizScore = QuizAttempt::query()
            ->where('user_id', $user->id)
            ->where('status', 'submitted')
            ->where('max_score', '>', 0)
            ->selectRaw('ROUND(AVG(score * 100.0 / max_score), 1) as avg_pct')
            ->value('avg_pct');

        // Simulation performance
        $simRuns = SimulationRun::query()
            ->where('user_id', $user->id)
            ->with('simulation:id,title')
            ->orderByDesc('started_at')
            ->limit(20)
            ->get(['id', 'simulation_id', 'status', 'score', 'max_score', 'started_at']);

        // Badges
        $badges = UserBadge::query()
            ->where('user_id', $user->id)
            ->with('badge:id,name,icon')
            ->get();

        // Awareness level
        $awarenessLevel = 'Low';
        if ($avgQuizScore !== null) {
            if ($avgQuizScore >= 80) $awarenessLevel = 'High';
            elseif ($avgQuizScore >= 60) $awarenessLevel = 'Medium';
        }

        return response()->json([
            'user' => $user->only(['id', 'name', 'email', 'role', 'status', 'xp']),
            'quiz_attempts' => $quizAttempts,
            'average_quiz_score' => $avgQuizScore ? (float) $avgQuizScore : 0,
            'simulation_runs' => $simRuns,
            'badges' => $badges,
            'awareness_level' => $awarenessLevel,
        ]);
    }
}
