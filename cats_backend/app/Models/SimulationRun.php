<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SimulationRun extends Model
{
    protected $fillable = [
        'user_id',
        'simulation_id',
        'status',
        'time_limit_seconds',
        'started_at',
        'finished_at',
        'score',
        'max_score',
        'current_step_id',
    ];

    protected $casts = [
        'time_limit_seconds' => 'int',
        'started_at' => 'datetime',
        'finished_at' => 'datetime',
        'score' => 'int',
        'max_score' => 'int',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function simulation(): BelongsTo
    {
        return $this->belongsTo(Simulation::class, 'simulation_id');
    }

    public function currentStep(): BelongsTo
    {
        return $this->belongsTo(SimulationStep::class, 'current_step_id');
    }

    public function events(): HasMany
    {
        return $this->hasMany(SimulationRunEvent::class, 'run_id');
    }
}
