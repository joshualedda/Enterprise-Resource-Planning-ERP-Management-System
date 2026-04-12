<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Http;

$apiKey = env('GEMINI_API_KEY');

try {
    $response = Http::get("https://generativelanguage.googleapis.com/v1beta/models?key={$apiKey}");
    if ($response->successful()) {
        $models = $response->json();
        foreach ($models['models'] as $m) {
            if (strpos($m['name'], 'flash') !== false) {
                echo "- " . $m['name'] . "\n";
            }
        }
    } else {
        echo "FAILED: " . $response->status() . " - " . $response->body() . "\n";
    }
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
