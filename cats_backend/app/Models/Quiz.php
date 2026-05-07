<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Quiz extends Model
{
    protected $fillable = [
        'category_id',
        'title',
        'description',
        'difficulty',
        'kind',
        'randomize_questions',
        'question_count',
        'time_limit_seconds',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'randomize_questions' => 'bool',
        'is_active' => 'bool',
        'question_count' => 'int',
        'time_limit_seconds' => 'int',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(QuizCategory::class, 'category_id');
    }

    public function questions(): HasMany
    {
        return $this->hasMany(QuizQuestion::class, 'quiz_id')->orderBy('sort_order');
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(QuizAttempt::class, 'quiz_id');
    }

    public function feedback(): HasMany
    {
        return $this->hasMany(UserFeedback::class, 'quiz_id');
    }

    /**
     * Check if a user has completed this quiz (allows retakes)
     */
    public function isCompletedByUser($userId): bool
    {
        return $this->attempts()
            ->where('user_id', $userId)
            ->where('status', 'completed')
            ->where('is_first_attempt', true)
            ->exists();
    }

    /**
     * Get first completion info for a user
     */
    public function getFirstCompletionForUser($userId)
    {
        return $this->attempts()
            ->where('user_id', $userId)
            ->where('is_first_attempt', true)
            ->where('status', 'completed')
            ->first();
    }
}
