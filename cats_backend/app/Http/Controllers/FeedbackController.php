<?php

namespace App\Http\Controllers;

use App\Models\UserFeedback;
use App\Models\LearningOutcome;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FeedbackController extends Controller
{
    /**
     * Submit feedback for an activity
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'feedback_type' => 'required|in:quiz,simulation,module,general,system',
            'quiz_id' => 'nullable|integer|exists:quizzes,id',
            'simulation_id' => 'nullable|integer|exists:simulations,id',
            'training_module_id' => 'nullable|integer|exists:training_modules,id',
            'usability_score' => 'nullable|integer|between:1,5',
            'relevance_score' => 'nullable|integer|between:1,5',
            'practicality_score' => 'nullable|integer|between:1,5',
            'engagement_score' => 'nullable|integer|between:1,5',
            'comment' => 'nullable|string|max:2000',
            'perceived_difficulty' => 'nullable|in:too_easy,easy,moderate,difficult,too_difficult',
            'would_recommend' => 'nullable|boolean',
        ]);

        $validated['user_id'] = Auth::id();

        $feedback = UserFeedback::create($validated);

        return response()->json([
            'message' => 'Feedback submitted successfully',
            'feedback' => $feedback,
        ], 201);
    }

    /**
     * Get user's feedback
     */
    public function index(Request $request)
    {
        $query = UserFeedback::where('user_id', Auth::id());

        if ($request->has('feedback_type')) {
            $query->where('feedback_type', $request->feedback_type);
        }

        if ($request->has('date_from') && $request->has('date_to')) {
            $query->whereBetween('created_at', [
                $request->date_from,
                $request->date_to,
            ]);
        }

        return response()->json($query->get());
    }

    /**
     * Get feedback analytics (admin only)
     */
    public function analytics(Request $request)
    {
        if (Auth::user()?->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $feedbackType = $request->query('type', 'all');
        $query = UserFeedback::query();

        if ($feedbackType !== 'all') {
            $query->where('feedback_type', $feedbackType);
        }

        $allFeedback = $query->get();

        if ($allFeedback->isEmpty()) {
            return response()->json(['message' => 'No feedback available']);
        }

        // Calculate averages
        $avgUsability = $allFeedback->avg('usability_score');
        $avgRelevance = $allFeedback->avg('relevance_score');
        $avgPracticality = $allFeedback->avg('practicality_score');
        $avgEngagement = $allFeedback->avg('engagement_score');

        // Difficulty distribution
        $difficultyDistribution = $allFeedback->groupBy('perceived_difficulty')
            ->map->count()
            ->toArray();

        // Recommendation rate
        $recommendationRate = ($allFeedback->where('would_recommend', true)->count() / $allFeedback->count()) * 100;

        // Extract themes from comments
        $comments = $allFeedback->pluck('comment')->filter();
        $themes = $this->extractThemes($comments);

        return response()->json([
            'total_responses' => $allFeedback->count(),
            'averages' => [
                'usability' => round($avgUsability, 2),
                'relevance' => round($avgRelevance, 2),
                'practicality' => round($avgPracticality, 2),
                'engagement' => round($avgEngagement, 2),
            ],
            'difficulty_distribution' => $difficultyDistribution,
            'recommendation_rate' => round($recommendationRate, 2),
            'key_themes' => $themes,
            'sample_comments' => $comments->take(5)->values(),
        ]);
    }

    /**
     * Extract key themes from feedback comments (basic keyword analysis)
     */
    private function extractThemes($comments)
    {
        $themes = [
            'practical' => 0,
            'realistic' => 0,
            'engaging' => 0,
            'confusing' => 0,
            'helpful' => 0,
            'difficult' => 0,
            'easy' => 0,
            'relevant' => 0,
            'ineffective' => 0,
        ];

        $keywords = [
            'practical' => ['practical', 'real-world', 'applicable', 'usable'],
            'realistic' => ['realistic', 'authentic', 'real', 'scenario'],
            'engaging' => ['engaging', 'interesting', 'fun', 'exciting'],
            'confusing' => ['confusing', 'unclear', 'hard to understand'],
            'helpful' => ['helpful', 'useful', 'good', 'beneficial'],
            'difficult' => ['difficult', 'hard', 'challenging', 'tough'],
            'easy' => ['easy', 'simple', 'straightforward'],
            'relevant' => ['relevant', 'related', 'pertinent'],
            'ineffective' => ['ineffective', 'waste', 'pointless', 'useless'],
        ];

        foreach ($comments as $comment) {
            $commentLower = strtolower($comment);
            foreach ($keywords as $theme => $words) {
                foreach ($words as $word) {
                    if (strpos($commentLower, $word) !== false) {
                        $themes[$theme]++;
                        break;
                    }
                }
            }
        }

        return array_filter($themes, fn($count) => $count > 0);
    }

    /**
     * Compare feedback between different activities/groups
     */
    public function comparison(Request $request)
    {
        if (Auth::user()?->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $type1 = $request->query('type1');
        $type2 = $request->query('type2');

        if (!$type1 || !$type2) {
            return response()->json(['error' => 'type1 and type2 parameters required'], 422);
        }

        $fb1 = UserFeedback::where('feedback_type', $type1)->get();
        $fb2 = UserFeedback::where('feedback_type', $type2)->get();

        return response()->json([
            $type1 => [
                'count' => $fb1->count(),
                'avg_usability' => round($fb1->avg('usability_score'), 2),
                'avg_relevance' => round($fb1->avg('relevance_score'), 2),
                'avg_practicality' => round($fb1->avg('practicality_score'), 2),
                'avg_engagement' => round($fb1->avg('engagement_score'), 2),
                'recommendation_rate' => round(($fb1->where('would_recommend', true)->count() / $fb1->count() * 100), 2),
            ],
            $type2 => [
                'count' => $fb2->count(),
                'avg_usability' => round($fb2->avg('usability_score'), 2),
                'avg_relevance' => round($fb2->avg('relevance_score'), 2),
                'avg_practicality' => round($fb2->avg('practicality_score'), 2),
                'avg_engagement' => round($fb2->avg('engagement_score'), 2),
                'recommendation_rate' => round(($fb2->where('would_recommend', true)->count() / $fb2->count() * 100), 2),
            ],
        ]);
    }

    /**
     * Admin: Get all feedback with filtering and pagination
     */
    public function adminIndex(Request $request)
    {
        // Verify admin role
        if (Auth::user()?->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $query = UserFeedback::with('user:id,name,email,participant_code')->orderBy('created_at', 'desc');

        // Filter by type
        if ($request->has('feedback_type') && $request->feedback_type !== 'all') {
            $query->where('feedback_type', $request->feedback_type);
        }

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by activity
        if ($request->has('activity_id')) {
            $activity = $request->activity_id;
            $type = $request->activity_type ?? 'quiz';

            if ($type === 'quiz') {
                $query->where('quiz_id', $activity);
            } elseif ($type === 'simulation') {
                $query->where('simulation_id', $activity);
            } elseif ($type === 'module') {
                $query->where('training_module_id', $activity);
            }
        }

        // Filter by date range
        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Search in comments
        if ($request->has('search') && $request->search) {
            $query->where('comment', 'like', '%' . $request->search . '%');
        }

        // Pagination
        $perPage = $request->get('per_page', 50);
        $feedback = $query->paginate($perPage);

        return response()->json($feedback);
    }

    /**
     * Admin: Get single feedback detail
     */
    public function adminShow($id)
    {
        if (Auth::user()?->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $feedback = UserFeedback::with('user:id,name,email,participant_code')->findOrFail($id);

        return response()->json($feedback);
    }

    /**
     * Admin: Add notes/results to feedback
     */
    public function adminUpdate(Request $request, $id)
    {
        if (Auth::user()?->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $feedback = UserFeedback::findOrFail($id);

        $validated = $request->validate([
            'admin_notes' => 'nullable|string|max:2000',
            'admin_result' => 'nullable|string|max:1000',
            'status' => 'nullable|in:reviewed,flagged,resolved,archived',
        ]);

        $feedback->update($validated);

        return response()->json([
            'message' => 'Feedback updated successfully',
            'feedback' => $feedback,
        ]);
    }

    /**
     * Admin: Export feedback to CSV
     */
    public function adminExport(Request $request)
    {
        if (Auth::user()?->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $query = UserFeedback::with('user');

        // Apply same filters as adminIndex
        if ($request->has('feedback_type') && $request->feedback_type !== 'all') {
            $query->where('feedback_type', $request->feedback_type);
        }

        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $feedback = $query->orderBy('created_at', 'desc')->get();

        // Generate CSV
        $csv = "ID,User Name,Email,Type,Usability,Relevance,Practicality,Engagement,Difficulty,Recommend,Comment,Admin Notes,Status,Date\n";

        foreach ($feedback as $item) {
            $csv .= sprintf(
                '"%s","%s","%s","%s","%s","%s","%s","%s","%s","%s","%s","%s","%s","%s"' . "\n",
                $item->id,
                $item->user->name ?? 'Unknown',
                $item->user->email ?? 'Unknown',
                $item->feedback_type,
                $item->usability_score ?? '-',
                $item->relevance_score ?? '-',
                $item->practicality_score ?? '-',
                $item->engagement_score ?? '-',
                $item->perceived_difficulty ?? '-',
                $item->would_recommend ? 'Yes' : 'No',
                str_replace('"', '""', $item->comment ?? ''),
                str_replace('"', '""', $item->admin_notes ?? ''),
                $item->status ?? 'pending',
                $item->created_at->format('Y-m-d H:i:s')
            );
        }

        return response()->stream(
            function () use ($csv) {
                echo $csv;
            },
            200,
            [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="feedback_export_' . now()->format('Y-m-d_H-i-s') . '.csv"',
            ]
        );
    }
}
