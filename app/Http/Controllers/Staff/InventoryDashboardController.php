<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\RawProduct;
use App\Models\RawProductStock;
use App\Models\RawProductBatch;
use App\Models\Warehouse;
use App\Models\StockMovement;
use App\Models\RawProductCategory;
use Carbon\Carbon;

class InventoryDashboardController extends Controller
{
    public function index()
    {
        $now = now();
        $thirtyDaysFromNow = $now->copy()->addDays(30);
        $sevenDaysAgo = $now->copy()->subDays(6)->startOfDay();

        // 1. Stats
        $totalProducts = RawProduct::where('is_active', true)->count();
        $totalWarehouses = Warehouse::count();

        // Product stock aggregated
        $productsWithStock = RawProduct::with(['category', 'unit'])->get()->map(function ($product) {
            $totalStock = RawProductStock::where('product_id', $product->id)->sum('quantity_on_hand');
            $product->total_stock = (float)$totalStock;
            return $product;
        });

        // We count low stock only if > 0 but <= reorder_level
        $lowStockCount = $productsWithStock->where('total_stock', '>', 0)->where('total_stock', '<=', fn($p) => $p->reorder_level)->count();
        $outOfStockCount = $productsWithStock->where('total_stock', '<=', 0)->count();

        // 2. Low Stock Table lists distinct warehouse stock lines that are below product.reorder_level and > 0 (or include 0, let's include all <= reorder)
        $lowStockQuery = RawProductStock::with(['product.category', 'warehouse'])
            ->get()
            ->filter(function ($stock) {
                // If a product's reorder level is set, compare it. Include true out-of-stocks too.
                $reorder = $stock->product->reorder_level ?? 0;
                return $stock->quantity_on_hand <= $reorder;
            })
            ->map(function ($stock) {
                return [
                    'id' => $stock->id,
                    'product' => $stock->product->name,
                    'category' => $stock->product->category->name ?? 'Uncategorized',
                    'warehouse' => $stock->warehouse->name ?? 'Unknown',
                    'stock' => (float)$stock->quantity_on_hand,
                    'reorder' => (int)($stock->product->reorder_level ?? 0),
                ];
            })->values();

        // 3. Expiring soon
        $expiringBatches = RawProductStock::with(['product', 'batch', 'warehouse'])
            ->whereHas('batch', function($q) use ($now, $thirtyDaysFromNow) {
                $q->whereNotNull('expiry_date')
                  ->where('expiry_date', '>=', $now)
                  ->where('expiry_date', '<=', $thirtyDaysFromNow);
            })
            ->where('quantity_on_hand', '>', 0)
            ->get()
            ->map(function ($stock) use ($now) {
                $expiry = Carbon::parse($stock->batch->expiry_date);
                $days = max(0, $now->diffInDays($expiry, false));
                return [
                    'id' => $stock->id,
                    'product' => $stock->product->name,
                    'batch' => $stock->batch->batch_code,
                    'warehouse' => $stock->warehouse->name ?? 'Unknown',
                    'expiry' => $expiry->format('Y-m-d'),
                    'days' => (int)$days,
                    'qty' => (float)$stock->quantity_on_hand,
                ];
            })->sortBy('days')->values();
        
        $expiringSoonCount = $expiringBatches->count();

        // 4. Warehouses summary
        $warehousesList = Warehouse::get()->map(function ($warehouse) {
            $stocks = RawProductStock::with('product')->where('warehouse_id', $warehouse->id)->get();
            $itemsCount = $stocks->pluck('product_id')->unique()->count();
            $totalQty = $stocks->sum('quantity_on_hand');
            $totalValue = $stocks->sum(function ($stock) {
                return $stock->quantity_on_hand * ($stock->product->cost_price ?? 0);
            });
            return [
                'name' => $warehouse->name,
                'items' => $itemsCount,
                'qty' => (float)$totalQty,
                'value' => (float)$totalValue
            ];
        });
        
        $totalSystemValue = $warehousesList->sum('value');

        // 5. Category Donut Chart
        $colors = ['#7c3aed', '#f59e0b', '#10b981', '#3b82f6', '#94a3b8', '#ef4444', '#ec4899', '#14b8a6'];
        
        $allStocks = RawProductStock::with('product.category')->get();
        $groupedByCategory = $allStocks->groupBy(function($stock) {
            return $stock->product->category->name ?? 'Uncategorized';
        });

        $totalCatValue = 0;
        $categorySums = $groupedByCategory->map(function($stocks, $catName) use (&$totalCatValue) {
            $stocksCol = collect($stocks);
            $sum = $stocksCol->sum(function($s) { return $s->quantity_on_hand * ($s->product->cost_price ?? 0); });
            $totalCatValue += $sum;
            return ['label' => $catName, 'value' => $sum];
        })->values();

        $categoryData = $categorySums->map(function($item, $index) use ($totalCatValue, $colors) {
            $itemArr = (array) $item;
            $pct = $totalCatValue > 0 ? round(($itemArr['value'] / $totalCatValue) * 100) : 0;
            return [
                'label' => $itemArr['label'],
                'value' => $pct,
                'color' => $colors[$index % count($colors)]
            ];
        })->filter(function($i) { return ((array)$i)['value'] > 0; })->values();
        
        if ($categoryData->isEmpty()) {
            $categoryData = collect([['label' => 'No Data', 'value' => 100, 'color' => '#f1f5f9']]);
        }

        // 6. MOVEMENT_DATA (Bar Chart)
        $movementDataRaw = StockMovement::where('movement_date', '>=', $sevenDaysAgo)->get();
        $movementData = [];
        for ($i = 0; $i < 7; $i++) {
            $day = $sevenDaysAgo->copy()->addDays($i);
            $dayKey = $day->format('Y-m-d');
            $dayStr = $day->format('D'); // Mon, Tue
            
            $dayMoves = $movementDataRaw->filter(function($m) use ($dayKey) {
                return Carbon::parse($m->movement_date)->format('Y-m-d') === $dayKey;
            });
            
            $movementData[] = [
                'day' => $dayStr,
                'purchase' => (float)$dayMoves->where('movement_type', 'purchase')->sum('quantity'),
                'prodIn' => (float)$dayMoves->whereIn('movement_type', ['return', 'transfer_in'])->sum('quantity'),
                'sales' => (float)$dayMoves->where('movement_type', 'sale')->sum('quantity'),
                'prodOut' => (float)$dayMoves->whereIn('movement_type', ['production_use', 'transfer_out'])->sum('quantity'),
                'adjust' => (float)$dayMoves->where('movement_type', 'adjustment')->sum('quantity'),
            ];
        }

        // 7. Recent Activity
        $recentActivity = StockMovement::with(['product', 'warehouse'])->latest('movement_date')->take(5)->get()->map(function($m) {
            $icons = [
                'purchase' => '📥',
                'sale' => '📦',
                'transfer_in' => '🚚',
                'transfer_out' => '📤',
                'adjustment' => '🔧',
                'production_use' => '🏭',
                'return' => '↩️'
            ];
            $icon = $icons[$m->movement_type] ?? '📋';
            $text = ucwords(str_replace('_', ' ', $m->movement_type));
            $detail = "{$m->quantity} units of " . ($m->product->name ?? 'Unknown');
            if ($m->notes) {
                $detail .= " — {$m->notes}";
            }
            return [
                'icon' => $icon,
                'text' => $text,
                'detail' => $detail,
                'time' => Carbon::parse($m->movement_date)->diffForHumans(null, true, true) . ' ago'
            ];
        });

        // 8. Reservations
        $reservations = collect();
        $stocksWithRes = RawProductStock::with(['product'])->where('quantity_reserved', '>', 0)->get();
        foreach ($stocksWithRes as $stock) {
            $reservations->push([
                'product' => $stock->product->name ?? 'Unknown',
                'reserved' => (float)$stock->quantity_reserved,
                'order' => 'SYS-HOLD',
                'expiry' => 'N/A'
            ]);
        }

        return Inertia::render('Staff/Inventory/Dashboard', [
            'stats' => [
                'total_products' => $totalProducts,
                'warehouses' => $totalWarehouses,
                'low_stock' => $lowStockCount,
                'out_of_stock' => $outOfStockCount,
                'expiring_soon' => $expiringSoonCount,
                'total_value' => $totalSystemValue,
            ],
            'lowStock' => $lowStockQuery,
            'expiring' => $expiringBatches,
            'warehouses' => $warehousesList,
            'reservations' => $reservations,
            'categoryData' => $categoryData,
            'movementData' => $movementData,
            'recentActivity' => $recentActivity,
        ]);
    }
}
