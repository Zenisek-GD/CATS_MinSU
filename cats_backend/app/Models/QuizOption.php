<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuizOption extends Model
{
    protected $fillable = [
        'question_id',
        'label',
        'text',
        'is_correct',
        'sort_order',
    ];

    protected $casts = [
        'is_correct' => 'bool',
        'sort_order' => 'int',
    ];

    public function question(): BelongsTo
    {
        return $this->belongsTo(QuizQuestion::class, 'question_id');
    }
}
