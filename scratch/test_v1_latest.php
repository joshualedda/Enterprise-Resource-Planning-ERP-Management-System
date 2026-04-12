<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Http;

$apiKey = env('GEMINI_API_KEY');

try {
    echo "Testing gemini-flash-latest on v1...\n";
    $response = Http::post("https://generativelanguage.googleapis.com/v1/models/gemini-flash-latest:generateContent?key={$apiKey}", [
        'contents' => [['parts' => [['text' => 'Hello, say test.']]]]
    ]);

    if ($response->successful()) {
        echo "SUCCESS (latest): " . json_encode($response->json(), JSON_PRETTY_PRINT) . "\n";
    } else {
        echo "FAILED (latest): " . $response->status() . " - " . $response->body() . "\n";
    }
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
