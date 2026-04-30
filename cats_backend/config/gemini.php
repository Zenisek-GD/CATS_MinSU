<?php

return [
    'api_key' => env('GEMINI_API_KEY'),
    // Example models: gemini-2.0-flash, gemini-2.5-flash, gemini-3-flash-preview
    'model' => env('GEMINI_MODEL', 'gemini-2.0-flash'),
    'base_url' => env('GEMINI_BASE_URL', 'https://generativelanguage.googleapis.com'),
    'timeout_seconds' => (int) env('GEMINI_TIMEOUT_SECONDS', 30),
    'max_retries' => (int) env('GEMINI_MAX_RETRIES', 1),
];
