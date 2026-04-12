<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Http;

$apiKey = env('GEMINI_API_KEY');

try {
    echo "Final check: gemini-1.5-flash on v1beta...\n";
    $response = Http::post("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={$apiKey}", [
        'contents' => [['parts' => [['text' => 'Hello.']]]]
    ]);

    if ($response->successful()) {
        echo "SUCCESS: gemini-1.5-flash works!\n";
    } else {
        echo "FAILED: " . $response->status() . " - " . $response->body() . "\n";
    }
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
