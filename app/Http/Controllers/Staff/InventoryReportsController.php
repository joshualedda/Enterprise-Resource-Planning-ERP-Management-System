<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\RawProduct;
use App\Models\RawProductStock;
use App\Models\RawProductCategory;
use App\Models\Warehouse;
use App\Models\RawProductBatch;
use Inertia\Inertia;
use App\Http\Controllers\Admin\ReportsController;
use Illuminate\Support\Facades\DB;

class InventoryReportsController extends Controller
{
    /**
     * Display the stock summary report.
     */
    public function stockSummary(Request $request)
    {
        $warehouseId = $request->warehouse_id;
        $categoryId = $request->category_id;
        $search = $request->search;

        // Base Query for Table
        $query = RawProductStock::with(['product.category', 'warehouse', 'batch'])
            ->whereHas('product', function ($q) use ($search, $categoryId) {
                if ($search) {
                    $q->where('name', 'like', '%' . $search . '%');
                }
                if ($categoryId) {
                    $q->where('category_id', $categoryId);
                }
            });

        if ($warehouseId) {
            $query->where('warehouse_id', $warehouseId);
        }

        // KPI Calculations (based on current filters for real-time overview)
        // Total Products (distinct products in stock)
        $totalProducts = (clone $query)->distinct('product_id')->count('product_id');

        // Total Quantity On Hand
        $totalQty = (clone $query)->sum('quantity_on_hand');

        // Low Stock Items (Qty <= reorder_level)
        $lowStockCount = (clone $query)->whereHas('product', function ($q) {
            $q->whereColumn('raw_product_stocks.quantity_on_hand', '<=', 'raw_products.reorder_level');
        })->count();

        // Total Inventory Value
        $totalValue = (clone $query)->join('raw_products', 'raw_product_stocks.product_id', '=', 'raw_products.id')
            ->sum(DB::raw('raw_product_stocks.quantity_on_hand * raw_products.cost_price'));

        // Chart 1: Stock by Category (Pie)
        $categoryChart = RawProductStock::join('raw_products', 'raw_product_stocks.product_id', '=', 'raw_products.id')
            ->join('raw_product_categories', 'raw_products.category_id', '=', 'raw_product_categories.id')
            ->select('raw_product_categories.name', DB::raw('SUM(raw_product_stocks.quantity_on_hand) as value'))
            ->groupBy('raw_product_categories.name')
            ->get();

        // Chart 2: Stock by Warehouse (Bar)
        $warehouseChart = RawProductStock::join('warehouses', 'raw_product_stocks.warehouse_id', '=', 'warehouses.id')
            ->select('warehouses.name', DB::raw('SUM(raw_product_stocks.quantity_on_hand) as value'))
            ->groupBy('warehouses.name')
            ->get();

        return Inertia::render('Staff/Inventory/StockSummaryReport', [
            'stocks' => $query->paginate(10)->withQueryString(),
            'kpis' => [
                'total_products' => $totalProducts,
                'total_qty' => $totalQty,
                'low_stock_count' => $lowStockCount,
                'total_value' => $totalValue,
            ],
            'charts' => [
                'category' => $categoryChart,
                'warehouse' => $warehouseChart,
            ],
            'warehouses' => Warehouse::all(),
            'categories' => RawProductCategory::all(),
            'filters' => $request->only(['search', 'warehouse_id', 'category_id']),
        ]);
    }

    /**
     * Display the stock movement report.
     */
    public function movementReport(Request $request)
    {
        $warehouseId = $request->warehouse_id;
        $movementType = $request->movement_type;
        $search = $request->search;
        $startDate = $request->start_date;
        $endDate = $request->end_date;

        $query = \App\Models\StockMovement::with(['product.category', 'warehouse', 'batch'])
            ->whereHas('product', function ($q) use ($search) {
                if ($search) {
                    $q->where('name', 'like', '%' . $search . '%');
                }
            });

        if ($warehouseId) $query->where('warehouse_id', $warehouseId);
        if ($movementType) $query->where('movement_type', $movementType);
        if ($startDate && $endDate) {
            $query->whereBetween('movement_date', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
        }

        // KPIs
        $totalMovements = (clone $query)->count();
        $totalQtyIn = (clone $query)->where('quantity', '>', 0)->sum('quantity');
        $totalQtyOut = (clone $query)->where('quantity', '<', 0)->sum('quantity');

        // Charts
        $typeChart = (clone $query)->select('movement_type as name', DB::raw('COUNT(*) as value'))
            ->groupBy('movement_type')
            ->get();

        $trendChart = (clone $query)->select(DB::raw('DATE(movement_date) as date'), DB::raw('SUM(quantity) as value'))
            ->groupBy('date')
            ->orderBy('date')
            ->limit(30)
            ->get();

        return Inertia::render('Staff/Inventory/MovementReport', [
            'movements' => $query->latest('movement_date')->paginate(15)->withQueryString(),
            'kpis' => [
                'total_movements' => $totalMovements,
                'total_in' => $totalQtyIn,
                'total_out' => abs($totalQtyOut),
                'net_change' => $totalQtyIn + $totalQtyOut,
            ],
            'charts' => [
                'types' => $typeChart,
                'trend' => $trendChart,
            ],
            'warehouses' => Warehouse::all(),
            'filters' => $request->only(['search', 'warehouse_id', 'movement_type', 'start_date', 'end_date']),
        ]);
    }

    /**
     * Display the low stock report.
     */
    public function lowStockReport(Request $request)
    {
        $warehouseId = $request->warehouse_id;
        $categoryId = $request->category_id;
        $search = $request->search;

        $query = RawProductStock::with(['product.category', 'warehouse', 'batch'])
            ->whereHas('product', function ($q) use ($search, $categoryId) {
                $q->whereColumn('raw_product_stocks.quantity_on_hand', '<=', 'raw_products.reorder_level');
                if ($search) $q->where('name', 'like', '%' . $search . '%');
                if ($categoryId) $q->where('category_id', $categoryId);
            });

        if ($warehouseId) $query->where('warehouse_id', $warehouseId);

        // KPIs
        $lowStockItems = (clone $query)->distinct('product_id')->count('product_id');
        $outOfStockItems = (clone $query)->where('quantity_on_hand', 0)->distinct('product_id')->count('product_id');
        $atRiskValue = (clone $query)->join('raw_products', 'raw_product_stocks.product_id', '=', 'raw_products.id')
            ->sum(DB::raw('raw_product_stocks.quantity_on_hand * raw_products.cost_price'));

        // Charts
        $warehouseChart = (clone $query)->join('warehouses', 'raw_product_stocks.warehouse_id', '=', 'warehouses.id')
            ->select('warehouses.name', DB::raw('COUNT(*) as value'))
            ->groupBy('warehouses.name')
            ->get();

        return Inertia::render('Staff/Inventory/LowStockReport', [
            'stocks' => $query->paginate(15)->withQueryString(),
            'kpis' => [
                'low_stock_count' => $lowStockItems,
                'out_of_stock_count' => $outOfStockItems,
                'at_risk_value' => $atRiskValue,
            ],
            'charts' => [
                'warehouses' => $warehouseChart,
            ],
            'warehouses' => Warehouse::all(),
            'categories' => RawProductCategory::all(),
            'filters' => $request->only(['search', 'warehouse_id', 'category_id']),
        ]);
    }

    /**
     * Display the expiry report.
     */
    public function expiryReport(Request $request)
    {
        $warehouseId = $request->warehouse_id;
        $search = $request->search;
        $status = $request->status; // 'expired', 'near_expiry', 'healthy'

        $query = RawProductBatch::with(['product.category', 'stocks.warehouse'])
            ->whereHas('product', function ($q) use ($search) {
                if ($search) $q->where('name', 'like', '%' . $search . '%');
            });

        $now = now();
        $nearExpiry = now()->addDays(30);

        if ($status === 'expired') {
            $query->where('expiry_date', '<', $now);
        } elseif ($status === 'near_expiry') {
            $query->whereBetween('expiry_date', [$now, $nearExpiry]);
        }

        // KPIs
        $expiredCount = (clone $query)->where('expiry_date', '<', $now)->count();
        $nearExpiryCount = (clone $query)->whereBetween('expiry_date', [now(), now()->addDays(30)])->count();

        // Chart: Expiry by Month
        $expiryChart = (clone $query)->whereNotNull('expiry_date')
            ->select(DB::raw("DATE_FORMAT(expiry_date, '%Y-%m') as month"), DB::raw('COUNT(*) as value'))
            ->groupBy('month')
            ->orderBy('month')
            ->limit(12)
            ->get();

        return Inertia::render('Staff/Inventory/ExpiryReport', [
            'batches' => $query->orderBy('expiry_date')->paginate(15)->withQueryString(),
            'kpis' => [
                'expired_count' => $expiredCount,
                'near_expiry_count' => $nearExpiryCount,
                'total_monitored' => (clone $query)->count(),
            ],
            'charts' => [
                'timeline' => $expiryChart,
            ],
            'warehouses' => Warehouse::all(),
            'filters' => $request->only(['search', 'warehouse_id', 'status']),
        ]);
    }

    public function index(Request $request)
    {
        $query = Order::with(['transaction', 'product', 'user']);
        
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
    }

    public function pdf(Request $request)
    {
        return app(ReportsController::class)->generatePDF($request);
    }

    public function excel(Request $request)
    {
        return app(ReportsController::class)->generateExcel($request);
    }
}
