<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Classroom extends Model
{
    use HasFactory;

    protected $fillable = [
        'teacher_id',
        'name',
        'description',
        'code',
        'qr_code_path',
        'status',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($classroom) {
            if (empty($classroom->code)) {
                $classroom->code = self::generateUniqueCode();
            }
        });
    }

    public static function generateUniqueCode(): string
    {
        do {
            $code = strtoupper(Str::random(8));
        } while (self::where('code', $code)->exists());

        return $code;
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function students(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'classroom_students', 'classroom_id', 'student_id')
            ->withPivot('joined_at', 'status')
            ->withTimestamps()
            ->wherePivot('status', 'active');
    }

    public function allStudents(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'classroom_students', 'classroom_id', 'student_id')
            ->withPivot('joined_at', 'status')
            ->withTimestamps();
    }

    public function classroomStudents(): HasMany
    {
        return $this->hasMany(ClassroomStudent::class);
    }

    public function quizzes(): BelongsToMany
    {
        return $this->belongsToMany(Quiz::class, 'classroom_quizzes')
            ->withPivot('assigned_at', 'due_date', 'is_active')
            ->withTimestamps();
    }

    public function simulations(): BelongsToMany
    {
        return $this->belongsToMany(Simulation::class, 'classroom_simulations')
            ->withPivot('assigned_at', 'due_date', 'is_active')
            ->withTimestamps();
    }

    public function modules(): BelongsToMany
    {
        return $this->belongsToMany(TrainingModule::class, 'classroom_modules', 'classroom_id', 'module_id')
            ->withPivot('assigned_at', 'due_date', 'is_active')
            ->withTimestamps();
    }
}
