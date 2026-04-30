<?php

namespace App\Http\Controllers;

use App\Models\TrainingModule;
use Illuminate\Http\Request;

class AdminTrainingModuleController extends Controller
{
    public function index()
    {
        $modules = TrainingModule::query()
            ->orderBy('id')
            ->get(['id', 'title', 'description', 'is_active', 'created_at']);

        return response()->json(['modules' => $modules]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $module = TrainingModule::query()->create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json(['module' => $module], 201);
    }

    public function update(Request $request, TrainingModule $module)
    {
        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'is_active' => ['sometimes', 'boolean'],
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
}
