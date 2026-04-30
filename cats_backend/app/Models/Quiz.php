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
}
