<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserFeedback extends Model
{
    protected $table = 'user_feedback';

    protected $fillable = [
        'user_id',
        'feedback_type',
        'quiz_id',
        'simulation_id',
        'training_module_id',
        'usability_score',
        'relevance_score',
        'practicality_score',
        'engagement_score',
        'comment',
        'key_themes',
        'perceived_difficulty',
        'would_recommend',
        'admin_notes',
        'admin_result',
        'status',
    ];

    protected $casts = [
        'key_themes' => 'array',
        'would_recommend' => 'bool',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class, 'quiz_id');
    }

    public function simulation(): BelongsTo
    {
        return $this->belongsTo(Simulation::class, 'simulation_id');
    }

    public function trainingModule(): BelongsTo
    {
        return $this->belongsTo(TrainingModule::class, 'training_module_id');
    }

    /**
     * Calculate average score across all rating dimensions
     */
    public function getAverageRatingAttribute(): ?float
    {
        $scores = array_filter([
            $this->usability_score,
            $this->relevance_score,
            $this->practicality_score,
            $this->engagement_score,
        ]);

        return count($scores) > 0 ? array_sum($scores) / count($scores) : null;
    }

    /**
     * Scope to get feedback for a specific activity
     */
    public function scopeForActivity($query, string $type, int $id)
    {
        $typeMap = [
            'quiz' => ['quiz_id', 'quiz'],
            'simulation' => ['simulation_id', 'simulation'],
            'module' => ['training_module_id', 'training_module'],
        ];

        if (!isset($typeMap[$type])) {
            return $query;
        }

        [$column, $fieldType] = $typeMap[$type];
        return $query->where('feedback_type', $fieldType)->where($column, $id);
    }

    /**
     * Scope to get feedback within a date range
     */
    public function scopeBetweenDates($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }
}
