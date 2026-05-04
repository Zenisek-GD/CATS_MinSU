<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\File;

// Serve SPA frontend static files
Route::get('/assets/{path}', function ($path) {
    $file = public_path("dist/assets/$path");
    if (File::exists($file)) {
        return response()->file($file);
    }
    return response()->json(['error' => 'File not found'], 404);
})->where('path', '.*');

Route::get('/{file}', function ($file) {
    $filePath = public_path("dist/$file");
    if (File::exists($filePath) && !str_starts_with($file, 'api')) {
        return response()->file($filePath);
    }
    return null;
})->where('file', '.*\.(js|css|svg|png|jpg|gif|woff|woff2|ttf|eot)');

// Serve SPA frontend index.html for all routes
Route::fallback(function () {
    $distPath = public_path('dist/index.html');
    if (File::exists($distPath)) {
        return file_get_contents($distPath);
    }
    return response()->json(['error' => 'Frontend not found'], 404);
});

Route::get('/password/reset/{token}', function (string $token) {
    return response()->json([
        'token' => $token,
        'email' => request('email'),
        'message' => 'Use POST /api/auth/reset-password with token, email, password, password_confirmation.',
    ]);
})->name('password.reset');
