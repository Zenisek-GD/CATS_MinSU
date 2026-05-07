<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;


class Simulation extends Model
{
    protected $fillable = [
        'category_id',
        'title',
        'description',
        'difficulty',
        'time_limit_seconds',
        'max_score',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'time_limit_seconds' => 'int',
        'max_score' => 'int',
        'is_active' => 'bool',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(QuizCategory::class, 'category_id');
    }

    public function steps(): HasMany
    {
        return $this->hasMany(SimulationStep::class, 'simulation_id')->orderBy('step_order');
    }

    public function runs(): HasMany
    {
        return $this->hasMany(SimulationRun::class, 'simulation_id');
    }

    public function feedback(): HasMany
    {
        return $this->hasMany(UserFeedback::class, 'simulation_id');
    }

    public function videos(): HasMany
    {
        return $this->hasMany(SimulationVideo::class, 'simulation_id')->orderBy('sort_order');
    }
}
