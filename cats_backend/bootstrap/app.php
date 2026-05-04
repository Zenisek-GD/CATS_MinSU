<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->prepend(\App\Http\Middleware\Cors::class);

        $middleware->alias([
            'auth.jwt' => \App\Http\Middleware\JwtAuth::class,
            'role' => \App\Http\Middleware\RequireRole::class,
        ]);

        $middleware->appendToGroup('api', [
            'auth.jwt',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
