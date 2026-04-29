<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Support\Jwt;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'participant_code' => ['nullable', 'string', 'max:100', 'required_without:email', 'prohibits:email,password'],
            'email' => ['nullable', 'string', 'email', 'max:255', 'required_without:participant_code', 'prohibits:participant_code'],
            'password' => ['nullable', 'string', 'min:8', 'required_with:email'],
            'name' => ['nullable', 'string', 'max:255'],
        ]);

        if (!empty($validated['participant_code'])) {
            $participantCode = $validated['participant_code'];

            if (User::query()->where('participant_code', $participantCode)->exists()) {
                return response()->json([
                    'message' => 'Participant already registered.',
                ], 409);
            }

            $user = User::query()->create([
                'name' => $validated['name'] ?? ('Participant ' . $participantCode),
                'email' => $this->participantEmailFromCode($participantCode),
                'password' => Hash::make(Str::random(32)),
                'role' => 'participant',
                'participant_code' => $participantCode,
            ]);

            return $this->tokenResponse($user);
        }

        $email = $validated['email'];

        $request->validate([
            'email' => ['required', Rule::unique('users', 'email')],
        ]);

        $user = User::query()->create([
            'name' => $validated['name'] ?? 'Admin',
            'email' => $email,
            'password' => Hash::make($validated['password']),
            'role' => 'admin',
            'participant_code' => null,
        ]);

        return $this->tokenResponse($user);
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'participant_code' => ['nullable', 'string', 'max:100', 'required_without:email', 'prohibits:email,password'],
            'email' => ['nullable', 'string', 'email', 'max:255', 'required_without:participant_code', 'prohibits:participant_code'],
            'password' => ['nullable', 'string', 'required_with:email'],
        ]);

        if (!empty($validated['participant_code'])) {
            $user = User::query()
                ->where('participant_code', $validated['participant_code'])
                ->where('role', 'participant')
                ->first();

            if (!$user) {
                return response()->json(['message' => 'Invalid participant code.'], 401);
            }

            return $this->tokenResponse($user);
        }

        $user = User::query()
            ->where('email', $validated['email'])
            ->where('role', 'admin')
            ->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json(['message' => 'Invalid credentials.'], 401);
        }

        return $this->tokenResponse($user);
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

    private function participantEmailFromCode(string $participantCode): string
    {
        $safe = Str::of($participantCode)->lower()->replaceMatches('/[^a-z0-9_\-]/', '_');

        return 'participant_' . $safe . '@participants.local';
    }
}
