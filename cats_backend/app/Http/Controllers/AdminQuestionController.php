<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\QuizOption;
use App\Models\QuizQuestion;
use Illuminate\Http\Request;

class AdminQuestionController extends Controller
{
    public function index(Request $request)
    {
        $query = QuizQuestion::query()
            ->with(['quiz:id,title,category_id', 'quiz.category:id,slug,name', 'options:id,question_id,label,text,is_correct,sort_order'])
            ->orderByDesc('id');

        if ($request->filled('quiz_id')) {
            $query->where('quiz_id', (int) $request->input('quiz_id'));
        }

        $questions = $query->get();

        return response()->json(['questions' => $questions]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'quiz_id' => ['required', 'integer', 'exists:quizzes,id'],
            'type' => ['required', 'string', 'in:multiple_choice,true_false,scenario'],
            'prompt' => ['required', 'string'],
            'scenario' => ['nullable', 'string'],
            'explanation' => ['nullable', 'string'],
            'points' => ['required', 'integer', 'min:1'],
            'sort_order' => ['nullable', 'integer'],
            'options' => ['required', 'array', 'min:2'],
            'options.*.label' => ['required', 'string', 'max:10'],
            'options.*.text' => ['required', 'string'],
            'options.*.is_correct' => ['required', 'boolean'],
            'options.*.sort_order' => ['nullable', 'integer'],
        ]);

        $question = QuizQuestion::query()->create([
            'quiz_id' => $validated['quiz_id'],
            'type' => $validated['type'],
            'prompt' => $validated['prompt'],
            'scenario' => $validated['scenario'] ?? null,
            'explanation' => $validated['explanation'] ?? null,
            'points' => $validated['points'],
            'sort_order' => $validated['sort_order'] ?? 0,
        ]);

        foreach ($validated['options'] as $idx => $opt) {
            QuizOption::query()->create([
                'question_id' => $question->id,
                'label' => $opt['label'],
                'text' => $opt['text'],
                'is_correct' => $opt['is_correct'],
                'sort_order' => $opt['sort_order'] ?? ($idx + 1),
            ]);
        }

        $question->load(['options:id,question_id,label,text,is_correct,sort_order', 'quiz:id,title']);

        return response()->json(['question' => $question], 201);
    }

    public function update(Request $request, QuizQuestion $question)
    {
        $validated = $request->validate([
            'type' => ['sometimes', 'string', 'in:multiple_choice,true_false,scenario'],
            'prompt' => ['sometimes', 'string'],
            'scenario' => ['sometimes', 'nullable', 'string'],
            'explanation' => ['sometimes', 'nullable', 'string'],
            'points' => ['sometimes', 'integer', 'min:1'],
            'sort_order' => ['sometimes', 'integer'],
            'options' => ['sometimes', 'array', 'min:2'],
            'options.*.label' => ['required_with:options', 'string', 'max:10'],
            'options.*.text' => ['required_with:options', 'string'],
            'options.*.is_correct' => ['required_with:options', 'boolean'],
            'options.*.sort_order' => ['nullable', 'integer'],
        ]);

        $question->fill(collect($validated)->except('options')->toArray());
        $question->save();

        if (isset($validated['options'])) {
            $question->options()->delete();
            foreach ($validated['options'] as $idx => $opt) {
                QuizOption::query()->create([
                    'question_id' => $question->id,
                    'label' => $opt['label'],
                    'text' => $opt['text'],
                    'is_correct' => $opt['is_correct'],
                    'sort_order' => $opt['sort_order'] ?? ($idx + 1),
                ]);
            }
        }

        $question->load(['options:id,question_id,label,text,is_correct,sort_order', 'quiz:id,title']);

        return response()->json(['question' => $question]);
    }

    public function destroy(QuizQuestion $question)
    {
        $question->options()->delete();
        $question->delete();

        return response()->json(['message' => 'Question deleted.']);
    }
}
