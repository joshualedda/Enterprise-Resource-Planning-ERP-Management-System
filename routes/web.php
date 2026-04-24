<?php

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Controllers
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\LandingPageController;
use App\Http\Controllers\RatingController;
use App\Http\Controllers\Customer\OrderController;
use App\Http\Controllers\Customer\UserDashboardController;
use App\Http\Controllers\Customer\CartController;
use App\Http\Controllers\Customer\ChatController;
use App\Http\Controllers\Staff\OrderManagementController;
use App\Http\Controllers\Staff\InventoryDashboardController;
use App\Http\Controllers\Staff\InventoryTasksController;
use App\Http\Controllers\Staff\InventoryReportsController;
use App\Http\Controllers\Staff\InventoryProductsController;
use App\Http\Controllers\Staff\InventoryCategoriesController;
use App\Http\Controllers\Staff\InventoryUnitsController;
use App\Http\Controllers\Staff\InventoryBatchesController;
use App\Http\Controllers\Staff\Inventory\InventorySuppliersController;
use App\Http\Controllers\Staff\Inventory\InventoryPurchaseOrdersController;
use App\Http\Controllers\Staff\Inventory\InventoryGoodsReceiptsController;
use App\Http\Controllers\Staff\InventoryWarehousesController;
use App\Http\Controllers\Staff\InventoryWarehouseLocationsController;
use App\Http\Controllers\Staff\InventoryProductStocksController;
use App\Http\Controllers\Staff\InventoryStockMovementsController;
use App\Http\Controllers\Staff\InventoryStockLevelsController;
use App\Http\Controllers\Staff\InventoryStockAdjustmentsController;
use App\Http\Controllers\Staff\Production\ProductionDashboardController;
use App\Http\Controllers\Staff\Production\ProductionTasksController;
use App\Http\Controllers\Staff\Production\ProductionReportsController;
use App\Http\Controllers\Staff\Production\ProductionOrdersController;
use App\Http\Controllers\Staff\Production\ProductionRunsController;
use App\Http\Controllers\Staff\Production\MaterialIssuesController;
use App\Http\Controllers\Staff\Production\OutputPostingController;
use App\Http\Controllers\Staff\Accounting\AccountingDashboardController;
use App\Http\Controllers\Staff\Accounting\AccountingTasksController;
use App\Http\Controllers\Staff\Accounting\AccountingReportsController;
use App\Http\Controllers\Staff\Accounting\ChartOfAccountController;
use App\Http\Controllers\Staff\Accounting\JournalEntryController;
use App\Http\Controllers\Staff\Accounting\CustomerPaymentController;
use App\Http\Controllers\Staff\Accounting\SupplierPaymentController;
use App\Http\Controllers\Staff\Accounting\TrialBalanceController;
use App\Http\Controllers\Staff\Accounting\ProfitAndLossController;
use App\Http\Controllers\Staff\Accounting\BalanceSheetController;
use App\Http\Controllers\Staff\Cashier\CashierDashboardController;
use App\Http\Controllers\Staff\Cashier\CashierTasksController;
use App\Http\Controllers\Staff\Cashier\CashierReportsController;
use App\Http\Controllers\Staff\Cashier\CashierCustomerController;
use App\Http\Controllers\Staff\Cashier\CashierPurchaseController;
use App\Http\Controllers\Staff\Cashier\CashierHeldOrderController;
use App\Http\Controllers\Staff\Cashier\CashierReturnRefundController;
use App\Http\Controllers\Staff\HumanResource\HRDashboardController;
use App\Http\Controllers\Staff\MarketingSales\MarketingSalesDashboardController;
use App\Http\Controllers\Staff\MarketingSales\MarketingSalesTasksController;
use App\Http\Controllers\Staff\MarketingSales\MarketingSalesReportsController;
use App\Http\Controllers\Staff\MarketingSales\MarketingCustomerController;
use App\Http\Controllers\Staff\MarketingSales\MarketingSalesListController;
use App\Http\Controllers\Customer\StorefrontController;
use App\Http\Controllers\Admin\UsersController;
use App\Http\Controllers\Admin\ReportsController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\InventoryController as AdminInventoryController;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllRead'])
    ->name('notifications.markAllRead');

Route::post('/chat', [ChatController::class, 'chat'])->name('chat');

Route::patch('/notifications/{id}/mark-read', [NotificationController::class, 'markAsRead'])
    ->name('notifications.markRead');

Route::get('/', [LandingPageController::class, 'front'])->name('storefront');
Route::get('/all-products', [LandingPageController::class, 'allProducts'])->name('products.all');

Route::post('/api/check-email', function (Request $request) {
    $exists = User::where('email', $request->input('email'))->exists();
    return response()->json(['exists' => $exists]);
});

/*
|--------------------------------------------------------------------------
| Auth Guard — Role-Based Dashboard Redirect
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->get('/dashboard', function () {
    $user = auth()->user();

    return match ((int) $user->role_id) {
        1 => redirect()->route('admin.dashboard'),
        3 => redirect()->route('products.all'),
        4 => redirect()->route('staff.inventory.dashboard'),
        5 => redirect()->route('staff.production.dashboard'),
        6 => redirect()->route('staff.accountingdashboard'),
        7 => redirect()->route('staff.cashierdashboard'),
        8 => redirect()->route('staff.marketing-salesdashboard'),
        default => redirect()->route('storefront'),
    };
})->name('dashboard');

/*
|--------------------------------------------------------------------------
| Shared — Profile & Tasks
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

    // ✅ Reject receipt — inside admin group, using AdminOrderController
    Route::post('/orders/{id}/reject-receipt', [AdminOrderController::class, 'rejectReceipt'])->name('orders.rejectReceipt');

    Route::get('/inventory', [AdminInventoryController::class, 'index'])->name('inventory.index');
    Route::get('/inventory/{product}', [AdminInventoryController::class, 'show'])->name('inventory.show');
    Route::post('/inventory/adjust', [AdminInventoryController::class, 'adjust'])->name('inventory.adjust');
    Route::delete('/inventory/log/{inventory}', [AdminInventoryController::class, 'destroy'])->name('inventory.log.destroy');
});

/*
|--------------------------------------------------------------------------
| Customer Routes — role_id = 3
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->prefix('customer')->name('customer.')->group(function () {
    Route::get('/dashboard', [UserDashboardController::class, 'index'])->name('dashboard');

    Route::patch('/orders/{transaction}/received', [OrderController::class, 'markReceived'])->name('orders.received');
    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
    Route::get('/api/orders/{id}/receipt', [OrderController::class, 'getReceipt'])->name('orders.receipt');
    Route::get('/checkout', [\App\Http\Controllers\Customer\CheckoutController::class, 'index'])->name('checkout.index');
    Route::post('/checkout', [\App\Http\Controllers\Customer\CheckoutController::class, 'store'])->name('checkout.store');
    Route::post('/checkout/place-order', [OrderController::class, 'placeOrder'])->name('checkout.place');
    Route::patch('/orders/{transaction}/cancel', [OrderController::class, 'cancelOrder'])->name('orders.cancel');

    Route::post('/ratings/bulk', [RatingController::class, 'bulkStore'])->name('ratings.bulk');

    Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
    Route::post('/cart/add', [CartController::class, 'add'])->name('cart.add');
    Route::patch('/cart/{productId}', [CartController::class, 'update'])->name('cart.update');
    Route::delete('/cart/{productId}', [CartController::class, 'remove'])->name('cart.remove');
    Route::post('/cart/clear', [CartController::class, 'clear'])->name('cart.clear');
    Route::get('/api/cart', [CartController::class, 'get'])->name('cart.get');

    Route::controller(ProfileController::class)->group(function () {
        Route::get('/profile', 'edit')->name('profile');
        Route::patch('/profile', 'update')->name('profile.update');
        Route::delete('/profile', 'destroy')->name('profile.destroy');
    });
});

/*
|--------------------------------------------------------------------------
| Staff — Inventory Department — role_id = 4
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->prefix('staff')->name('staff.')->group(function () {

    Route::prefix('inventory')->name('inventory.')->group(function () {
        Route::controller(InventoryDashboardController::class)->group(function () {
            Route::get('dashboard', 'index')->name('dashboard');
        });
        Route::controller(InventoryProductsController::class)->group(function () {
            Route::get('products', 'index')->name('products.index');
            Route::post('products', 'store')->name('products.store');
            Route::put('products/{product}', 'update')->name('products.update');
            Route::delete('products/{product}', 'destroy')->name('products.destroy');
        });
        Route::controller(InventoryCategoriesController::class)->group(function () {
            Route::get('categories', 'index')->name('categories.index');
            Route::post('categories', 'store')->name('categories.store');
            Route::put('categories/{category}', 'update')->name('categories.update');
            Route::delete('categories/{category}', 'destroy')->name('categories.destroy');
        });
        Route::controller(InventoryUnitsController::class)->group(function () {
            Route::get('units', 'index')->name('units.index');
            Route::post('units', 'store')->name('units.store');
            Route::put('units/{unit}', 'update')->name('units.update');
            Route::delete('units/{unit}', 'destroy')->name('units.destroy');
        });
        Route::controller(InventoryBatchesController::class)->group(function () {
            Route::get('batches', 'index')->name('batches.index');
            Route::post('batches', 'store')->name('batches.store');
            Route::put('batches/{batch}', 'update')->name('batches.update');
            Route::delete('batches/{batch}', 'destroy')->name('batches.destroy');
        });
        Route::controller(InventoryWarehousesController::class)->group(function () {
            Route::get('warehouses', 'index')->name('warehouses.index');
            Route::post('warehouses', 'store')->name('warehouses.store');
            Route::put('warehouses/{warehouse}', 'update')->name('warehouses.update');
            Route::delete('warehouses/{warehouse}', 'destroy')->name('warehouses.destroy');
        });
        Route::controller(InventoryWarehouseLocationsController::class)->group(function () {
            Route::get('warehouses-location', 'index')->name('warehouses-location.index');
            Route::post('warehouses-location', 'store')->name('warehouses-location.store');
            Route::put('warehouses-location/{location}', 'update')->name('warehouses-location.update');
            Route::delete('warehouses-location/{location}', 'destroy')->name('warehouses-location.destroy');
        });
        Route::controller(InventoryProductStocksController::class)->group(function () {
            Route::get('product-stocks', 'index')->name('product-stocks.index');
            Route::get('product-stocks/batches/{product}', 'getBatchesByProduct')->name('product-stocks.batches');
            Route::post('product-stocks', 'store')->name('product-stocks.store');
            Route::put('product-stocks/{stock}', 'update')->name('product-stocks.update');
            Route::delete('product-stocks/{stock}', 'destroy')->name('product-stocks.destroy');
        });
        Route::controller(InventoryStockMovementsController::class)->group(function () {
            Route::get('stock-movements', 'index')->name('stock-movements.index');
            Route::get('stock-movements/batches/{product}', 'getBatchesByProduct')->name('stock-movements.batches');
            Route::post('stock-movements', 'store')->name('stock-movements.store');
            Route::put('stock-movements/{movement}', 'update')->name('stock-movements.update');
            Route::delete('stock-movements/{movement}', 'destroy')->name('stock-movements.destroy');
        });
        Route::controller(InventoryStockLevelsController::class)->group(function () {
            Route::get('stock-levels', 'index')->name('stock-levels.index');
        });
        Route::controller(InventoryStockAdjustmentsController::class)->group(function () {
            Route::get('stock-adjustment', 'create')->name('stock-adjustments.create');
            Route::get('stock-adjustment-history', 'index')->name('stock-adjustments.index');
            Route::get('stock-adjustment/batches/{product}', 'getBatchesByProduct')->name('stock-adjustments.batches');
            Route::post('stock-adjustment', 'store')->name('stock-adjustments.store');
            Route::delete('stock-adjustment/{adjustment}', 'destroy')->name('stock-adjustments.destroy');
        });
        Route::controller(InventorySuppliersController::class)->group(function () {
            Route::get('suppliers', 'index')->name('suppliers.index');
            Route::post('suppliers', 'store')->name('suppliers.store');
            Route::put('suppliers/{supplier}', 'update')->name('suppliers.update');
            Route::delete('suppliers/{supplier}', 'destroy')->name('suppliers.destroy');
        });
        Route::controller(InventoryPurchaseOrdersController::class)->group(function () {
            Route::get('purchase-orders', 'index')->name('purchase-orders.index');
            Route::post('purchase-orders', 'store')->name('purchase-orders.store');
            Route::put('purchase-orders/{purchaseOrder}', 'update')->name('purchase-orders.update');
            Route::delete('purchase-orders/{purchaseOrder}', 'destroy')->name('purchase-orders.destroy');
        });
        Route::controller(InventoryGoodsReceiptsController::class)->group(function () {
            Route::get('goods-receipts', 'index')->name('goods-receipts.index');
            Route::post('goods-receipts', 'store')->name('goods-receipts.store');
            Route::put('goods-receipts/{goodsReceipt}', 'update')->name('goods-receipts.update');
            Route::delete('goods-receipts/{goodsReceipt}', 'destroy')->name('goods-receipts.destroy');
        });
        Route::controller(InventoryTasksController::class)->group(function () {
            Route::get('tasks', 'index')->name('tasks');
        });
        Route::controller(InventoryReportsController::class)->group(function () {
            Route::get('reports', 'index')->name('reports');
            Route::get('stock-summary-report', 'stockSummary')->name('reports.stock-summary');
            Route::get('movement-report', 'movementReport')->name('reports.movement');
            Route::get('low-stock-report', 'lowStockReport')->name('reports.low-stock');
            Route::get('expiry-report', 'expiryReport')->name('reports.expiry');
            Route::get('reports/pdf', 'pdf')->name('reports.pdf');
            Route::get('reports/excel', 'excel')->name('reports.excel');
        });
        Route::controller(ProfileController::class)->group(function () {
            Route::get('profile', 'edit')->name('profile');
            Route::patch('profile', 'update')->name('profile.update');
            Route::delete('profile', 'destroy')->name('profile.destroy');
        });
    });

    Route::controller(OrderManagementController::class)->group(function () {
        Route::get('orders', 'index')->name('orders.index');
        Route::patch('orders/{transaction}/update-status', 'updateStatus')->name('orders.update');
    });
});

/*
|--------------------------------------------------------------------------
| Staff — Production Department — role_id = 5
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->prefix('staff')->name('staff.')->group(function () {
    Route::prefix('production')->name('production.')->group(function () {
        Route::controller(ProductionDashboardController::class)->group(function () {
            Route::get('dashboard', 'index')->name('dashboard');
        });
        Route::controller(ProductionOrdersController::class)->group(function () {
            Route::get('production-orders', 'index')->name('production-orders.index');
            Route::post('production-orders', 'store')->name('production-orders.store');
            Route::put('production-orders/{order}', 'update')->name('production-orders.update');
            Route::delete('production-orders/{order}', 'destroy')->name('production-orders.destroy');
        });
        Route::controller(ProductionRunsController::class)->group(function () {
            Route::get('production-runs', 'index')->name('runs.index');
            Route::post('production-runs', 'store')->name('runs.store');
            Route::put('production-runs/{run}', 'update')->name('runs.update');
            Route::delete('production-runs/{run}', 'destroy')->name('runs.destroy');
        });
        Route::controller(MaterialIssuesController::class)->group(function () {
            Route::get('materials-issue', 'index')->name('material-issues.index');
            Route::post('materials-issue', 'store')->name('material-issues.store');
            Route::put('materials-issue/{materialIssue}', 'update')->name('material-issues.update');
            Route::delete('materials-issue/{materialIssue}', 'destroy')->name('material-issues.destroy');
        });
        Route::controller(OutputPostingController::class)->group(function () {
            Route::get('output-posting', 'index')->name('output-posting.index');
            Route::post('output-posting', 'store')->name('output-posting.store');
            Route::put('output-posting/{outputPosting}', 'update')->name('output-posting.update');
            Route::delete('output-posting/{outputPosting}', 'destroy')->name('output-posting.destroy');
        });
        Route::controller(ProductionTasksController::class)->group(function () {
            Route::get('tasks', 'index')->name('tasks');
        });
        Route::controller(ProductionReportsController::class)->group(function () {
            Route::get('reports', 'index')->name('reports');
            Route::get('reports/pdf', 'pdf')->name('reports.pdf');
            Route::get('reports/excel', 'excel')->name('reports.excel');
        });
        Route::controller(ProfileController::class)->group(function () {
            Route::get('profile', 'edit')->name('profile');
            Route::patch('profile', 'update')->name('profile.update');
            Route::delete('profile', 'destroy')->name('profile.destroy');
        });
    });
});

/*
|--------------------------------------------------------------------------
| Staff — Accounting — role_id = 6
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->prefix('staff')->name('staff.')->group(function () {
    Route::prefix('accounting')->name('accounting')->group(function () {
        Route::controller(AccountingDashboardController::class)->group(function () {
            Route::get('dashboard', 'index')->name('dashboard');
        });
        Route::controller(ChartOfAccountController::class)->group(function () {
            Route::get('chart-of-accounts', 'index')->name('.chart-of-accounts.index');
            Route::post('chart-of-accounts', 'store')->name('.chart-of-accounts.store');
            Route::put('chart-of-accounts/{id}', 'update')->name('.chart-of-accounts.update');
            Route::delete('chart-of-accounts/{id}', 'destroy')->name('.chart-of-accounts.destroy');
        });
        Route::controller(JournalEntryController::class)->group(function () {
            Route::get('journal-entries', 'index')->name('.journal-entries.index');
            Route::post('journal-entries', 'store')->name('.journal-entries.store');
            Route::put('journal-entries/{id}', 'update')->name('.journal-entries.update');
            Route::delete('journal-entries/{id}', 'destroy')->name('.journal-entries.destroy');
        });
        Route::controller(CustomerPaymentController::class)->group(function () {
            Route::get('customer-payments', 'index')->name('.customer-payments.index');
            Route::post('customer-payments', 'store')->name('.customer-payments.store');
            Route::put('customer-payments/{id}', 'update')->name('.customer-payments.update');
            Route::delete('customer-payments/{id}', 'destroy')->name('.customer-payments.destroy');
        });
        Route::controller(SupplierPaymentController::class)->group(function () {
            Route::get('supplier-payments', 'index')->name('.supplier-payments.index');
            Route::post('supplier-payments', 'store')->name('.supplier-payments.store');
            Route::put('supplier-payments/{id}', 'update')->name('.supplier-payments.update');
            Route::delete('supplier-payments/{id}', 'destroy')->name('.supplier-payments.destroy');
        });
        Route::controller(TrialBalanceController::class)->group(function () {
            Route::get('trial-balance', 'index')->name('.trial-balance.index');
        });
        Route::controller(ProfitAndLossController::class)->group(function () {
            Route::get('profit-and-loss', 'index')->name('.profit-and-loss.index');
        });
        Route::controller(BalanceSheetController::class)->group(function () {
            Route::get('balance-sheet', 'index')->name('.balance-sheet.index');
        });
        Route::controller(AccountingTasksController::class)->group(function () {
            Route::get('tasks', 'index')->name('tasks');
        });
        Route::controller(AccountingReportsController::class)->group(function () {
            Route::get('reports', 'index')->name('reports');
            Route::get('reports/pdf', 'pdf')->name('reports.pdf');
            Route::get('reports/excel', 'excel')->name('reports.excel');
        });
        Route::controller(ProfileController::class)->group(function () {
            Route::get('profile', 'edit')->name('profile');
            Route::patch('profile', 'update')->name('profile.update');
            Route::delete('profile', 'destroy')->name('profile.destroy');
        });
    });
});

/*
|--------------------------------------------------------------------------
| Staff — Cashier — role_id = 7
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->prefix('staff')->name('staff.')->group(function () {
    Route::prefix('cashier')->name('cashier')->group(function () {
        Route::controller(CashierDashboardController::class)->group(function () {
            Route::get('dashboard', 'index')->name('dashboard');
        });
        Route::controller(CashierTasksController::class)->group(function () {
            Route::get('tasks', 'index')->name('tasks');
        });
        Route::controller(CashierReportsController::class)->group(function () {
            Route::get('reports', 'index')->name('reports');
            Route::get('reports/pdf', 'pdf')->name('reports.pdf');
            Route::get('reports/excel', 'excel')->name('reports.excel');
        });
        Route::controller(CashierCustomerController::class)->group(function () {
            Route::get('customer-list', 'index')->name('.customer-list');
        });
        Route::controller(CashierPurchaseController::class)->group(function () {
            Route::get('customer-purchases', 'index')->name('.customer-purchases');
        });
        Route::prefix('pos')->name('.pos')->group(function () {
            Route::controller(CashierHeldOrderController::class)->group(function () {
                Route::get('held-orders', 'index')->name('.held-orders');
                Route::post('held-orders/{id}/resume', 'resume')->name('.held-orders.resume');
                Route::delete('held-orders/{id}', 'destroy')->name('.held-orders.cancel');
            });
            Route::controller(CashierReturnRefundController::class)->group(function () {
                Route::get('return-refund', 'index')->name('.return-refund');
                Route::post('return-refund/{id}/process', 'processReturn')->name('.return-refund.process');
            });
        });
        Route::controller(ProfileController::class)->group(function () {
            Route::get('profile', 'edit')->name('profile');
            Route::patch('profile', 'update')->name('profile.update');
            Route::delete('profile', 'destroy')->name('profile.destroy');
        });
    });
});

/*
|--------------------------------------------------------------------------
| Staff — Marketing & Sales — role_id = 8
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->prefix('staff')->name('staff.')->group(function () {
    Route::prefix('marketing-sales')->name('marketing-sales')->group(function () {
        Route::controller(MarketingSalesDashboardController::class)->group(function () {
            Route::get('dashboard', 'index')->name('dashboard');
        });
        Route::controller(MarketingSalesTasksController::class)->group(function () {
            Route::get('tasks', 'index')->name('tasks');
        });
        Route::controller(MarketingSalesReportsController::class)->group(function () {
            Route::get('reports', 'index')->name('reports');
            Route::get('reports/pdf', 'pdf')->name('reports.pdf');
            Route::get('reports/excel', 'excel')->name('reports.excel');
        });
        Route::controller(MarketingCustomerController::class)->group(function () {
            Route::get('customer-list', 'index')->name('.customer-list');
        });
        Route::controller(MarketingSalesListController::class)->group(function () {
            Route::get('sales-list', 'index')->name('.sales-list');
            Route::get('sales-list/pdf', 'pdf')->name('.sales-list.pdf');
            Route::get('sales-list/excel', 'excel')->name('.sales-list.excel');
        });
        Route::controller(ProfileController::class)->group(function () {
            Route::get('profile', 'edit')->name('profile');
            Route::patch('profile', 'update')->name('profile.update');
            Route::delete('profile', 'destroy')->name('profile.destroy');
        });
    });
});

use App\Http\Controllers\Staff\HumanResource\EmployeeController;
use App\Http\Controllers\Staff\HumanResource\EmployeeStatusController;

/*
|--------------------------------------------------------------------------
| Staff — Human Resource — role_id = 2
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->prefix('staff')->name('staff.')->group(function () {
    Route::prefix('hr')->name('hr.')->group(function () {
        Route::controller(HRDashboardController::class)->group(function () {
            Route::get('dashboard', 'index')->name('dashboard');
        });

        Route::controller(EmployeeController::class)->group(function () {
            Route::get('employees', 'index')->name('employees');
            Route::get('employees/create', 'create')->name('employees.create');
            Route::post('employees', 'store')->name('employees.store');
            Route::get('employees/{id}/edit', 'edit')->name('employees.edit');
            Route::post('employees/{id}', 'update')->name('employees.update'); // Using POST for FormData updates with files
            Route::delete('employees/{id}', 'destroy')->name('employees.destroy');
        });

        Route::controller(EmployeeStatusController::class)->group(function () {
            Route::get('emp-status', 'index')->name('emp-status');
            Route::post('emp-status', 'store')->name('emp-status.store');
            Route::put('emp-status/{id}', 'update')->name('emp-status.update');
            Route::delete('emp-status/{id}', 'destroy')->name('emp-status.destroy');
        });

        Route::controller(\App\Http\Controllers\Staff\HumanResource\CivilStatusController::class)->group(function () {
            Route::get('civil-status', 'index')->name('civil-status');
            Route::post('civil-status', 'store')->name('civil-status.store');
            Route::put('civil-status/{id}', 'update')->name('civil-status.update');
            Route::delete('civil-status/{id}', 'destroy')->name('civil-status.destroy');
        });

        Route::controller(\App\Http\Controllers\Staff\HumanResource\DepartmentController::class)->group(function () {
            Route::get('department', 'index')->name('department');
            Route::post('department', 'store')->name('department.store');
            Route::put('department/{id}', 'update')->name('department.update');
            Route::delete('department/{id}', 'destroy')->name('department.destroy');
        });

        Route::controller(\App\Http\Controllers\Staff\HumanResource\PositionController::class)->group(function () {
            Route::get('position', 'index')->name('position');
            Route::post('position', 'store')->name('position.store');
            Route::put('position/{id}', 'update')->name('position.update');
            Route::delete('position/{id}', 'destroy')->name('position.destroy');
        });

        Route::controller(ProfileController::class)->group(function () {
            Route::get('profile', 'edit')->name('profile');
            Route::patch('profile', 'update')->name('profile.update');
            Route::delete('profile', 'destroy')->name('profile.destroy');
        });

        Route::controller(\App\Http\Controllers\Staff\HumanResource\AccountController::class)->group(function () {
            Route::get('accounts', 'index')->name('accounts');
            Route::post('accounts', 'store')->name('accounts.store');
            Route::put('accounts/{id}', 'update')->name('accounts.update');
            Route::delete('accounts/{id}', 'destroy')->name('accounts.destroy');
        });
    });
});

require __DIR__.'/auth.php';