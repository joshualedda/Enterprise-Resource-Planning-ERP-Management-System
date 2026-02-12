<?php

use App\Models\User;
use App\Http\Controllers\Admin\UsersController;
use Illuminate\Http\Request;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

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
    return Inertia::render('Storefront', [
        'auth' => auth()->user() ? ['user' => auth()->user()] : null,
        'products' => \App\Models\Product::with('category')->latest()->take(8)->get(),
    ]);
})->name('home');

Route::get('/storefront', function () {
    return Inertia::render('Storefront', [
        'auth' => auth()->user() ? ['user' => auth()->user()] : null,
        'products' => \App\Models\Product::with('category')->latest()->take(8)->get(),
    ]);
})->name('storefront');

// Dashboard route moved below to handle logic

Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Admin/Dashboard', [
            'users' => \App\Models\User::all(),
            'products' => \App\Models\Product::all(),
        ]);
    })->name('dashboard');
});

// Storefront / Public pages
// Storefront / Public pages
Route::get('/products', [App\Http\Controllers\ProductController::class, 'index'])->name('products.index');
Route::get('/products/{product}', [App\Http\Controllers\ProductController::class, 'show'])->name('products.show');
Route::post('/products', [App\Http\Controllers\ProductController::class, 'store'])->name('products.store');
Route::put('/products/{product}', [App\Http\Controllers\ProductController::class, 'update'])->name('products.update');
Route::delete('/products/{product}', [App\Http\Controllers\ProductController::class, 'destroy'])->name('products.destroy');

// Authenticated functional pages (placeholders)
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/inventory', function () { return Inertia::render('Inventory/Index'); })->name('inventory.index');
    Route::get('/tasks', function () { return Inertia::render('Tasks/Index'); })->name('tasks.index');
    Route::get('/admin/users', function () { return Inertia::render('Admin/Users'); })->name('admin.users');
    Route::get('/admin/reports', function () { return Inertia::render('Admin/Reports'); })->name('admin.reports');
});

Route::get('/orders', [OrderController::class, 'index'])->middleware(['auth', 'verified'])->name('orders.index');


//Route for product CRUD
Route::get('/orders', [OrderController::class, 'index'])->middleware(['auth', 'verified'])->name('orders.index');

















Route::get('/dashboard', function () {
    $user = auth()->user();
    
    // Redirect Admin to Admin Dashboard
    if ($user->role_id === \App\Models\Role::where('name', 'admin')->first()->id || $user->role === 'admin') { 
        // Note: checking both role_id and role for backward compatibility if needed, 
        // but ideally we rely on the relationship. 
        // Let's assume the Accessor/Mutator or direct relation is used.
        // For now, let's trust the role relationship or the checks we put in place.
        // Actually, the middleware checks $user->role->name. 
        // Let's use the relationship.
        if ($user->role && $user->role->name === 'admin') {
             return redirect()->route('admin.dashboard');
        }
    }

    $data = ['user' => $user];

    if ($user->role && $user->role->name === 'customer') {
        $data['orders'] = $user->orders()->with('orderItems.product')->get();
    } elseif ($user->role && $user->role->name === 'staff') {
        $data['products'] = \App\Models\Product::with('category')->get();
    }

    return Inertia::render('Dashboard', $data);
})->middleware(['auth', 'verified'])->name('dashboard');

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
