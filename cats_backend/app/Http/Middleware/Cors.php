<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class Cors
{
    public function handle(Request $request, Closure $next)
    {
        $origin = $request->header('Origin');
        $frontendUrl = rtrim((string) env('FRONTEND_URL', '*'), '/');

        // Allow the configured frontend origin, or any origin if not set
        $allowedOrigin = ($frontendUrl && $frontendUrl !== '*' && $origin === $frontendUrl)
            ? $origin
            : '*';

        if ($request->isMethod('OPTIONS')) {
            $preflight = response()->noContent();
            $preflight->headers->set('Access-Control-Allow-Origin', $allowedOrigin);
            $preflight->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
            $preflight->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
            $preflight->headers->set('Access-Control-Expose-Headers', 'Authorization');
            $preflight->headers->set('Access-Control-Max-Age', '86400');
            return $preflight;
        }

        $response = $next($request);

        $response->headers->set('Access-Control-Allow-Origin', $allowedOrigin);
        $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
        $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
        $response->headers->set('Access-Control-Expose-Headers', 'Authorization');

        return $response;
    }
}
