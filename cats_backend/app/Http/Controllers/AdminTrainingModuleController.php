<?php

namespace App\Http\Controllers;

use App\Models\TrainingModule;
use App\Models\TrainingModuleTopic;
use Illuminate\Http\Request;

class AdminTrainingModuleController extends Controller
{
    public function index()
    {
        $modules = TrainingModule::query()
            ->with(['topics', 'quiz'])
            ->orderBy('id')
            ->get();

        return response()->json(['modules' => $modules]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
            'quiz_id' => ['nullable', 'integer', 'exists:quizzes,id'],
        ]);

        $module = TrainingModule::query()->create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
            'quiz_id' => $validated['quiz_id'] ?? null,
        ]);

        return response()->json(['module' => $module], 201);
    }

    public function update(Request $request, TrainingModule $module)
    {
        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'is_active' => ['sometimes', 'boolean'],
            'quiz_id' => ['sometimes', 'nullable', 'integer', 'exists:quizzes,id'],
        ]);

        $module->fill($validated);
        $module->save();

        return response()->json(['module' => $module]);
    }

    public function destroy(TrainingModule $module)
    {
        $module->delete();

        return response()->json(['message' => 'Module deleted.']);
    }

    public function storeTopic(Request $request, TrainingModule $module)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'sort_order' => ['nullable', 'integer'],
        ]);

        $topic = $module->topics()->create([
            'title' => $validated['title'],
            'content' => $validated['content'],
            'sort_order' => $validated['sort_order'] ?? 0,
        ]);

        return response()->json(['topic' => $topic], 201);
    }

    public function updateTopic(Request $request, TrainingModuleTopic $topic)
    {
        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'content' => ['sometimes', 'string'],
            'sort_order' => ['sometimes', 'integer'],
        ]);

        $topic->update($validated);

        return response()->json(['topic' => $topic]);
    }

    public function destroyTopic(TrainingModuleTopic $topic)
    {
        $topic->delete();

        return response()->json(['message' => 'Topic deleted.']);
    }
}
