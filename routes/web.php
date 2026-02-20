<?php

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Controllers
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\LandingPageController;
use App\Http\Controllers\RatingController;
use App\Http\Controllers\Customer\OrderController;
use App\Http\Controllers\Customer\StorefrontController;
use App\Http\Controllers\Staff\OrderManagementController;
use App\Http\Controllers\Admin\UsersController;
use App\Http\Controllers\Admin\ReportsController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::get('/', [LandingPageController::class, 'front'])->name('storefront');

Route::post('/api/check-email', function (Request $request) {
    $email = $request->input('email');
    $exists = User::where('email', $email)->exists();
    return response()->json(['exists' => $exists]);
});

/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->group(function () {

    // General Dashboard (for admin)
    // General Dashboard (for admin)
    Route::get('/dashboard', function () {
        return redirect()->route('dashboard');
    });
    Route::get('/admin/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // --- ADMIN ROUTES (Dito ang fix para sa admin.users.index) ---
    Route::prefix('admin')->name('admin.')->group(function () {
        Route::resource('/users', UsersController::class);
        Route::resource('/products', ProductController::class)->except(['create', 'edit']);
        Route::get('/reports', [ReportsController::class, 'index'])->name('reports');
        Route::get('/reports/pdf', [ReportsController::class, 'generatePDF'])->name('reports.pdf');
        Route::get('/reports/excel', [ReportsController::class, 'generateExcel'])->name('reports.excel');
        
        // Orders (Transactions)
        Route::resource('/orders', AdminOrderController::class)->only(['index', 'show', 'update']);
    });






    // --- STAFF / ORDER MANAGEMENT ---
    Route::get('/staff/orders', [OrderManagementController::class, 'index'])->name('staff.orders.index');
    Route::patch('/staff/orders/{transaction}/update-status', [OrderManagementController::class, 'updateStatus'])->name('staff.orders.update');

    // --- CUSTOMER ORDERS & RATINGS ---
    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
    Route::get('/api/orders/{id}/receipt', [OrderController::class, 'getReceipt']);
    Route::post('/checkout/place-order', [OrderController::class, 'placeOrder'])->name('checkout.place');
    Route::post('/ratings/bulk', [RatingController::class, 'bulkStore']);


    // --- INVENTORY & PRODUCTS ---
    Route::get('/inventory', [InventoryController::class, 'index'])->name('inventory.index');
    Route::post('/inventory/adjust', [InventoryController::class, 'adjust'])->name('inventory.adjust');



    // --- PROFILE ---
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // --- TASKS ---
    Route::get('/tasks', function () { 
        return Inertia::render('Tasks/Index'); 
    })->name('tasks.index');
});

require __DIR__.'/auth.php';