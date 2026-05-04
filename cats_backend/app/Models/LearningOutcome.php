<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LearningOutcome extends Model
{
    protected $fillable = [
        'user_id',
        'activity_type',
        'quiz_attempt_id',
        'simulation_run_id',
        'training_module_id',
        'time_spent_seconds',
        'performance_score',
        'engagement_level',
        'interactions_summary',
        'is_completed',
        'knowledge_level_pre',
        'knowledge_level_post',
        'knowledge_gain',
        'threat_recognition_notes',
        'response_patterns',
        'demonstrated_behavior_change',
        'learning_method',
    ];

    protected $casts = [
        'interactions_summary' => 'array',
        'response_patterns' => 'array',
        'is_completed' => 'bool',
        'demonstrated_behavior_change' => 'bool',
        'performance_score' => 'float',
        'engagement_level' => 'float',
        'time_spent_seconds' => 'int',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function quizAttempt(): BelongsTo
    {
        return $this->belongsTo(QuizAttempt::class, 'quiz_attempt_id');
    }

    public function simulationRun(): BelongsTo
    {
        return $this->belongsTo(SimulationRun::class, 'simulation_run_id');
    }

    public function trainingModule(): BelongsTo
    {
        return $this->belongsTo(TrainingModule::class, 'training_module_id');
    }

    /**
     * Calculate knowledge gain percentage
     */
    public function getKnowledgeGainPercentageAttribute(): ?float
    {
        if ($this->knowledge_level_pre === null || $this->knowledge_level_post === null) {
            return null;
        }

        // Scale from 1-5 to 0-100
        $prePercent = (($this->knowledge_level_pre - 1) / 4) * 100;
        $postPercent = (($this->knowledge_level_post - 1) / 4) * 100;

        return $postPercent - $prePercent;
    }

    /**
     * Get time spent in minutes
     */
    public function getTimeSpentMinutesAttribute(): float
    {
        return round($this->time_spent_seconds / 60, 2);
    }

    /**
     * Scope to filter by learning method
     */
    public function scopeByMethod($query, string $method)
    {
        return $query->where('learning_method', $method);
    }

    /**
     * Scope to get only completed outcomes
     */
    public function scopeCompleted($query)
    {
        return $query->where('is_completed', true);
    }

    /**
     * Scope to get outcomes showing behavioral change
     */
    public function scopeWithBehavioralChange($query)
    {
        return $query->where('demonstrated_behavior_change', true);
    }

    /**
     * Scope to filter by performance threshold
     */
    public function scopeAbovePerformanceThreshold($query, float $threshold)
    {
        return $query->where('performance_score', '>=', $threshold);
    }

    /**
     * Calculate engagement metrics for a user
     */
    public static function getUserEngagementMetrics(int $userId)
    {
        $outcomes = self::where('user_id', $userId)
            ->where('is_completed', true)
            ->get();

        if ($outcomes->isEmpty()) {
            return null;
        }

        return [
            'total_activities' => $outcomes->count(),
            'average_performance' => round($outcomes->avg('performance_score'), 2),
            'average_engagement' => round($outcomes->avg('engagement_level'), 2),
            'average_time_minutes' => round($outcomes->sum('time_spent_seconds') / 60 / $outcomes->count(), 2),
            'completion_rate' => round(($outcomes->where('is_completed', true)->count() / $outcomes->count()) * 100, 2),
            'behavioral_changes' => $outcomes->where('demonstrated_behavior_change', true)->count(),
            'average_knowledge_gain' => round($outcomes->avg('knowledge_gain'), 2),
        ];
    }

    /**
     * Compare effectiveness between learning methods
     */
    public static function compareEffectiveness(string $method1, string $method2, ?int $userId = null)
    {
        $query1 = self::byMethod($method1)->completed();
        $query2 = self::byMethod($method2)->completed();

        if ($userId) {
            $query1 = $query1->where('user_id', $userId);
            $query2 = $query2->where('user_id', $userId);
        }

        $data1 = $query1->get();
        $data2 = $query2->get();

        return [
            $method1 => [
                'count' => $data1->count(),
                'avg_performance' => $data1->count() > 0 ? round($data1->avg('performance_score'), 2) : 0,
                'avg_engagement' => $data1->count() > 0 ? round($data1->avg('engagement_level'), 2) : 0,
                'behavioral_change_rate' => $data1->count() > 0 ? round(($data1->where('demonstrated_behavior_change', true)->count() / $data1->count()) * 100, 2) : 0,
            ],
            $method2 => [
                'count' => $data2->count(),
                'avg_performance' => $data2->count() > 0 ? round($data2->avg('performance_score'), 2) : 0,
                'avg_engagement' => $data2->count() > 0 ? round($data2->avg('engagement_level'), 2) : 0,
                'behavioral_change_rate' => $data2->count() > 0 ? round(($data2->where('demonstrated_behavior_change', true)->count() / $data2->count()) * 100, 2) : 0,
            ],
        ];
    }
}
