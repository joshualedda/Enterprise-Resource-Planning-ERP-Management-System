<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Models\User;
use App\Models\Region;
use App\Models\Province;
use App\Models\Municipality;
use App\Models\Barangay;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/check-email', function (Request $request) {
    $exists = User::where('email', $request->email)->exists();
    return response()->json(['exists' => $exists]);
});

Route::get('/regions', fn() => Region::where('id', '>', 0)->get());

Route::get('/regions/{id}/provinces', fn($id) => Province::where('region_id', $id)->get());
Route::get('/provinces/{id}/municipalities', fn($id) => Municipality::where('province_id', $id)->get());
Route::get('/municipalities/{id}/barangays', fn($id) => Barangay::where('municipality_id', $id)->get());