<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TrainingModule extends Model
{
    protected $fillable = [
        'title',
        'description',
        'is_active',
        'quiz_id',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'quiz_id' => 'integer',
        ];
    }

    public function topics(): HasMany
    {
        return $this->hasMany(TrainingModuleTopic::class, 'training_module_id')->orderBy('sort_order');
    }

    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class, 'quiz_id');
    }
}
