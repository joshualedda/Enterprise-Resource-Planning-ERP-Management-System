<?php

use App\Models\Product;
use App\Models\Order;
use App\Models\User;
use App\Http\Controllers\Admin\UsersController;
use App\Http\Controllers\StorefrontController;
use Illuminate\Http\Request;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/inventory', [InventoryController::class, 'index'])->name('inventory.index');

Route::post('/inventory/adjust', [InventoryController::class, 'adjust'])->name('inventory.adjust');


Route::post('/api/check-email', function (Request $request) {
    try {
        // I-check kung may email na pinadala
        $email = $request->input('email');
        
        if (!$email) {
            return response()->json(['exists' => false]);
        }

        // I-check sa database
        $exists = User::where('email', $email)->exists();

        return response()->json([
            'exists' => $exists
        ]);
    } catch (\Exception $e) {
        // Ito ay para makita mo ang error sa response kung sakaling mag-fail
        return response()->json(['error' => $e->getMessage()], 500);
    }
});

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'auth' => auth()->user() ? ['user' => auth()->user()] : null,
        'products' => \App\Models\Product::with('category')->latest()->take(8)->get(),
    ]);
})->name('home');

Route::get('/Welcome', function () {
    return Inertia::render('Welcome', [
        'auth' => auth()->user() ? ['user' => auth()->user()] : null,
        'products' => \App\Models\Product::with('category')->latest()->take(8)->get(),
    ]);
})->name('Welcome');



Route::get('/', [StorefrontController::class, 'index'])->name('storefront');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard', [
            'users' => \App\Models\User::all(), // Paalala: Sa production, dapat limited ito
            'products' => \App\Models\Product::all(),
            'orders' => \App\Models\Order::all(), // Idagdag ito para sa Customer/Staff
            'stats' => [
                'active_orders' => \App\Models\Order::where('status', 'active')->count(),
                'pending_tasks' => 5 // Sample static data
            ]
        ]);
    })->name('dashboard');
});


Route::get('/products', [App\Http\Controllers\ProductController::class, 'index'])->name('products.index');
Route::get('/products/{product}', [App\Http\Controllers\ProductController::class, 'show'])->name('products.show');
Route::post('/products', [App\Http\Controllers\ProductController::class, 'store'])->name('products.store');
Route::put('/products/{product}', [App\Http\Controllers\ProductController::class, 'update'])->name('products.update');
Route::delete('/products/{product}', [App\Http\Controllers\ProductController::class, 'destroy'])->name('products.destroy');

// Authenticated functional pages (placeholders)
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/tasks', function () { return Inertia::render('Tasks/Index'); })->name('tasks.index');
    Route::get('/admin/users', function () { return Inertia::render('Admin/Users'); })->name('admin.users');
    Route::get('/admin/reports', function () { return Inertia::render('Admin/Reports'); })->name('admin.reports');
});

Route::get('/orders', [OrderController::class, 'index'])->middleware(['auth', 'verified'])->name('orders.index');


//Route for product CRUD
Route::get('/orders', [OrderController::class, 'index'])->middleware(['auth', 'verified'])->name('orders.index');


Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

   
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/admin/users', [UsersController::class, 'index'])->name('admin.users.index');
    Route::post('/admin/users', [UsersController::class, 'store'])->name('admin.users.store');
    Route::put('/admin/users/{user}', [UsersController::class, 'update'])->name('admin.users.update');
    Route::delete('/admin/users/{user}', [UsersController::class, 'destroy'])->name('admin.users.destroy');
});

require __DIR__.'/auth.php';
