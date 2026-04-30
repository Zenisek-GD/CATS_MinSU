<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\QuizCategory;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminQuizController extends Controller
{
    /* ─── Quizzes ─── */

    public function index()
    {
        $quizzes = Quiz::query()
            ->with(['category:id,slug,name'])
            ->withCount('questions')
            ->orderByDesc('id')
            ->get();

        return response()->json(['quizzes' => $quizzes]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => ['required', 'integer', 'exists:quiz_categories,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'kind' => ['required', 'string', Rule::in(['assessment', 'practice'])],
            'difficulty' => ['required', 'string', Rule::in(['easy', 'medium', 'hard'])],
            'time_limit_seconds' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
            'randomize_questions' => ['nullable', 'boolean'],
        ]);

        $quiz = Quiz::query()->create([
            'category_id' => $validated['category_id'],
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'kind' => $validated['kind'],
            'difficulty' => $validated['difficulty'],
            'time_limit_seconds' => $validated['time_limit_seconds'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        $quiz->load('category:id,slug,name');

        return response()->json(['quiz' => $quiz], 201);
    }

    public function update(Request $request, Quiz $quiz)
    {
        $validated = $request->validate([
            'category_id' => ['sometimes', 'integer', 'exists:quiz_categories,id'],
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'kind' => ['sometimes', 'string', Rule::in(['assessment', 'practice'])],
            'difficulty' => ['sometimes', 'string', Rule::in(['easy', 'medium', 'hard'])],
            'time_limit_seconds' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $quiz->fill($validated);
        $quiz->save();
        $quiz->load('category:id,slug,name');

        return response()->json(['quiz' => $quiz]);
    }

    public function destroy(Quiz $quiz)
    {
        // Delete all questions and options
        foreach ($quiz->questions as $question) {
            $question->options()->delete();
        }
        $quiz->questions()->delete();
        $quiz->delete();

        return response()->json(['message' => 'Quiz deleted.']);
    }

    /* ─── Categories ─── */

    public function categories()
    {
        $categories = QuizCategory::query()->orderBy('name')->get();
        return response()->json(['categories' => $categories]);
    }

    public function storeCategory(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', Rule::unique('quiz_categories', 'slug')],
        ]);

        $category = QuizCategory::query()->create($validated);
        return response()->json(['category' => $category], 201);
    }

    public function updateCategory(Request $request, QuizCategory $category)
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'slug' => ['sometimes', 'string', 'max:255', Rule::unique('quiz_categories', 'slug')->ignore($category->id)],
        ]);

        $category->fill($validated);
        $category->save();

        return response()->json(['category' => $category]);
    }

    public function destroyCategory(QuizCategory $category)
    {
        $category->delete();
        return response()->json(['message' => 'Category deleted.']);
    }
}
