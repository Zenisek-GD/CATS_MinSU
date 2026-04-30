<?php

namespace App\Support;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CyberAwarenessAiCoach
{
    public static function enabled(): bool
    {
        return (bool) config('gemini.api_key');
    }

    /**
     * @param array<int, array{prompt:string,scenario:?string,selected:?string,correct:?string,explanation:?string}> $misses
     */
    public static function coachQuizMisses(?string $categorySlug, array $misses): ?array
    {
        if (!self::enabled() || count($misses) === 0) {
            return null;
        }

        $category = $categorySlug ?: 'general';

        $userPrompt = "Topic: {$category}\n\n";
        $userPrompt .= "The learner got these items wrong. Provide adaptive coaching within cybercrime awareness training only.\n";
        $userPrompt .= "For each item we include the question/scenario, what they chose, the correct answer, and a canonical explanation.\n\n";

        foreach ($misses as $i => $m) {
            $n = $i + 1;
            $userPrompt .= "Item {$n}:\n";
            $userPrompt .= "Question: {$m['prompt']}\n";
            if (!empty($m['scenario'])) {
                $userPrompt .= "Scenario: {$m['scenario']}\n";
            }
            if (!empty($m['selected'])) {
                $userPrompt .= "Learner chose: {$m['selected']}\n";
            }
            if (!empty($m['correct'])) {
                $userPrompt .= "Correct answer: {$m['correct']}\n";
            }
            if (!empty($m['explanation'])) {
                $userPrompt .= "Canonical explanation: {$m['explanation']}\n";
            }
            $userPrompt .= "\n";
        }

        $userPrompt .= "Return strict JSON only.";

        return self::requestJson($userPrompt);
    }

    public static function coachUnsafeSimulation(array $ctx): ?array
    {
        if (!self::enabled()) {
            return null;
        }

        $title = (string) ($ctx['simulation_title'] ?? 'Simulation');
        $step = (string) ($ctx['step_prompt'] ?? '');
        $choice = (string) ($ctx['choice_text'] ?? '');
        $explanation = (string) ($ctx['explanation'] ?? '');

        $userPrompt = "Simulation: {$title}\n\n";
        $userPrompt .= "The learner made an UNSAFE choice in a cyber awareness simulation.\n";
        $userPrompt .= "Prompt shown to learner:\n{$step}\n\n";
        $userPrompt .= "Learner chose: {$choice}\n\n";
        if ($explanation) {
            $userPrompt .= "Canonical explanation: {$explanation}\n\n";
        }
        $userPrompt .= "Return strict JSON only.";

        return self::requestJson($userPrompt);
    }

    /**
     * Provide positive reinforcement coaching when the learner makes a SAFE choice.
     */
    public static function coachSafeSimulation(array $ctx): ?array
    {
        if (!self::enabled()) {
            return null;
        }

        $title = (string) ($ctx['simulation_title'] ?? 'Simulation');
        $step = (string) ($ctx['step_prompt'] ?? '');
        $choice = (string) ($ctx['choice_text'] ?? '');
        $explanation = (string) ($ctx['explanation'] ?? '');

        $userPrompt = "Simulation: {$title}\n\n";
        $userPrompt .= "The learner made a SAFE and CORRECT choice in a cyber awareness simulation. Provide positive reinforcement.\n";
        $userPrompt .= "Prompt shown to learner:\n{$step}\n\n";
        $userPrompt .= "Learner chose: {$choice}\n\n";
        if ($explanation) {
            $userPrompt .= "Canonical explanation: {$explanation}\n\n";
        }
        $userPrompt .= "In the summary, praise the learner briefly.\n";
        $userPrompt .= "In red_flags, list indicators the learner correctly identified (max 5).\n";
        $userPrompt .= "In what_to_do_next, give one concrete next action to keep building their skills.\n";
        $userPrompt .= "Return strict JSON only.";

        return self::requestJson($userPrompt);
    }

    private static function requestJson(string $userPrompt): ?array
    {
        $model = (string) config('gemini.model');
        $baseUrl = rtrim((string) config('gemini.base_url'), '/');
        $timeout = (int) config('gemini.timeout_seconds');
        $apiKey = (string) config('gemini.api_key');
        $maxRetries = (int) config('gemini.max_retries', 1);

        if (!$apiKey) {
            return null;
        }

        // Ensure minimum sensible timeout
        if ($timeout < 10) {
            $timeout = 30;
        }

        $system = implode("\n", [
            "You are a cybercrime awareness training coach.",
            "ONLY provide defensive, safety-focused guidance for phishing awareness, account safety, privacy, and secure habits.",
            "Do NOT provide instructions, steps, code, or templates that facilitate wrongdoing (phishing templates, bypassing security, hacking, malware).",
            "If the content appears offensive or asks for wrongdoing: refuse and redirect to safe awareness advice.",
            "Output MUST be valid JSON only (no markdown), with keys:",
            "- summary: string (<= 2 sentences)",
            "- red_flags: array of strings (max 5)",
            "- what_to_do_next: string (one concrete next action)",
        ]);

        $payload = [
            'systemInstruction' => [
                'parts' => [
                    ['text' => $system],
                ],
            ],
            'contents' => [
                [
                    'role' => 'user',
                    'parts' => [
                        ['text' => $userPrompt],
                    ],
                ],
            ],
            'generationConfig' => [
                'temperature' => 0.3,
                'maxOutputTokens' => 512,
                'responseMimeType' => 'application/json',
                'responseSchema' => [
                    'type' => 'object',
                    'required' => ['summary', 'red_flags', 'what_to_do_next'],
                    'properties' => [
                        'summary' => ['type' => 'string'],
                        'red_flags' => [
                            'type' => 'array',
                            'items' => ['type' => 'string'],
                        ],
                        'what_to_do_next' => ['type' => 'string'],
                    ],
                ],
            ],
        ];

        // Use stable v1 endpoint
        $url = "{$baseUrl}/v1/models/{$model}:generateContent?key={$apiKey}";

        $lastError = null;

        for ($attempt = 0; $attempt <= $maxRetries; $attempt++) {
            try {
                // Add a short delay before retries (exponential backoff)
                if ($attempt > 0) {
                    usleep($attempt * 500_000); // 500ms, 1000ms, etc.
                    Log::info('Gemini retry attempt', [
                        'attempt' => $attempt + 1,
                        'max_retries' => $maxRetries + 1,
                    ]);
                }

                $resp = Http::timeout($timeout)
                    ->acceptJson()
                    ->asJson()
                    ->post($url, $payload);

                if (!$resp->ok()) {
                    $statusCode = $resp->status();
                    $bodySnippet = mb_substr((string) $resp->body(), 0, 500);

                    Log::warning('Gemini request failed', [
                        'status' => $statusCode,
                        'body' => $bodySnippet,
                        'attempt' => $attempt + 1,
                    ]);

                    // Retry only on transient server errors (5xx)
                    if ($statusCode >= 500 && $attempt < $maxRetries) {
                        $lastError = "HTTP {$statusCode}";
                        continue;
                    }

                    return null;
                }

                $blockReason = data_get($resp->json(), 'promptFeedback.blockReason');
                if (is_string($blockReason) && $blockReason !== '') {
                    Log::info('Gemini prompt blocked', [
                        'block_reason' => $blockReason,
                        'attempt' => $attempt + 1,
                    ]);
                    return null;
                }

                $content = data_get($resp->json(), 'candidates.0.content.parts.0.text');
                if (!is_string($content) || trim($content) === '') {
                    Log::warning('Gemini returned empty content', [
                        'response_keys' => array_keys($resp->json() ?? []),
                        'attempt' => $attempt + 1,
                    ]);

                    if ($attempt < $maxRetries) {
                        $lastError = 'empty content';
                        continue;
                    }
                    return null;
                }

                $decoded = self::decodeStrictJson($content);
                if ($decoded === null) {
                    Log::warning('Gemini returned invalid JSON', [
                        'raw_content' => mb_substr($content, 0, 300),
                        'attempt' => $attempt + 1,
                    ]);

                    if ($attempt < $maxRetries) {
                        $lastError = 'invalid JSON';
                        continue;
                    }
                    return null;
                }

                return $decoded;
            } catch (\Illuminate\Http\Client\ConnectionException $e) {
                Log::warning('Gemini connection timeout', [
                    'error' => $e->getMessage(),
                    'timeout_seconds' => $timeout,
                    'attempt' => $attempt + 1,
                ]);
                $lastError = $e->getMessage();

                if ($attempt < $maxRetries) {
                    continue;
                }
                return null;
            } catch (\Throwable $e) {
                Log::warning('Gemini request exception', [
                    'error' => $e->getMessage(),
                    'exception_class' => get_class($e),
                    'attempt' => $attempt + 1,
                ]);
                return null;
            }
        }

        if ($lastError) {
            Log::warning('Gemini all retries exhausted', [
                'last_error' => $lastError,
                'total_attempts' => $maxRetries + 1,
            ]);
        }

        return null;
    }

    private static function decodeStrictJson(string $content): ?array
    {
        $text = trim($content);

        // Strip common markdown fences if any slip through.
        $text = preg_replace('/^```(json)?\s*/i', '', $text);
        $text = preg_replace('/\s*```$/', '', $text);
        $text = trim($text);

        $decoded = json_decode($text, true);
        if (!is_array($decoded)) {
            return null;
        }

        $summary = $decoded['summary'] ?? null;
        $redFlags = $decoded['red_flags'] ?? null;
        $next = $decoded['what_to_do_next'] ?? null;

        if (!is_string($summary) || !is_array($redFlags) || !is_string($next)) {
            return null;
        }

        $redFlags = array_values(array_filter($redFlags, fn($v) => is_string($v) && trim($v) !== ''));

        return [
            'summary' => trim($summary),
            'red_flags' => array_slice($redFlags, 0, 5),
            'what_to_do_next' => trim($next),
        ];
    }
}
