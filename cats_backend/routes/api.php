<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminUserController;
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

    Route::get('/users', [AdminUserController::class, 'index']);
    Route::post('/users', [AdminUserController::class, 'store']);
    Route::patch('/users/{user}', [AdminUserController::class, 'update']);
    Route::delete('/users/{user}', [AdminUserController::class, 'destroy']);
});
