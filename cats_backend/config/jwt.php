<?php

return [
    'alg' => env('JWT_ALG', 'HS256'),

    'secret' => env('JWT_SECRET') ?: hash('sha256', (string) env('APP_KEY', '')),

    // Token lifetime in seconds.
    'ttl_seconds' => (int) env('JWT_TTL_SECONDS', 60 * 60 * 24),
];
