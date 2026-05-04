<?php

namespace App\Http\Controllers;

use App\Models\LearningOutcome;
use App\Models\UserFeedback;
use App\Models\QuizAttempt;
use App\Models\SimulationRun;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ResearchController extends Controller
{
    /**
     * RQ1: How does the interactive system affect participants' understanding of cyber threats?
     * Measures: Knowledge gain, threat recognition, pre/post assessment scores
     */
    public function researchQuestion1(Request $request)
    {
        $this->authorize('admin');

        $outcomes = LearningOutcome::completed()
            ->where('learning_method', 'interactive_system')
            ->get();

        if ($outcomes->isEmpty()) {
            return response()->json(['message' => 'No data available']);
        }

        // Knowledge Gain Analysis
        $avgKnowledgeGain = $outcomes->avg('knowledge_gain');
        $participantsWithGain = $outcomes->where('knowledge_gain', '>', 0)->count();
        $gainPercentage = ($participantsWithGain / $outcomes->count()) * 100;

        // Threat Recognition Patterns
        $threatRecognitionData = $outcomes
            ->pluck('threat_recognition_notes')
            ->filter()
            ->map(fn($notes) => explode(',', $notes))
            ->flatten()
            ->groupBy(fn($x) => strtolower(trim($x)))
            ->map->count()
            ->sortDesc()
            ->take(10);

        // Pre/Post Performance Comparison
        $prePostComparison = [
            'pre_assessment_avg' => $outcomes->avg('knowledge_level_pre'),
            'post_assessment_avg' => $outcomes->avg('knowledge_level_post'),
            'improvement' => $outcomes->avg('knowledge_level_post') - $outcomes->avg('knowledge_level_pre'),
            'improvement_percentage' => (($outcomes->avg('knowledge_level_post') - $outcomes->avg('knowledge_level_pre')) / $outcomes->avg('knowledge_level_pre')) * 100,
        ];

        // Performance Score Analysis
        $performanceStats = [
            'avg_performance' => round($outcomes->avg('performance_score'), 2),
            'median_performance' => round($outcomes->pluck('performance_score')->median(), 2),
            'std_deviation' => round($this->calculateStdDev($outcomes->pluck('performance_score')->toArray()), 2),
            'high_performers' => $outcomes->where('performance_score', '>=', 80)->count(),
            'struggling_learners' => $outcomes->where('performance_score', '<', 50)->count(),
        ];

        // Behavioral Change Indicators
        $behavioralChange = [
            'demonstrated_change_count' => $outcomes->where('demonstrated_behavior_change', true)->count(),
            'behavior_change_rate' => round(($outcomes->where('demonstrated_behavior_change', true)->count() / $outcomes->count()) * 100, 2),
        ];

        return response()->json([
            'research_question' => 'How does the interactive cybercrime awareness training system affect participants\' understanding of common cyber threats?',
            'total_participants' => $outcomes->count(),
            'knowledge_gain_analysis' => [
                'average_knowledge_gain' => round($avgKnowledgeGain, 2),
                'participants_with_gain_percentage' => round($gainPercentage, 2),
                'participants_with_gain_count' => $participantsWithGain,
            ],
            'threat_recognition_patterns' => $threatRecognitionData,
            'pre_post_assessment' => $prePostComparison,
            'performance_statistics' => $performanceStats,
            'behavioral_change_indicators' => $behavioralChange,
            'key_findings' => [
                'Average knowledge improvement of ' . round($avgKnowledgeGain, 1) . ' points',
                'Top recognized threats: ' . implode(', ', array_keys($threatRecognitionData->take(3)->toArray())),
                'Behavioral change demonstrated by ' . $behavioralChange['behavior_change_rate'] . '% of participants',
            ],
        ]);
    }

    /**
     * RQ2: In what ways do quizzes and simulations enhance engagement and knowledge retention?
     * Compares effectiveness of quiz vs simulation-based learning
     */
    public function researchQuestion2(Request $request)
    {
        $this->authorize('admin');

        $quizOutcomes = LearningOutcome::byMethod('interactive_system')
            ->where('activity_type', 'quiz_attempt')
            ->completed()
            ->get();

        $simOutcomes = LearningOutcome::byMethod('interactive_system')
            ->where('activity_type', 'simulation_run')
            ->completed()
            ->get();

        // Engagement Comparison
        $engagementComparison = [
            'quiz' => [
                'avg_engagement_level' => round($quizOutcomes->avg('engagement_level'), 2),
                'avg_time_minutes' => round($quizOutcomes->avg('time_spent_seconds') / 60, 2),
                'count' => $quizOutcomes->count(),
            ],
            'simulation' => [
                'avg_engagement_level' => round($simOutcomes->avg('engagement_level'), 2),
                'avg_time_minutes' => round($simOutcomes->avg('time_spent_seconds') / 60, 2),
                'count' => $simOutcomes->count(),
            ],
        ];

        // Knowledge Retention (Performance Score as proxy)
        $retentionComparison = [
            'quiz' => [
                'avg_performance' => round($quizOutcomes->avg('performance_score'), 2),
                'avg_knowledge_gain' => round($quizOutcomes->avg('knowledge_gain'), 2),
            ],
            'simulation' => [
                'avg_performance' => round($simOutcomes->avg('performance_score'), 2),
                'avg_knowledge_gain' => round($simOutcomes->avg('knowledge_gain'), 2),
            ],
        ];

        // User Feedback Comparison
        $quizFeedback = UserFeedback::where('feedback_type', 'quiz')->get();
        $simFeedback = UserFeedback::where('feedback_type', 'simulation')->get();

        $feedbackComparison = [
            'quiz' => [
                'avg_engagement_score' => round($quizFeedback->avg('engagement_score'), 2),
                'avg_usability_score' => round($quizFeedback->avg('usability_score'), 2),
                'recommendation_rate' => round(($quizFeedback->where('would_recommend', true)->count() / $quizFeedback->count() * 100), 2),
                'count' => $quizFeedback->count(),
            ],
            'simulation' => [
                'avg_engagement_score' => round($simFeedback->avg('engagement_score'), 2),
                'avg_usability_score' => round($simFeedback->avg('usability_score'), 2),
                'recommendation_rate' => round(($simFeedback->where('would_recommend', true)->count() / $simFeedback->count() * 100), 2),
                'count' => $simFeedback->count(),
            ],
        ];

        // Interaction Patterns (from interactions_summary)
        $quizInteractions = $quizOutcomes
            ->pluck('interactions_summary')
            ->filter()
            ->map(fn($i) => json_decode(json_encode($i), true))
            ->reduce(function ($carry, $item) {
                foreach ($item as $key => $value) {
                    $carry[$key] = ($carry[$key] ?? 0) + $value;
                }
                return $carry;
            }, []);

        $simInteractions = $simOutcomes
            ->pluck('interactions_summary')
            ->filter()
            ->map(fn($i) => json_decode(json_encode($i), true))
            ->reduce(function ($carry, $item) {
                foreach ($item as $key => $value) {
                    $carry[$key] = ($carry[$key] ?? 0) + $value;
                }
                return $carry;
            }, []);

        return response()->json([
            'research_question' => 'In what ways do quizzes and simulations enhance user engagement and knowledge retention in cybersecurity education?',
            'engagement_comparison' => $engagementComparison,
            'retention_comparison' => $retentionComparison,
            'user_perception_comparison' => $feedbackComparison,
            'interaction_patterns' => [
                'quiz_interactions' => $quizInteractions,
                'simulation_interactions' => $simInteractions,
            ],
            'key_findings' => [
                'Simulations show ' . ($engagementComparison['simulation']['avg_engagement_level'] - $engagementComparison['quiz']['avg_engagement_level']) . ' higher engagement level',
                'Simulation knowledge gain: ' . $retentionComparison['simulation']['avg_knowledge_gain'] . ' vs Quiz: ' . $retentionComparison['quiz']['avg_knowledge_gain'],
                'Simulation recommendation rate: ' . $feedbackComparison['simulation']['recommendation_rate'] . '% vs Quiz: ' . $feedbackComparison['quiz']['recommendation_rate'] . '%',
            ],
        ]);
    }

    /**
     * RQ3: What are the lived experiences and perceptions of users?
     * Qualitative analysis of user feedback and comments
     */
    public function researchQuestion3(Request $request)
    {
        $this->authorize('admin');

        $allFeedback = UserFeedback::with('user')->get();

        if ($allFeedback->isEmpty()) {
            return response()->json(['message' => 'No feedback available']);
        }

        // Quantitative Summary
        $quantitativeSummary = [
            'total_responses' => $allFeedback->count(),
            'usability_avg' => round($allFeedback->avg('usability_score'), 2),
            'relevance_avg' => round($allFeedback->avg('relevance_score'), 2),
            'practicality_avg' => round($allFeedback->avg('practicality_score'), 2),
            'engagement_avg' => round($allFeedback->avg('engagement_score'), 2),
            'overall_satisfaction' => round($allFeedback->avg('engagement_score'), 2),
        ];

        // Difficulty Perceptions
        $difficultyPerceptions = $allFeedback->groupBy('perceived_difficulty')
            ->map->count()
            ->toArray();

        // Recommendation Analysis
        $recommendations = [
            'total_recommendations' => $allFeedback->where('would_recommend', true)->count(),
            'recommendation_rate' => round(($allFeedback->where('would_recommend', true)->count() / $allFeedback->count()) * 100, 2),
        ];

        // Qualitative Comments Analysis
        $comments = $allFeedback->whereNotNull('comment')->pluck('comment')->toArray();
        $themes = $this->analyzeThemes($comments);

        // Satisfaction by Activity Type
        $satisfactionByType = $allFeedback->groupBy('feedback_type')
            ->map(function ($items) {
                return [
                    'count' => $items->count(),
                    'usability' => round($items->avg('usability_score'), 2),
                    'relevance' => round($items->avg('relevance_score'), 2),
                    'practicality' => round($items->avg('practicality_score'), 2),
                    'engagement' => round($items->avg('engagement_score'), 2),
                    'recommendation_rate' => round(($items->where('would_recommend', true)->count() / $items->count() * 100), 2),
                ];
            });

        // Sample Quotes (positive and negative)
        $positiveComments = $allFeedback->where('engagement_score', '>=', 4)
            ->whereNotNull('comment')
            ->pluck('comment')
            ->take(3);

        $constructiveComments = $allFeedback->where('engagement_score', '<', 3)
            ->whereNotNull('comment')
            ->pluck('comment')
            ->take(3);

        return response()->json([
            'research_question' => 'What are the lived experiences and perceptions of users who undergo the interactive cybercrime awareness training?',
            'quantitative_summary' => $quantitativeSummary,
            'difficulty_perceptions' => $difficultyPerceptions,
            'recommendations' => $recommendations,
            'satisfaction_by_activity_type' => $satisfactionByType,
            'emerging_themes' => $themes,
            'sample_positive_experiences' => $positiveComments,
            'sample_constructive_feedback' => $constructiveComments,
            'key_findings' => [
                'Overall satisfaction score: ' . $quantitativeSummary['overall_satisfaction'] . '/5',
                'Primary themes: ' . implode(', ', array_slice(array_keys($themes), 0, 3)),
                'Recommendation rate: ' . $recommendations['recommendation_rate'] . '%',
            ],
        ]);
    }

    /**
     * RQ4: How does adaptive feedback influence behavioral readiness?
     * Tracks behavioral change indicators and feedback impact
     */
    public function researchQuestion4(Request $request)
    {
        $this->authorize('admin');

        $outcomes = LearningOutcome::completed()->get();

        if ($outcomes->isEmpty()) {
            return response()->json(['message' => 'No data available']);
        }

        // Behavioral Change Tracking
        $behavioralChangeStats = [
            'demonstrated_behavior_change' => $outcomes->where('demonstrated_behavior_change', true)->count(),
            'behavior_change_rate' => round(($outcomes->where('demonstrated_behavior_change', true)->count() / $outcomes->count()) * 100, 2),
        ];

        // Response Patterns Analysis
        $responsePatterns = $outcomes
            ->pluck('response_patterns')
            ->filter()
            ->map(fn($p) => json_decode(json_encode($p), true))
            ->reduce(function ($carry, $item) {
                foreach ($item as $key => $value) {
                    $carry[$key] = ($carry[$key] ?? 0) + ($value ? 1 : 0);
                }
                return $carry;
            }, []);

        // Threat Recognition Effectiveness
        $threatRecognitionAccuracy = $outcomes
            ->pluck('threat_recognition_notes')
            ->filter()
            ->count();

        // Performance Correlation with Behavior Change
        $withBehaviorChange = $outcomes->where('demonstrated_behavior_change', true);
        $withoutBehaviorChange = $outcomes->where('demonstrated_behavior_change', false);

        $performanceCorrelation = [
            'avg_performance_with_change' => round($withBehaviorChange->avg('performance_score'), 2),
            'avg_performance_without_change' => round($withoutBehaviorChange->avg('performance_score'), 2),
            'difference' => round($withBehaviorChange->avg('performance_score') - $withoutBehaviorChange->avg('performance_score'), 2),
        ];

        // Engagement Correlation with Behavior Change
        $engagementCorrelation = [
            'avg_engagement_with_change' => round($withBehaviorChange->avg('engagement_level'), 2),
            'avg_engagement_without_change' => round($withoutBehaviorChange->avg('engagement_level'), 2),
            'difference' => round($withBehaviorChange->avg('engagement_level') - $withoutBehaviorChange->avg('engagement_level'), 2),
        ];

        // Threat Recognition by Behavioral Change
        $threatRecognitionByChange = [
            'with_behavior_change' => $withBehaviorChange->pluck('threat_recognition_notes')->filter()->count(),
            'without_behavior_change' => $withoutBehaviorChange->pluck('threat_recognition_notes')->filter()->count(),
        ];

        // Readiness Score (composite: engagement + performance + behavior_change)
        $readinessScores = $outcomes->map(function ($outcome) {
            $readiness = (
                ($outcome->engagement_level * 40) +
                (($outcome->performance_score / 100) * 40) +
                ($outcome->demonstrated_behavior_change ? 20 : 0)
            ) / 100;
            return $readiness;
        });

        return response()->json([
            'research_question' => 'How does adaptive feedback influence participants\' behavioral readiness toward recognizing and mitigating cyber threats?',
            'behavioral_readiness_metrics' => $behavioralChangeStats,
            'performance_behavior_correlation' => $performanceCorrelation,
            'engagement_behavior_correlation' => $engagementCorrelation,
            'threat_recognition_by_behavior' => $threatRecognitionByChange,
            'response_patterns' => $responsePatterns,
            'readiness_assessment' => [
                'avg_readiness_score' => round($readinessScores->avg(), 2),
                'high_readiness' => $readinessScores->filter(fn($s) => $s >= 70)->count(),
                'moderate_readiness' => $readinessScores->filter(fn($s) => $s >= 40 && $s < 70)->count(),
                'needs_support' => $readinessScores->filter(fn($s) => $s < 40)->count(),
            ],
            'key_findings' => [
                'Behavioral readiness rate: ' . $behavioralChangeStats['behavior_change_rate'] . '%',
                'Performance difference (with vs without behavior change): ' . $performanceCorrelation['difference'] . ' points',
                'Engagement enhances readiness by ' . $engagementCorrelation['difference'] . ' points',
                'Threat recognition rate among participants: ' . round(($threatRecognitionAccuracy / $outcomes->count() * 100), 2) . '%',
            ],
        ]);
    }

    /**
     * Helper: Calculate Standard Deviation
     */
    private function calculateStdDev($values)
    {
        if (empty($values))
            return 0;

        $mean = array_sum($values) / count($values);
        $squaredDiffs = array_map(fn($x) => pow($x - $mean, 2), $values);
        $variance = array_sum($squaredDiffs) / count($values);
        return sqrt($variance);
    }

    /**
     * Helper: Analyze themes from text comments
     */
    private function analyzeThemes($comments)
    {
        $themes = [
            'realistic' => 0,
            'practical' => 0,
            'engaging' => 0,
            'effective' => 0,
            'relevant' => 0,
            'challenging' => 0,
            'easy_to_use' => 0,
            'unclear' => 0,
            'difficult' => 0,
            'time_consuming' => 0,
        ];

        $keywords = [
            'realistic' => ['realistic', 'authentic', 'real', 'scenario', 'scenario-based'],
            'practical' => ['practical', 'applicable', 'real-world', 'usable', 'hands-on'],
            'engaging' => ['engaging', 'interesting', 'fun', 'exciting', 'compelling'],
            'effective' => ['effective', 'works', 'helpful', 'useful', 'beneficial'],
            'relevant' => ['relevant', 'related', 'pertinent', 'appropriate'],
            'challenging' => ['challenging', 'tough', 'pushes me', 'demanding'],
            'easy_to_use' => ['easy', 'simple', 'intuitive', 'straightforward', 'user-friendly'],
            'unclear' => ['unclear', 'confusing', 'confuse', 'unclear', 'hard to understand'],
            'difficult' => ['difficult', 'hard', 'struggle', 'struggled'],
            'time_consuming' => ['time consuming', 'long', 'took too long'],
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
}
