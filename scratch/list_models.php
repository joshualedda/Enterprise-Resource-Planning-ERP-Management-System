<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Http;

$apiKey = env('GEMINI_API_KEY');

try {
    echo "Listing models...\n";
    $response = Http::get("https://generativelanguage.googleapis.com/v1beta/models?key={$apiKey}");
    if ($response->successful()) {
        $models = $response->json();
        foreach ($models['models'] as $m) {
            echo "- " . $m['name'] . " (Supports: " . implode(', ', $m['supportedGenerationMethods']) . ")\n";
        }
    } else {
        echo "FAILED to list: " . $response->status() . " - " . $response->body() . "\n";
    }
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
