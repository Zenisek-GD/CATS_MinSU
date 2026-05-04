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
            return response()
                ->noContent()
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept')
                ->header('Access-Control-Expose-Headers', 'Authorization')
                ->header('Access-Control-Max-Age', '86400');
        }

        $response = $next($request);

        return $response
            ->header('Access-Control-Allow-Origin', '*')
            ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
            ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept')
            ->header('Access-Control-Expose-Headers', 'Authorization');
    }
}
