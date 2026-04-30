<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AssessmentController extends Controller
{
    public function summary(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $pre = Quiz::query()->where('kind', 'pretest')->where('is_active', true)->orderBy('id')->first();
        $post = Quiz::query()->where('kind', 'posttest')->where('is_active', true)->orderBy('id')->first();

        $preBest = $pre ? $this->bestAttemptPercent($user->id, $pre->id) : null;
        $postBest = $post ? $this->bestAttemptPercent($user->id, $post->id) : null;

        $improvement = null;
        if (!is_null($preBest) && !is_null($postBest)) {
            $improvement = round($postBest - $preBest, 2);
        }

        return response()->json([
            'pretest' => $pre ? ['id' => $pre->id, 'title' => $pre->title] : null,
            'posttest' => $post ? ['id' => $post->id, 'title' => $post->title] : null,
            'pretest_best_percent' => $preBest,
            'posttest_best_percent' => $postBest,
            'improvement_percent' => $improvement,
        ]);
    }

    public function report(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $attempts = DB::table('quiz_attempts')
            ->join('quizzes', 'quizzes.id', '=', 'quiz_attempts.quiz_id')
            ->join('quiz_categories', 'quiz_categories.id', '=', 'quizzes.category_id')
            ->where('quiz_attempts.user_id', $user->id)
            ->where('quiz_attempts.status', 'completed')
            ->select([
                'quiz_attempts.id',
                'quiz_attempts.quiz_id',
                'quiz_attempts.percent',
                'quiz_attempts.score',
                'quiz_attempts.max_score',
                'quiz_attempts.finished_at',
                'quizzes.title as quiz_title',
                'quizzes.kind as quiz_kind',
                'quiz_categories.slug as category_slug',
                'quiz_categories.name as category_name',
            ])
            ->orderByDesc('quiz_attempts.finished_at')
            ->get();

        $byCategory = [];
        foreach ($attempts as $a) {
            $slug = (string) $a->category_slug;
            if (!isset($byCategory[$slug])) {
                $byCategory[$slug] = [
                    'category_slug' => $slug,
                    'category_name' => (string) $a->category_name,
                    'attempts' => 0,
                    'avg_percent' => 0,
                    'last_percent' => null,
                ];
            }
            $byCategory[$slug]['attempts']++;
            $byCategory[$slug]['avg_percent'] += (float) $a->percent;
            if (is_null($byCategory[$slug]['last_percent'])) {
                $byCategory[$slug]['last_percent'] = (float) $a->percent;
            }
        }

        foreach ($byCategory as $slug => $row) {
            $count = max(1, (int) $row['attempts']);
            $byCategory[$slug]['avg_percent'] = round(((float) $row['avg_percent']) / $count, 2);
        }

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'participant_code' => $user->participant_code,
            ],
            'attempts' => $attempts,
            'analytics' => [
                'by_category' => array_values($byCategory),
            ],
        ]);
    }

    private function bestAttemptPercent(int $userId, int $quizId): ?float
    {
        $best = DB::table('quiz_attempts')
            ->where('user_id', $userId)
            ->where('quiz_id', $quizId)
            ->where('status', 'completed')
            ->max('percent');

        return is_null($best) ? null : (float) $best;
    }
}
