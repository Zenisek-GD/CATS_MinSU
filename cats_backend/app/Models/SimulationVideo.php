<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SimulationVideo extends Model
{
    protected $fillable = [
        'simulation_id',
        'title',
        'description',
        'video_url',
        'video_path',
        'sort_order',
    ];

    protected $casts = [
        'sort_order' => 'int',
    ];

    /**
     * The URL to use for playback — external URL takes priority over local path.
     */
    public function getPlaybackUrlAttribute(): ?string
    {
        if ($this->video_url) {
            return $this->video_url;
        }
        if ($this->video_path) {
            return asset('storage/' . $this->video_path);
        }
        return null;
    }

    protected $appends = ['playback_url'];

    public function simulation(): BelongsTo
    {
        return $this->belongsTo(Simulation::class);
    }
}
