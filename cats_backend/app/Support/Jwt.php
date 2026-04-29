<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Firebase\JWT\JWT as FirebaseJwt;
use Firebase\JWT\Key;

class Jwt
{
    private const BLACKLIST_PREFIX = 'jwt:blacklist:';

    /** @return array<string, mixed> */
    public static function decode(string $token): array
    {
        $secret = (string) config('jwt.secret');
        $alg = (string) config('jwt.alg');

        $decoded = FirebaseJwt::decode($token, new Key($secret, $alg));

        return (array) $decoded;
    }

    public static function blacklist(string $jti, int $exp): void
    {
        $remaining = max(0, $exp - time());
        Cache::put(self::BLACKLIST_PREFIX . $jti, true, $remaining);
    }

    public static function isBlacklisted(string $jti): bool
    {
        return (bool) Cache::get(self::BLACKLIST_PREFIX . $jti, false);
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
            'jti' => (string) Str::uuid(),
            'sub' => $user->id,
            'role' => $user->role,
        ];

        return FirebaseJwt::encode($payload, $secret, $alg);
    }
}
