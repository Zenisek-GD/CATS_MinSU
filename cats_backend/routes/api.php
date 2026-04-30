<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\AdminTrainingModuleController;
use App\Http\Controllers\AdminQuestionController;
use App\Http\Controllers\AdminQuizController;
use App\Http\Controllers\AdminSimulationController;
use App\Http\Controllers\AdminBadgeController;
use App\Http\Controllers\AssessmentController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LeaderboardController;
use App\Http\Controllers\QuizAttemptController;
use App\Http\Controllers\QuizController;
use App\Http\Controllers\SimulationController;
use App\Http\Controllers\SimulationRunController;
use App\Http\Controllers\TrainingModuleController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;

Route::prefix('auth')->group(function () {
    Route::withoutMiddleware('auth.jwt')->post('/login', [AuthController::class, 'login']);
    Route::withoutMiddleware('auth.jwt')->post('/register', [AuthController::class, 'register']);
    Route::withoutMiddleware('auth.jwt')->post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::withoutMiddleware('auth.jwt')->post('/reset-password', [AuthController::class, 'resetPassword']);

    Route::post('/logout', [AuthController::class, 'logout']);
});

Route::get('/me', function () {
    $user = Auth::user();

    return response()->json([
        'user' => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'participant_code' => $user->participant_code,
        ],
    ]);
})->middleware('role:user,admin');

Route::get('/dashboard', [DashboardController::class, 'userDashboard'])->middleware('role:user,admin');

Route::get('/modules', [TrainingModuleController::class, 'index'])->middleware('role:user,admin');

Route::get('/simulations', [SimulationController::class, 'index'])->middleware('role:user,admin');
Route::get('/simulations/{simulation}', [SimulationController::class, 'show'])->middleware('role:user,admin');
Route::post('/simulations/{simulation}/runs', [SimulationRunController::class, 'start'])->middleware('role:user,admin');
Route::get('/simulation-runs/{run}', [SimulationRunController::class, 'show'])->middleware('role:user,admin');
Route::post('/simulation-runs/{run}/choose', [SimulationRunController::class, 'choose'])->middleware('role:user,admin');

Route::get('/quiz/categories', [QuizController::class, 'categories'])->middleware('role:user,admin');
Route::get('/quizzes', [QuizController::class, 'index'])->middleware('role:user,admin');
Route::get('/quizzes/{quiz}', [QuizController::class, 'show'])->middleware('role:user,admin');

Route::post('/quizzes/{quiz}/attempts', [QuizAttemptController::class, 'start'])->middleware('role:user,admin');
Route::get('/quiz-attempts/{attempt}', [QuizAttemptController::class, 'show'])->middleware('role:user,admin');
Route::post('/quiz-attempts/{attempt}/submit', [QuizAttemptController::class, 'submit'])->middleware('role:user,admin');

Route::get('/leaderboard/quizzes/{quiz}', [LeaderboardController::class, 'quiz'])->middleware('role:user,admin');
Route::get('/leaderboard/categories/{category}', [LeaderboardController::class, 'category'])->middleware('role:user,admin');

Route::get('/assessments/summary', [AssessmentController::class, 'summary'])->middleware('role:user,admin');
Route::get('/assessments/report', [AssessmentController::class, 'report'])->middleware('role:user,admin');

Route::prefix('admin')->middleware('role:admin')->group(function () {
    Route::get('/me', function () {
        $user = Auth::user();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
        ]);
    });

    // Users
    Route::get('/users', [AdminUserController::class, 'index']);
    Route::post('/users', [AdminUserController::class, 'store']);
    Route::patch('/users/{user}', [AdminUserController::class, 'update']);
    Route::delete('/users/{user}', [AdminUserController::class, 'destroy']);
    Route::patch('/users/{user}/status', [AdminUserController::class, 'updateStatus']);
    Route::post('/users/{user}/reset-password', [AdminUserController::class, 'resetPassword']);
    Route::get('/users/{user}/performance', [AdminUserController::class, 'performance']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'adminDashboard']);

    // Training Modules
    Route::get('/modules', [AdminTrainingModuleController::class, 'index']);
    Route::post('/modules', [AdminTrainingModuleController::class, 'store']);
    Route::patch('/modules/{module}', [AdminTrainingModuleController::class, 'update']);
    Route::delete('/modules/{module}', [AdminTrainingModuleController::class, 'destroy']);

    // Quiz Management
    Route::get('/quizzes', [AdminQuizController::class, 'index']);
    Route::post('/quizzes', [AdminQuizController::class, 'store']);
    Route::patch('/quizzes/{quiz}', [AdminQuizController::class, 'update']);
    Route::delete('/quizzes/{quiz}', [AdminQuizController::class, 'destroy']);

    // Quiz Categories
    Route::get('/quiz-categories', [AdminQuizController::class, 'categories']);
    Route::post('/quiz-categories', [AdminQuizController::class, 'storeCategory']);
    Route::patch('/quiz-categories/{category}', [AdminQuizController::class, 'updateCategory']);
    Route::delete('/quiz-categories/{category}', [AdminQuizController::class, 'destroyCategory']);

    // Questions
    Route::get('/questions', [AdminQuestionController::class, 'index']);
    Route::post('/questions', [AdminQuestionController::class, 'store']);
    Route::patch('/questions/{question}', [AdminQuestionController::class, 'update']);
    Route::delete('/questions/{question}', [AdminQuestionController::class, 'destroy']);

    // Simulations
    Route::get('/simulations', [AdminSimulationController::class, 'index']);
    Route::post('/simulations', [AdminSimulationController::class, 'store']);
    Route::patch('/simulations/{simulation}', [AdminSimulationController::class, 'update']);
    Route::delete('/simulations/{simulation}', [AdminSimulationController::class, 'destroy']);
    Route::post('/simulations/{simulation}/steps', [AdminSimulationController::class, 'storeStep']);
    Route::patch('/simulation-steps/{step}', [AdminSimulationController::class, 'updateStep']);
    Route::delete('/simulation-steps/{step}', [AdminSimulationController::class, 'destroyStep']);
    Route::post('/simulation-steps/{step}/choices', [AdminSimulationController::class, 'storeChoice']);
    Route::patch('/simulation-choices/{choice}', [AdminSimulationController::class, 'updateChoice']);
    Route::delete('/simulation-choices/{choice}', [AdminSimulationController::class, 'destroyChoice']);

    // Badges
    Route::get('/badges', [AdminBadgeController::class, 'indexBadges']);
    Route::post('/badges', [AdminBadgeController::class, 'storeBadge']);
    Route::patch('/badges/{badge}', [AdminBadgeController::class, 'updateBadge']);
    Route::delete('/badges/{badge}', [AdminBadgeController::class, 'destroyBadge']);

    // Achievements
    Route::get('/achievements', [AdminBadgeController::class, 'indexAchievements']);
    Route::post('/achievements', [AdminBadgeController::class, 'storeAchievement']);
    Route::patch('/achievements/{achievement}', [AdminBadgeController::class, 'updateAchievement']);
    Route::delete('/achievements/{achievement}', [AdminBadgeController::class, 'destroyAchievement']);
});
