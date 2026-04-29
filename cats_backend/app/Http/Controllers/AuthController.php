<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Support\Jwt;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email', 'max:255'],
            'password' => ['required', 'string', 'min:8'],
            'name' => ['nullable', 'string', 'max:255'],
        ]);

        $request->validate([
            'email' => [Rule::unique('users', 'email')],
        ]);

        $user = User::query()->create([
            'name' => $validated['name'] ?? 'User',
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'user',
            'participant_code' => null,
        ]);

        return $this->tokenResponse($user);
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email', 'max:255'],
            'password' => ['required', 'string'],
        ]);

        $user = User::query()->where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json(['message' => 'Invalid credentials.'], 401);
        }

        return $this->tokenResponse($user);
    }

    public function logout(Request $request)
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
        $exp = $payload['exp'] ?? null;

        if (!is_string($jti) || !is_int($exp)) {
            return response()->json(['message' => 'Invalid token payload.'], 401);
        }

        Jwt::blacklist($jti, $exp);

        return response()->json(['message' => 'Logged out.']);
    }

    public function forgotPassword(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email', 'max:255'],
        ]);

        $status = Password::sendResetLink(['email' => $validated['email']]);

        // Avoid leaking whether the email exists.
        if ($status === Password::RESET_LINK_SENT) {
            return response()->json(['message' => __($status)]);
        }

        return response()->json(['message' => 'If that email exists, a reset link has been sent.']);
    }

    public function resetPassword(Request $request)
    {
        $validated = $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'string', 'email', 'max:255'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $status = Password::reset(
            [
                'email' => $validated['email'],
                'password' => $validated['password'],
                'password_confirmation' => $request->input('password_confirmation'),
                'token' => $validated['token'],
            ],
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();

                event(new PasswordReset($user));
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json(['message' => __($status)]);
        }

        return response()->json(['message' => __($status)], 400);
    }

    private function tokenResponse(User $user)
    {
        $ttlSeconds = (int) config('jwt.ttl_seconds');
        $token = Jwt::issueForUser($user);

        return response()->json([
            'token' => $token,
            'token_type' => 'Bearer',
            'expires_in' => $ttlSeconds,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'participant_code' => $user->participant_code,
            ],
        ]);
    }

}
