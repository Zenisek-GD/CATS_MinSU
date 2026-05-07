<?php

namespace App\Http\Controllers;

use App\Models\Classroom;
use App\Models\ClassroomStudent;
use App\Models\ClassroomQuiz;
use App\Models\ClassroomSimulation;
use App\Models\ClassroomModule;
use App\Models\Quiz;
use App\Models\Simulation;
use App\Models\TrainingModule;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class TeacherClassroomController extends Controller
{
    /**
     * Get all classrooms for the authenticated teacher
     */
    public function index()
    {
        $teacher = Auth::user();
        
        $classrooms = Classroom::where('teacher_id', $teacher->id)
            ->withCount('students')
            ->with(['students' => function ($query) {
                $query->limit(5);
            }])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'classrooms' => $classrooms,
        ]);
    }

    /**
     * Create a new classroom
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $teacher = Auth::user();

        $classroom = Classroom::create([
            'teacher_id' => $teacher->id,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'status' => 'active',
        ]);

        // Generate QR code
        $this->generateQrCode($classroom);

        return response()->json([
            'message' => 'Classroom created successfully',
            'classroom' => $classroom->load('teacher'),
        ], 201);
    }

    /**
     * Get a specific classroom with details
     */
    public function show(Classroom $classroom)
    {
        $this->authorize('view', $classroom);

        $classroom->load([
            'teacher',
            'students',
            'quizzes' => function ($query) {
                $query->withPivot('assigned_at', 'due_date', 'is_active');
            },
            'simulations' => function ($query) {
                $query->withPivot('assigned_at', 'due_date', 'is_active');
            },
            'modules' => function ($query) {
                $query->withPivot('assigned_at', 'due_date', 'is_active');
            },
        ]);

        return response()->json([
            'classroom' => $classroom,
        ]);
    }

    /**
     * Update classroom details
     */
    public function update(Request $request, Classroom $classroom)
    {
        $this->authorize('update', $classroom);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'sometimes|in:active,archived',
        ]);

        $classroom->update($validated);

        return response()->json([
            'message' => 'Classroom updated successfully',
            'classroom' => $classroom,
        ]);
    }

    /**
     * Delete a classroom
     */
    public function destroy(Classroom $classroom)
    {
        $this->authorize('delete', $classroom);

        // Delete QR code file if exists
        if ($classroom->qr_code_path && Storage::exists($classroom->qr_code_path)) {
            Storage::delete($classroom->qr_code_path);
        }

        $classroom->delete();

        return response()->json([
            'message' => 'Classroom deleted successfully',
        ]);
    }

    /**
     * Get classroom QR code
     */
    public function getQrCode(Classroom $classroom)
    {
        $this->authorize('view', $classroom);

        if (!$classroom->qr_code_path || !Storage::exists($classroom->qr_code_path)) {
            $this->generateQrCode($classroom);
        }

        $qrCodeUrl = Storage::url($classroom->qr_code_path);

        return response()->json([
            'qr_code_url' => $qrCodeUrl,
            'classroom_code' => $classroom->code,
            'join_url' => config('app.frontend_url') . '/join-classroom/' . $classroom->code,
        ]);
    }

    /**
     * Regenerate classroom code and QR code
     */
    public function regenerateCode(Classroom $classroom)
    {
        $this->authorize('update', $classroom);

        // Delete old QR code
        if ($classroom->qr_code_path && Storage::exists($classroom->qr_code_path)) {
            Storage::delete($classroom->qr_code_path);
        }

        // Generate new code
        $classroom->code = Classroom::generateUniqueCode();
        $classroom->save();

        // Generate new QR code
        $this->generateQrCode($classroom);

        return response()->json([
            'message' => 'Classroom code regenerated successfully',
            'classroom' => $classroom,
        ]);
    }

    /**
     * Get students in a classroom
     */
    public function getStudents(Classroom $classroom)
    {
        $this->authorize('view', $classroom);

        $students = $classroom->students()
            ->withPivot('joined_at', 'status')
            ->get();

        return response()->json([
            'students' => $students,
        ]);
    }

    /**
     * Remove a student from classroom
     */
    public function removeStudent(Classroom $classroom, User $student)
    {
        $this->authorize('update', $classroom);

        ClassroomStudent::where('classroom_id', $classroom->id)
            ->where('student_id', $student->id)
            ->update(['status' => 'removed']);

        return response()->json([
            'message' => 'Student removed from classroom',
        ]);
    }

    /**
     * Assign a quiz to classroom
     */
    public function assignQuiz(Request $request, Classroom $classroom)
    {
        $this->authorize('update', $classroom);

        $validated = $request->validate([
            'quiz_id' => 'required|exists:quizzes,id',
            'due_date' => 'nullable|date|after:now',
        ]);

        $classroomQuiz = ClassroomQuiz::updateOrCreate(
            [
                'classroom_id' => $classroom->id,
                'quiz_id' => $validated['quiz_id'],
            ],
            [
                'due_date' => $validated['due_date'] ?? null,
                'is_active' => true,
            ]
        );

        return response()->json([
            'message' => 'Quiz assigned to classroom',
            'classroom_quiz' => $classroomQuiz->load('quiz'),
        ]);
    }

    /**
     * Remove quiz from classroom
     */
    public function removeQuiz(Classroom $classroom, Quiz $quiz)
    {
        $this->authorize('update', $classroom);

        ClassroomQuiz::where('classroom_id', $classroom->id)
            ->where('quiz_id', $quiz->id)
            ->delete();

        return response()->json([
            'message' => 'Quiz removed from classroom',
        ]);
    }

    /**
     * Assign a simulation to classroom
     */
    public function assignSimulation(Request $request, Classroom $classroom)
    {
        $this->authorize('update', $classroom);

        $validated = $request->validate([
            'simulation_id' => 'required|exists:simulations,id',
            'due_date' => 'nullable|date|after:now',
        ]);

        $classroomSimulation = ClassroomSimulation::updateOrCreate(
            [
                'classroom_id' => $classroom->id,
                'simulation_id' => $validated['simulation_id'],
            ],
            [
                'due_date' => $validated['due_date'] ?? null,
                'is_active' => true,
            ]
        );

        return response()->json([
            'message' => 'Simulation assigned to classroom',
            'classroom_simulation' => $classroomSimulation->load('simulation'),
        ]);
    }

    /**
     * Remove simulation from classroom
     */
    public function removeSimulation(Classroom $classroom, Simulation $simulation)
    {
        $this->authorize('update', $classroom);

        ClassroomSimulation::where('classroom_id', $classroom->id)
            ->where('simulation_id', $simulation->id)
            ->delete();

        return response()->json([
            'message' => 'Simulation removed from classroom',
        ]);
    }

    /**
     * Assign a module to classroom
     */
    public function assignModule(Request $request, Classroom $classroom)
    {
        $this->authorize('update', $classroom);

        $validated = $request->validate([
            'module_id' => 'required|exists:training_modules,id',
            'due_date' => 'nullable|date|after:now',
        ]);

        $classroomModule = ClassroomModule::updateOrCreate(
            [
                'classroom_id' => $classroom->id,
                'module_id' => $validated['module_id'],
            ],
            [
                'due_date' => $validated['due_date'] ?? null,
                'is_active' => true,
            ]
        );

        return response()->json([
            'message' => 'Module assigned to classroom',
            'classroom_module' => $classroomModule->load('module'),
        ]);
    }

    /**
     * Remove module from classroom
     */
    public function removeModule(Classroom $classroom, TrainingModule $module)
    {
        $this->authorize('update', $classroom);

        ClassroomModule::where('classroom_id', $classroom->id)
            ->where('module_id', $module->id)
            ->delete();

        return response()->json([
            'message' => 'Module removed from classroom',
        ]);
    }

    /**
     * Get classroom analytics/statistics
     */
    public function getAnalytics(Classroom $classroom)
    {
        $this->authorize('view', $classroom);

        $studentsCount = $classroom->students()->count();
        $quizzesCount = $classroom->quizzes()->count();
        $simulationsCount = $classroom->simulations()->count();
        $modulesCount = $classroom->modules()->count();

        // Get student progress statistics
        $students = $classroom->students()->with([
            'moduleProgress',
            'simulationRuns',
        ])->get();

        return response()->json([
            'analytics' => [
                'total_students' => $studentsCount,
                'total_quizzes' => $quizzesCount,
                'total_simulations' => $simulationsCount,
                'total_modules' => $modulesCount,
                'students' => $students,
            ],
        ]);
    }

    /**
     * Generate QR code for classroom
     */
    private function generateQrCode(Classroom $classroom)
    {
        $joinUrl = config('app.frontend_url', 'http://localhost:3000') . '/join-classroom/' . $classroom->code;
        
        $qrCode = QrCode::format('png')
            ->size(300)
            ->margin(1)
            ->generate($joinUrl);

        $filename = 'qr-codes/classroom-' . $classroom->id . '-' . $classroom->code . '.png';
        Storage::put($filename, $qrCode);

        $classroom->qr_code_path = $filename;
        $classroom->save();
    }
}
