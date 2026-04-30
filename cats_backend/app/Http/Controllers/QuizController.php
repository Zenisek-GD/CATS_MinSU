<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\QuizCategory;
use Illuminate\Http\Request;

class QuizController extends Controller
{
    public function categories(Request $request)
    {
        $categories = QuizCategory::query()
            ->orderBy('name')
            ->get(['id', 'slug', 'name']);

        return response()->json(['categories' => $categories]);
    }

    public function index(Request $request)
    {
        $validated = $request->validate([
            'category' => ['nullable', 'string'],
            'kind' => ['nullable', 'in:regular,pretest,posttest'],
            'difficulty' => ['nullable', 'in:easy,medium,hard'],
        ]);

        $query = Quiz::query()
            ->with(['category:id,slug,name'])
            ->where('is_active', true)
            ->orderBy('id');

        if (!empty($validated['category'])) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $validated['category']));
        }

        if (!empty($validated['kind'])) {
            $query->where('kind', $validated['kind']);
        }

        if (!empty($validated['difficulty'])) {
            $query->where('difficulty', $validated['difficulty']);
        }

        $quizzes = $query->get([
            'id',
            'category_id',
            'title',
            'description',
            'difficulty',
            'kind',
            'randomize_questions',
            'question_count',
            'time_limit_seconds',
            'created_at',
        ]);

        return response()->json(['quizzes' => $quizzes]);
    }

    public function show(Request $request, Quiz $quiz)
    {
        if (!$quiz->is_active) {
            return response()->json(['message' => 'Quiz is not available.'], 404);
        }

        $quiz->load(['category:id,slug,name']);

        return response()->json([
            'quiz' => [
                'id' => $quiz->id,
                'title' => $quiz->title,
                'description' => $quiz->description,
                'difficulty' => $quiz->difficulty,
                'kind' => $quiz->kind,
                'randomize_questions' => $quiz->randomize_questions,
                'question_count' => $quiz->question_count,
                'time_limit_seconds' => $quiz->time_limit_seconds,
                'category' => $quiz->category,
            ],
        ]);
    }
}
