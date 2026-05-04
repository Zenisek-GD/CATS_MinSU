<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\QuizAttemptAnswer;
use App\Models\QuizOption;
use App\Models\QuizQuestion;
use App\Models\TrainingModule;
use App\Support\CyberAwarenessAiCoach;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;

class QuizAttemptController extends Controller
{
    public function start(Request $request, Quiz $quiz)
    {
        if (!$quiz->is_active) {
            return response()->json(['message' => 'Quiz is not available.'], 404);
        }

        /** @var \App\Models\User $user */
        $user = Auth::user();

        $questionsQuery = QuizQuestion::query()
            ->with(['options:id,question_id,label,text,sort_order'])
            ->where('quiz_id', $quiz->id);

        $questions = $quiz->randomize_questions
            ? $questionsQuery->inRandomOrder()->limit($quiz->question_count)->get()
            : $questionsQuery->orderBy('sort_order')->limit($quiz->question_count)->get();

        $order = $questions->pluck('id')->values()->all();
        $maxScore = (int) $questions->sum('points');

        $attempt = QuizAttempt::query()->create([
            'user_id' => $user->id,
            'quiz_id' => $quiz->id,
            'status' => 'in_progress',
            'time_limit_seconds' => $quiz->time_limit_seconds,
            'started_at' => Carbon::now(),
            'finished_at' => null,
            'score' => 0,
            'max_score' => $maxScore,
            'percent' => 0,
            'question_order' => $order,
        ]);

        return response()->json([
            'attempt' => $this->presentAttempt($attempt, $quiz, $questions),
        ]);
    }

    public function show(Request $request, QuizAttempt $attempt)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if ($user->role !== 'admin' && $attempt->user_id !== $user->id) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        $quiz = $attempt->quiz()->with('category:id,slug,name')->firstOrFail();
        $questionIds = (array) ($attempt->question_order ?? []);

        $questions = QuizQuestion::query()
            ->with(['options:id,question_id,label,text,sort_order'])
            ->whereIn('id', $questionIds)
            ->get()
            ->sortBy(fn($q) => array_search($q->id, $questionIds, true))
            ->values();

        return response()->json([
            'attempt' => $this->presentAttempt($attempt, $quiz, $questions),
        ]);
    }

    public function submit(Request $request, QuizAttempt $attempt)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if ($user->role !== 'admin' && $attempt->user_id !== $user->id) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        if ($attempt->status !== 'in_progress') {
            return response()->json(['message' => 'Attempt is already finished.'], 400);
        }

        $validated = $request->validate([
            'answers' => ['required', 'array', 'min:1'],
            'answers.*.question_id' => ['required', 'integer'],
            'answers.*.selected_option_id' => ['nullable', 'integer'],
            'answers.*.boolean_answer' => ['nullable', 'boolean'],
        ]);

        $quiz = $attempt->quiz()->with('category:id,slug,name')->firstOrFail();
        $questionIds = (array) ($attempt->question_order ?? []);

        $questions = QuizQuestion::query()
            ->with(['options:id,question_id,label,text,is_correct,sort_order'])
            ->whereIn('id', $questionIds)
            ->get()
            ->keyBy('id');

        $byQuestion = [];
        foreach ($validated['answers'] as $a) {
            $qid = (int) $a['question_id'];
            $byQuestion[$qid] = $a;
        }

        $expired = false;
        if ($attempt->time_limit_seconds && $attempt->started_at) {
            $elapsed = now()->diffInSeconds($attempt->started_at);
            if ($elapsed > $attempt->time_limit_seconds) {
                $expired = true;
            }
        }

        $score = 0;
        $maxScore = (int) $questions->sum('points');
        $results = [];
        $misses = [];

        foreach ($questionIds as $qid) {
            $qid = (int) $qid;
            $q = $questions->get($qid);
            if (!$q)
                continue;

            $answer = $byQuestion[$qid] ?? null;
            $selectedOptionId = $answer['selected_option_id'] ?? null;
            $booleanAnswer = array_key_exists('boolean_answer', (array) $answer) ? $answer['boolean_answer'] : null;

            $correctOption = $q->options->firstWhere('is_correct', true);
            $isCorrect = false;

            if ($selectedOptionId) {
                $opt = $q->options->firstWhere('id', (int) $selectedOptionId);
                $isCorrect = $opt ? (bool) $opt->is_correct : false;
            } elseif (!is_null($booleanAnswer)) {
                // For true/false, interpret boolean_answer against correct option label/text.
                $normalizedCorrect = null;
                if ($correctOption) {
                    $label = strtolower(trim((string) ($correctOption->label ?? $correctOption->text)));
                    if ($label === 'true')
                        $normalizedCorrect = true;
                    if ($label === 'false')
                        $normalizedCorrect = false;
                }
                $isCorrect = !is_null($normalizedCorrect) ? ((bool) $booleanAnswer === (bool) $normalizedCorrect) : false;
            }

            $earned = $isCorrect ? (int) $q->points : 0;
            $score += $earned;

            QuizAttemptAnswer::query()->updateOrCreate(
                ['attempt_id' => $attempt->id, 'question_id' => $q->id],
                [
                    'selected_option_id' => $selectedOptionId,
                    'boolean_answer' => $booleanAnswer,
                    'is_correct' => $isCorrect,
                    'earned_points' => $earned,
                ]
            );

            // Build selected option display text
            $selectedOptionData = null;
            if ($selectedOptionId) {
                $opt = $q->options->firstWhere('id', (int) $selectedOptionId);
                if ($opt) {
                    $selectedOptionData = ['id' => $opt->id, 'label' => $opt->label, 'text' => $opt->text];
                }
            }

            $results[] = [
                'question_id' => $q->id,
                'prompt' => $q->prompt,
                'scenario' => $q->scenario,
                'is_correct' => $isCorrect,
                'earned_points' => $earned,
                'points' => (int) $q->points,
                'explanation' => $q->explanation,
                'correct_option' => $correctOption ? ['id' => $correctOption->id, 'label' => $correctOption->label, 'text' => $correctOption->text] : null,
                'selected_option' => $selectedOptionData,
                'selected_option_id' => $selectedOptionId,
            ];

            if (!$isCorrect) {
                $selected = null;
                if ($selectedOptionId) {
                    $opt = $q->options->firstWhere('id', (int) $selectedOptionId);
                    if ($opt) {
                        $label = trim((string) ($opt->label ?? ''));
                        $text = trim((string) ($opt->text ?? ''));
                        $selected = $label && $text ? "{$label}. {$text}" : ($label ?: $text);
                    }
                }

                $correct = null;
                if ($correctOption) {
                    $label = trim((string) ($correctOption->label ?? ''));
                    $text = trim((string) ($correctOption->text ?? ''));
                    $correct = $label && $text ? "{$label}. {$text}" : ($label ?: $text);
                }

                $misses[] = [
                    'prompt' => (string) $q->prompt,
                    'scenario' => $q->scenario,
                    'selected' => $selected,
                    'correct' => $correct,
                    'explanation' => $q->explanation,
                ];
            }
        }

        $percent = $maxScore > 0 ? round(($score / $maxScore) * 100, 2) : 0;

        // Check if this is the first completion for this user+quiz combination
        $previousCompletions = QuizAttempt::query()
            ->where('user_id', $user->id)
            ->where('quiz_id', $quiz->id)
            ->where('status', 'completed')
            ->where('id', '!=', $attempt->id)
            ->exists();

        $isFirstAttempt = !$previousCompletions;

        $attempt->status = $expired ? 'expired' : 'completed';
        $attempt->finished_at = Carbon::now();
        $attempt->score = $score;
        $attempt->max_score = $maxScore;
        $attempt->percent = $percent;
        $attempt->is_first_attempt = $isFirstAttempt;

        // Mark first completion time
        if ($isFirstAttempt && !$attempt->first_completed_at) {
            $attempt->first_completed_at = Carbon::now();
        }

        $attempt->save();

        $feedback = $this->adaptiveFeedback($user->id, $quiz->category?->slug ?? null);
        $aiFeedback = CyberAwarenessAiCoach::coachQuizMisses($quiz->category?->slug ?? null, array_slice($misses, 0, 5));

        return response()->json([
            'attempt' => [
                'id' => $attempt->id,
                'status' => $attempt->status,
                'score' => $attempt->score,
                'max_score' => $attempt->max_score,
                'percent' => $attempt->percent,
                'started_at' => optional($attempt->started_at)->toIso8601String(),
                'finished_at' => optional($attempt->finished_at)->toIso8601String(),
                'time_limit_seconds' => $attempt->time_limit_seconds,
                'quiz' => [
                    'id' => $quiz->id,
                    'title' => $quiz->title,
                    'kind' => $quiz->kind,
                    'difficulty' => $quiz->difficulty,
                    'category' => $quiz->category,
                ],
            ],
            'results' => $results,
            'feedback' => $feedback,
            'ai_feedback' => $aiFeedback,
        ]);
    }

    private function presentAttempt(QuizAttempt $attempt, Quiz $quiz, $questions)
    {
        $safeQuestions = [];
        foreach ($questions as $q) {
            $safeQuestions[] = [
                'id' => $q->id,
                'type' => $q->type,
                'prompt' => $q->prompt,
                'scenario' => $q->scenario,
                'points' => (int) $q->points,
                'options' => $q->options->map(fn($o) => [
                    'id' => $o->id,
                    'label' => $o->label,
                    'text' => $o->text,
                ])->values(),
            ];
        }

        return [
            'id' => $attempt->id,
            'status' => $attempt->status,
            'score' => $attempt->score,
            'max_score' => $attempt->max_score,
            'percent' => $attempt->percent,
            'started_at' => optional($attempt->started_at)->toIso8601String(),
            'finished_at' => optional($attempt->finished_at)->toIso8601String(),
            'time_limit_seconds' => $attempt->time_limit_seconds,
            'quiz' => [
                'id' => $quiz->id,
                'title' => $quiz->title,
                'description' => $quiz->description,
                'difficulty' => $quiz->difficulty,
                'kind' => $quiz->kind,
                'category' => $quiz->category?->only(['id', 'slug', 'name']),
            ],
            'questions' => $safeQuestions,
        ];
    }

    private function adaptiveFeedback(int $userId, ?string $categorySlug)
    {
        if (!$categorySlug) {
            return [
                'risk_level' => 'low',
                'tips' => ['Review explanations for any incorrect answers.'],
                'recommendations' => [],
            ];
        }

        $recent = QuizAttemptAnswer::query()
            ->join('quiz_attempts', 'quiz_attempts.id', '=', 'quiz_attempt_answers.attempt_id')
            ->join('quizzes', 'quizzes.id', '=', 'quiz_attempts.quiz_id')
            ->join('quiz_categories', 'quiz_categories.id', '=', 'quizzes.category_id')
            ->where('quiz_attempts.user_id', $userId)
            ->where('quiz_categories.slug', $categorySlug)
            ->orderByDesc('quiz_attempt_answers.id')
            ->limit(20)
            ->select(['quiz_attempt_answers.is_correct'])
            ->get();

        $total = $recent->count();
        $incorrect = $recent->where('is_correct', false)->count();
        $ratio = $total > 0 ? ($incorrect / $total) : 0;

        $risk = $ratio >= 0.6 ? 'high' : ($ratio >= 0.3 ? 'medium' : 'low');

        $tips = [
            'Read the explanation after each question and apply it to real examples.',
            'Slow down on timed quizzes to avoid careless mistakes.',
        ];

        $recommendations = [];
        if ($risk !== 'low') {
            $moduleTitle = match ($categorySlug) {
                'phishing' => 'Phishing Awareness',
                'password-security' => 'Password Hygiene',
                default => null,
            };

            if ($moduleTitle) {
                $module = TrainingModule::query()->where('title', $moduleTitle)->first();
                if ($module) {
                    $recommendations[] = [
                        'type' => 'training_module',
                        'title' => $module->title,
                        'module_id' => $module->id,
                        'reason' => 'You missed multiple questions in this topic. Review this module, then retry the quiz.',
                    ];
                }
            }

            $recommendations[] = [
                'type' => 'tip',
                'title' => 'Security tip',
                'reason' => 'Practice spotting red flags (URL mismatches, urgency, and unexpected attachments).',
            ];
        }

        return [
            'risk_level' => $risk,
            'tips' => $tips,
            'recommendations' => $recommendations,
            'stats' => [
                'recent_total' => $total,
                'recent_incorrect' => $incorrect,
            ],
        ];
    }
}
