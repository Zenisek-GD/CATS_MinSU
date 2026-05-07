<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClassroomSimulation extends Model
{
    use HasFactory;

    protected $fillable = [
        'classroom_id',
        'simulation_id',
        'assigned_at',
        'due_date',
        'is_active',
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
        'due_date' => 'datetime',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function classroom(): BelongsTo
    {
        return $this->belongsTo(Classroom::class);
    }

    public function simulation(): BelongsTo
    {
        return $this->belongsTo(Simulation::class);
    }
}
