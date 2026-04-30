<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SimulationChoice extends Model
{
    protected $fillable = [
        'step_id',
        'next_step_id',
        'text',
        'is_safe',
        'score_delta',
        'feedback',
        'explanation',
        'sort_order',
    ];

    protected $casts = [
        'is_safe' => 'bool',
        'score_delta' => 'int',
        'sort_order' => 'int',
    ];

    public function step(): BelongsTo
    {
        return $this->belongsTo(SimulationStep::class, 'step_id');
    }

    public function nextStep(): BelongsTo
    {
        return $this->belongsTo(SimulationStep::class, 'next_step_id');
    }
}
