<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

$tables = collect(DB::select('show tables'))->map(fn($t) => array_values((array)$t)[0])->toArray();

echo "Tables matching region/prov/muni/bar:\n";
foreach($tables as $table) {
    if (str_contains(strtolower($table), 'reg') || str_contains(strtolower($table), 'prov') || str_contains(strtolower($table), 'mun') || str_contains(strtolower($table), 'bar') || str_contains(strtolower($table), 'city')) {
        echo "- $table\n";
        print_r(Schema::getColumnListing($table));
    }
}
