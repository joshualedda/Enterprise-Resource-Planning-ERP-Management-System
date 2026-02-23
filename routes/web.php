<?php

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Controllers
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\LandingPageController;
use App\Http\Controllers\RatingController;
use App\Http\Controllers\Customer\OrderController;
use App\Http\Controllers\Customer\UserDashboardController;
use App\Http\Controllers\Customer\CartController;
use App\Http\Controllers\Staff\OrderManagementController;
use App\Http\Controllers\Admin\UsersController;
use App\Http\Controllers\Admin\ReportsController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\InventoryController as AdminInventoryController;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::get('/', [LandingPageController::class, 'front'])->name('storefront');

Route::post('/api/check-email', function (Request $request) {
    $exists = User::where('email', $request->input('email'))->exists();
    return response()->json(['exists' => $exists]);
});

/*
|--------------------------------------------------------------------------
| Auth Guard — Role-Based Dashboard Redirect
| /dashboard → redirects based on role_id
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->get('/dashboard', function () {
    $user = auth()->user();

    return match ((int) $user->role_id) {
        1 => redirect()->route('admin.dashboard'),
        3 => redirect()->route('customer.dashboard'),
        4 => redirect()->route('staff.inventory.dashboard'),
        default => redirect()->route('storefront'),
    };
})->name('dashboard');

/*
|--------------------------------------------------------------------------
| Shared — Profile & Tasks (all authenticated users)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('/tasks', fn() => Inertia::render('Tasks/Index'))->name('tasks.index');
});

/*
|--------------------------------------------------------------------------
| Admin Routes — role_id = 1
| Prefix: /admin/...
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('/users', UsersController::class);
    Route::resource('/products', ProductController::class)->except(['create', 'edit']);

    Route::get('/reports', [ReportsController::class, 'index'])->name('reports');
    Route::get('/reports/pdf', [ReportsController::class, 'generatePDF'])->name('reports.pdf');
    Route::get('/reports/excel', [ReportsController::class, 'generateExcel'])->name('reports.excel');

    Route::resource('/orders', AdminOrderController::class)->only(['index', 'show', 'update']);

    Route::get('/inventory', [AdminInventoryController::class, 'index'])->name('inventory.index');
    Route::get('/inventory/{product}', [AdminInventoryController::class, 'show'])->name('inventory.show');
    Route::post('/inventory/adjust', [AdminInventoryController::class, 'adjust'])->name('inventory.adjust');
    Route::delete('/inventory/log/{inventory}', [AdminInventoryController::class, 'destroy'])->name('inventory.log.destroy');
});

/*
|--------------------------------------------------------------------------
| Customer / User Routes — role_id = 3
| Prefix: /customer/...
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->prefix('customer')->name('customer.')->group(function () {
    Route::get('/dashboard', [UserDashboardController::class, 'index'])->name('dashboard');

    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
    Route::get('/api/orders/{id}/receipt', [OrderController::class, 'getReceipt'])->name('orders.receipt');
    Route::post('/checkout/place-order', [OrderController::class, 'placeOrder'])->name('checkout.place');

    Route::post('/ratings/bulk', [RatingController::class, 'bulkStore'])->name('ratings.bulk');

    Route::get('/products', [CartController::class, 'index'])->name('products');
    Route::post('/cart/add', [CartController::class, 'add'])->name('cart.add');
    Route::patch('/cart/{productId}', [CartController::class, 'update'])->name('cart.update');
    Route::delete('/cart/{productId}', [CartController::class, 'remove'])->name('cart.remove');
    Route::post('/cart/clear', [CartController::class, 'clear'])->name('cart.clear');
    Route::get('/api/cart', [CartController::class, 'get'])->name('cart.get');
});

/*
|--------------------------------------------------------------------------
| Staff — Inventory Department Routes — role_id = 4
| Prefix: /staff/inventory/...
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->prefix('staff')->name('staff.')->group(function () {

    // Inventory Department
    Route::prefix('inventory')->name('inventory.')->group(function () {
        Route::get('/dashboard', fn() => Inertia::render('Staff/Inventory/Dashboard', [
            'products' => \App\Models\Product::with('category')->get(),
        ]))->name('dashboard');

        Route::get('/tasks', fn() => Inertia::render('Staff/Inventory/Tasks'))->name('tasks');

        Route::get('/reports', function (\Illuminate\Http\Request $request) {
            $query = \App\Models\Order::with(['transaction', 'product', 'user']);
            if ($request->search) {
                $query->where(function($q) use ($request) {
                    $q->whereHas('transaction', fn($t) => $t->where('reference_no', 'like', "%{$request->search}%"))
                      ->orWhereHas('product', fn($p) => $p->where('product', 'like', "%{$request->search}%"));
                });
            }
            if ($request->start_date && $request->end_date) {
                $query->whereBetween('created_at', [$request->start_date . ' 00:00:00', $request->end_date . ' 23:59:59']);
            }
            return Inertia::render('Staff/Inventory/Reports', [
                'orders'  => $query->latest()->paginate(10)->withQueryString(),
                'filters' => $request->only(['search', 'start_date', 'end_date']),
            ]);
        })->name('reports');
        Route::get('/reports/pdf', [ReportsController::class, 'generatePDF'])->name('reports.pdf');
        Route::get('/reports/excel', [ReportsController::class, 'generateExcel'])->name('reports.excel');

        Route::get('/profile', function (\Illuminate\Http\Request $request) {
            return Inertia::render('Staff/Inventory/Profile', [
                'mustVerifyEmail' => $request->user() instanceof \Illuminate\Contracts\Auth\MustVerifyEmail,
                'status'          => session('status'),
            ]);
        })->name('profile');
        Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    });

    // Order Management → staff.orders.index / staff.orders.update
    Route::get('/orders', [OrderManagementController::class, 'index'])->name('orders.index');
    Route::patch('/orders/{transaction}/update-status', [OrderManagementController::class, 'updateStatus'])->name('orders.update');
});

require __DIR__.'/auth.php';