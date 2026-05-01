<?php

namespace App\Http\Controllers;

use App\Models\TrainingModule;
use App\Models\UserModuleProgress;
use Illuminate\Http\Request;

class TrainingModuleController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $query = TrainingModule::query()
            ->with(['topics', 'quiz'])
            ->orderBy('id');

        if ($user && $user->role !== 'admin') {
            $query->where('is_active', true);
        }

        $modules = $query->get();

        // Attach progress if user is authenticated
        if ($user) {
            $progress = UserModuleProgress::where('user_id', $user->id)->get()->keyBy('training_module_id');
            $modules->each(function ($module) use ($progress) {
                $module->user_progress = $progress->get($module->id);
            });
        }

        return response()->json(['modules' => $modules]);
    }

    public function show(Request $request, TrainingModule $module)
    {
        $user = $request->user();

        if ($user && $user->role !== 'admin' && !$module->is_active) {
            abort(404);
        }

        $module->load(['topics', 'quiz']);

        if ($user) {
            $module->user_progress = UserModuleProgress::where('user_id', $user->id)
                ->where('training_module_id', $module->id)
                ->first();
        }

        return response()->json(['module' => $module]);
    }

    public function updateProgress(Request $request, TrainingModule $module)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'last_topic_id' => ['nullable', 'exists:training_module_topics,id'],
            'is_completed' => ['boolean'],
        ]);

        $progress = UserModuleProgress::updateOrCreate(
            ['user_id' => $user->id, 'training_module_id' => $module->id],
            [
                'last_topic_id' => $validated['last_topic_id'] ?? null,
                'is_completed' => $validated['is_completed'] ?? false,
            ]
        );

        return response()->json(['progress' => $progress]);
    }
}
