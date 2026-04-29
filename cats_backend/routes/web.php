<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/password/reset/{token}', function (string $token) {
    return response()->json([
        'token' => $token,
        'email' => request('email'),
        'message' => 'Use POST /api/auth/reset-password with token, email, password, password_confirmation.',
    ]);
})->name('password.reset');
