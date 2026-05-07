<?php

namespace App\Http\Controllers;

use App\Models\Classroom;
use App\Models\ClassroomStudent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class StudentClassroomController extends Controller
{
    /**
     * Get all classrooms the student is enrolled in
     */
    public function index()
    {
        $student = Auth::user();
        
        $classrooms = $student->enrolledClassrooms()
            ->with(['teacher', 'quizzes', 'simulations', 'modules'])
            ->withCount(['students'])
            ->get();

        return response()->json([
            'classrooms' => $classrooms,
        ]);
    }

    /**
     * Join a classroom using code
     */
    public function joinByCode(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|size:8',
        ]);

        $classroom = Classroom::where('code', strtoupper($validated['code']))
            ->where('status', 'active')
            ->first();

        if (!$classroom) {
            return response()->json([
                'message' => 'Invalid classroom code',
            ], 404);
        }

        $student = Auth::user();

        // Check if already enrolled
        $existingEnrollment = ClassroomStudent::where('classroom_id', $classroom->id)
            ->where('student_id', $student->id)
            ->first();

        if ($existingEnrollment) {
            if ($existingEnrollment->status === 'active') {
                return response()->json([
                    'message' => 'You are already enrolled in this classroom',
                    'classroom' => $classroom->load('teacher'),
                ], 200);
            } else {
                // Reactivate if previously removed
                $existingEnrollment->update(['status' => 'active']);
                return response()->json([
                    'message' => 'Successfully rejoined classroom',
                    'classroom' => $classroom->load('teacher'),
                ], 200);
            }
        }

        // Create new enrollment
        ClassroomStudent::create([
            'classroom_id' => $classroom->id,
            'student_id' => $student->id,
            'status' => 'active',
        ]);

        return response()->json([
            'message' => 'Successfully joined classroom',
            'classroom' => $classroom->load('teacher'),
        ], 201);
    }

    /**
     * Get details of a specific classroom
     */
    public function show(Classroom $classroom)
    {
        $student = Auth::user();

        // Check if student is enrolled
        $enrollment = ClassroomStudent::where('classroom_id', $classroom->id)
            ->where('student_id', $student->id)
            ->where('status', 'active')
            ->first();

        if (!$enrollment) {
            return response()->json([
                'message' => 'You are not enrolled in this classroom',
            ], 403);
        }

        $classroom->load([
            'teacher',
            'quizzes' => function ($query) {
                $query->withPivot('assigned_at', 'due_date', 'is_active')
                    ->wherePivot('is_active', true);
            },
            'simulations' => function ($query) {
                $query->withPivot('assigned_at', 'due_date', 'is_active')
                    ->wherePivot('is_active', true);
            },
            'modules' => function ($query) {
                $query->withPivot('assigned_at', 'due_date', 'is_active')
                    ->wherePivot('is_active', true);
            },
        ]);

        return response()->json([
            'classroom' => $classroom,
            'enrollment' => $enrollment,
        ]);
    }

    /**
     * Leave a classroom
     */
    public function leave(Classroom $classroom)
    {
        $student = Auth::user();

        $enrollment = ClassroomStudent::where('classroom_id', $classroom->id)
            ->where('student_id', $student->id)
            ->where('status', 'active')
            ->first();

        if (!$enrollment) {
            return response()->json([
                'message' => 'You are not enrolled in this classroom',
            ], 404);
        }

        $enrollment->update(['status' => 'removed']);

        return response()->json([
            'message' => 'Successfully left classroom',
        ]);
    }

    /**
     * Get assigned quizzes for a classroom
     */
    public function getQuizzes(Classroom $classroom)
    {
        $student = Auth::user();

        // Verify enrollment
        $enrollment = ClassroomStudent::where('classroom_id', $classroom->id)
            ->where('student_id', $student->id)
            ->where('status', 'active')
            ->first();

        if (!$enrollment) {
            return response()->json([
                'message' => 'You are not enrolled in this classroom',
            ], 403);
        }

        $quizzes = $classroom->quizzes()
            ->withPivot('assigned_at', 'due_date', 'is_active')
            ->wherePivot('is_active', true)
            ->get();

        return response()->json([
            'quizzes' => $quizzes,
        ]);
    }

    /**
     * Get assigned simulations for a classroom
     */
    public function getSimulations(Classroom $classroom)
    {
        $student = Auth::user();

        // Verify enrollment
        $enrollment = ClassroomStudent::where('classroom_id', $classroom->id)
            ->where('student_id', $student->id)
            ->where('status', 'active')
            ->first();

        if (!$enrollment) {
            return response()->json([
                'message' => 'You are not enrolled in this classroom',
            ], 403);
        }

        $simulations = $classroom->simulations()
            ->withPivot('assigned_at', 'due_date', 'is_active')
            ->wherePivot('is_active', true)
            ->get();

        return response()->json([
            'simulations' => $simulations,
        ]);
    }

    /**
     * Get assigned modules for a classroom
     */
    public function getModules(Classroom $classroom)
    {
        $student = Auth::user();

        // Verify enrollment
        $enrollment = ClassroomStudent::where('classroom_id', $classroom->id)
            ->where('student_id', $student->id)
            ->where('status', 'active')
            ->first();

        if (!$enrollment) {
            return response()->json([
                'message' => 'You are not enrolled in this classroom',
            ], 403);
        }

        $modules = $classroom->modules()
            ->withPivot('assigned_at', 'due_date', 'is_active')
            ->wherePivot('is_active', true)
            ->get();

        return response()->json([
            'modules' => $modules,
        ]);
    }

    /**
     * Verify classroom code (without joining)
     */
    public function verifyCode(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|size:8',
        ]);

        $classroom = Classroom::where('code', strtoupper($validated['code']))
            ->where('status', 'active')
            ->with('teacher:id,name,email')
            ->first();

        if (!$classroom) {
            return response()->json([
                'valid' => false,
                'message' => 'Invalid classroom code',
            ], 404);
        }

        return response()->json([
            'valid' => true,
            'classroom' => [
                'id' => $classroom->id,
                'name' => $classroom->name,
                'description' => $classroom->description,
                'teacher' => $classroom->teacher,
            ],
        ]);
    }
}
