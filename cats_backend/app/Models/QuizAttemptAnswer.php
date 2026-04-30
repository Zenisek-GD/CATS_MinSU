<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuizAttemptAnswer extends Model
{
    protected $fillable = [
        'attempt_id',
        'question_id',
        'selected_option_id',
        'boolean_answer',
        'is_correct',
        'earned_points',
    ];

    protected $casts = [
        'boolean_answer' => 'bool',
        'is_correct' => 'bool',
        'earned_points' => 'int',
    ];

    public function attempt(): BelongsTo
    {
        return $this->belongsTo(QuizAttempt::class, 'attempt_id');
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(QuizQuestion::class, 'question_id');
    }

    public function selectedOption(): BelongsTo
    {
        return $this->belongsTo(QuizOption::class, 'selected_option_id');
    }
}
