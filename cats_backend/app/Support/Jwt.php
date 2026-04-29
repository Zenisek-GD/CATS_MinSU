<?php

namespace App\Support;

use App\Models\User;
use Firebase\JWT\JWT as FirebaseJwt;
use Firebase\JWT\Key;

class Jwt
{
    /** @return array<string, mixed> */
    public static function decode(string $token): array
    {
        $secret = (string) config('jwt.secret');
        $alg = (string) config('jwt.alg');

        $decoded = FirebaseJwt::decode($token, new Key($secret, $alg));

        return (array) $decoded;
    }

    public static function issueForUser(User $user): string
    {
        $now = time();
        $ttlSeconds = (int) config('jwt.ttl_seconds');
        $secret = (string) config('jwt.secret');
        $alg = (string) config('jwt.alg');
        $issuer = (string) config('app.url');

        $payload = [
            'iss' => $issuer,
            'iat' => $now,
            'exp' => $now + $ttlSeconds,
            'sub' => $user->id,
            'role' => $user->role,
        ];

        return FirebaseJwt::encode($payload, $secret, $alg);
    }
}
