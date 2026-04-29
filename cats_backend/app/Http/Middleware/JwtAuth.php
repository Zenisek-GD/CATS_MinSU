<?php

namespace App\Http\Middleware;

use App\Models\User;
use App\Support\Jwt;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class JwtAuth
{
    /**
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $authHeader = $request->header('Authorization');

        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            return response()->json(['message' => 'Missing Bearer token.'], 401);
        }

        $token = trim(substr($authHeader, 7));

        try {
            $payload = Jwt::decode($token);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Invalid or expired token.'], 401);
        }

        $jti = $payload['jti'] ?? null;
        if (!$jti || !is_string($jti)) {
            return response()->json(['message' => 'Invalid token payload.'], 401);
        }

        if (Jwt::isBlacklisted($jti)) {
            return response()->json(['message' => 'Token has been revoked.'], 401);
        }

        $userId = $payload['sub'] ?? null;
        if (!$userId) {
            return response()->json(['message' => 'Invalid token payload.'], 401);
        }

        $user = User::query()->find($userId);
        if (!$user) {
            return response()->json(['message' => 'User not found.'], 401);
        }

        Auth::setUser($user);

        return $next($request);
    }
}
