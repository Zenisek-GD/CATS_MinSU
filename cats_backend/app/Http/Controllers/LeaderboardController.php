<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\QuizCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LeaderboardController extends Controller
{
    public function quiz(Request $request, Quiz $quiz)
    {
        $rows = DB::table('quiz_attempts')
            ->join('users', 'users.id', '=', 'quiz_attempts.user_id')
            ->where('quiz_attempts.quiz_id', $quiz->id)
            ->where('quiz_attempts.status', 'completed')
            ->select([
                'users.id as user_id',
                'users.name as name',
                DB::raw('MAX(quiz_attempts.percent) as best_percent'),
                DB::raw('MAX(quiz_attempts.score) as best_score'),
                DB::raw('MAX(quiz_attempts.max_score) as max_score'),
            ])
            ->groupBy('users.id', 'users.name')
            ->orderByDesc('best_percent')
            ->limit(50)
            ->get();

        return response()->json([
            'leaderboard' => $rows,
            'quiz' => [
                'id' => $quiz->id,
                'title' => $quiz->title,
            ],
        ]);
    }

    public function category(Request $request, QuizCategory $category)
    {
        $rows = DB::table('quiz_attempts')
            ->join('quizzes', 'quizzes.id', '=', 'quiz_attempts.quiz_id')
            ->join('users', 'users.id', '=', 'quiz_attempts.user_id')
            ->where('quizzes.category_id', $category->id)
            ->where('quiz_attempts.status', 'completed')
            ->select([
                'users.id as user_id',
                'users.name as name',
                DB::raw('AVG(quiz_attempts.percent) as avg_percent'),
                DB::raw('MAX(quiz_attempts.percent) as best_percent'),
            ])
            ->groupBy('users.id', 'users.name')
            ->orderByDesc('best_percent')
            ->limit(50)
            ->get();

        return response()->json([
            'leaderboard' => $rows,
            'category' => [
                'id' => $category->id,
                'slug' => $category->slug,
                'name' => $category->name,
            ],
        ]);
    }
}
