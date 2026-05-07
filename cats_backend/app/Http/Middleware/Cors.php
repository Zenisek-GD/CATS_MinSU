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
        Log::debug('CORS Request', [
            'method' => $request->getMethod(),
            'path' => $request->path(),
            'origin' => $origin,
            'host' => $request->host(),
        ]);

        if ($request->isMethod('OPTIONS')) {
            Log::debug('Preflight request received', ['origin' => $origin]);
            $preflight = response()->noContent();
            $preflight->headers->set('Access-Control-Allow-Origin', '*');
            $preflight->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
            $preflight->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
            $preflight->headers->set('Access-Control-Expose-Headers', 'Authorization');
            $preflight->headers->set('Access-Control-Max-Age', '86400');
            return $preflight;
        }

        $response = $next($request);

        // Use the headers bag so this works for all response types
        $response->headers->set('Access-Control-Allow-Origin', '*');
        $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
        $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
        $response->headers->set('Access-Control-Expose-Headers', 'Authorization');

        return $response;
    }
}
