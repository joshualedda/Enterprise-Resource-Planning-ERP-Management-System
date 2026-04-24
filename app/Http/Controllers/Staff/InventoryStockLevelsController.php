<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\RawProductStock;
use App\Models\Warehouse;
use App\Models\RawProductCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class InventoryStockLevelsController extends Controller
{
    public function index(Request $request)
    {
        $query = RawProductStock::with(['product.category', 'warehouse', 'batch']);

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('product', function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%');
            })->orWhereHas('warehouse', function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%');
            })->orWhereHas('batch', function ($q) use ($search) {
                $q->where('batch_code', 'like', '%' . $search . '%');
            });
        }

        // Filters
        if ($request->filled('warehouse') && $request->warehouse !== 'All') {
            $query->whereHas('warehouse', function ($q) use ($request) {
                $q->where('name', $request->warehouse);
            });
        }
        if ($request->filled('category') && $request->category !== 'All') {
            $query->whereHas('product.category', function ($q) use ($request) {
                $q->where('name', $request->category);
            });
        }

        $stocks = $query->paginate(20)->withQueryString();

        // Stats
        $stats = [
            'total_sku' => RawProductStock::distinct('product_id')->count('product_id'),
            'total_on_hand' => RawProductStock::sum('quantity_on_hand'),
            'total_reserved' => RawProductStock::sum('quantity_reserved'),
            'out_of_stock' => RawProductStock::where('quantity_on_hand', 0)->count(),
            'low_stock' => RawProductStock::whereHas('product', function ($q) {
                $q->whereColumn('quantity_on_hand', '<=', 'reorder_level');
            })->count(),
            'warehouses' => Warehouse::count(),
        ];

        return Inertia::render('Staff/Inventory/StockLevels', [
            'stocks' => $stocks,
            'stats' => $stats,
            'warehouses' => Warehouse::orderBy('name')->pluck('name')->prepend('All'),
            'categories' => RawProductCategory::orderBy('name')->pluck('name')->prepend('All'),
            'filters' => $request->only(['search', 'warehouse', 'category']),
        ]);
    }
}
