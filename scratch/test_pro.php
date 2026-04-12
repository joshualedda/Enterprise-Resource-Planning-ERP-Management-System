<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Http;

$apiKey = env('GEMINI_API_KEY');

try {
    echo "Testing gemini-pro on v1beta...\n";
    $response = Http::post("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={$apiKey}", [
        'contents' => [['parts' => [['text' => 'Hello, say test.']]]]
    ]);

    if ($response->successful()) {
        echo "SUCCESS (pro): " . json_encode($response->json(), JSON_PRETTY_PRINT) . "\n";
    } else {
        echo "FAILED (pro): " . $response->status() . " - " . $response->body() . "\n";
    }
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
