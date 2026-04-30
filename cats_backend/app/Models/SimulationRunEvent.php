<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SimulationRunEvent extends Model
{
    protected $fillable = [
        'run_id',
        'step_id',
        'choice_id',
        'is_safe',
        'score_delta',
    ];

    protected $casts = [
        'is_safe' => 'bool',
        'score_delta' => 'int',
    ];

    public function run(): BelongsTo
    {
        return $this->belongsTo(SimulationRun::class, 'run_id');
    }

    public function step(): BelongsTo
    {
        return $this->belongsTo(SimulationStep::class, 'step_id');
    }

    public function choice(): BelongsTo
    {
        return $this->belongsTo(SimulationChoice::class, 'choice_id');
    }
}
