<?php

namespace App\Policies;

use App\Models\Classroom;
use App\Models\User;

class ClassroomPolicy
{
    /**
     * Determine if the user can view the classroom
     */
    public function view(User $user, Classroom $classroom): bool
    {
        // Teacher can view their own classroom
        if ($classroom->teacher_id === $user->id) {
            return true;
        }

        // Admin can view any classroom
        if ($user->role === 'admin') {
            return true;
        }

        return false;
    }

    /**
     * Determine if the user can update the classroom
     */
    public function update(User $user, Classroom $classroom): bool
    {
        // Only the teacher who created it or admin can update
        return $classroom->teacher_id === $user->id || $user->role === 'admin';
    }

    /**
     * Determine if the user can delete the classroom
     */
    public function delete(User $user, Classroom $classroom): bool
    {
        // Only the teacher who created it or admin can delete
        return $classroom->teacher_id === $user->id || $user->role === 'admin';
    }
}
