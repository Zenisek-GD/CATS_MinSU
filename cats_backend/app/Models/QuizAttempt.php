<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class QuizAttempt extends Model
{
    protected $fillable = [
        'user_id',
        'quiz_id',
        'status',
        'time_limit_seconds',
        'started_at',
        'finished_at',
        'score',
        'max_score',
        'percent',
        'question_order',
        'is_first_attempt',
        'first_completed_at',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'finished_at' => 'datetime',
        'first_completed_at' => 'datetime',
        'time_limit_seconds' => 'int',
        'score' => 'int',
        'max_score' => 'int',
        'percent' => 'float',
        'is_first_attempt' => 'boolean',
        'question_order' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class, 'quiz_id');
    }

    public function answers(): HasMany
    {
        return $this->hasMany(QuizAttemptAnswer::class, 'attempt_id');
    }

    public function learningOutcome(): HasMany
    {
        return $this->hasMany(LearningOutcome::class, 'quiz_attempt_id');
    }
}
