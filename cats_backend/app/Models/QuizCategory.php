<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class QuizCategory extends Model
{
    protected $fillable = [
        'slug',
        'name',
    ];

    public function quizzes(): HasMany
    {
        return $this->hasMany(Quiz::class, 'category_id');
    }

    public function simulations(): HasMany
    {
        return $this->hasMany(Simulation::class, 'category_id');
    }
}
