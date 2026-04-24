<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $now   = Carbon::now();
        $today = $now->copy()->startOfDay();

        // ── KPI STATS ─────────────────────────────────────────────────────────
        $revenueToday = Transaction::whereDate('created_at', $now->toDateString())
            ->whereNotIn('status', ['Cancelled'])
            ->sum('total_amount');

        $ordersToday = Transaction::whereDate('created_at', $now->toDateString())
            ->count();

        $pendingOrders = Transaction::where('status', 'Pending')->count();

        $forShipping = Transaction::where('status', 'On Delivery')
            ->orWhere('status', 'Ready to Pickup')
            ->count();

        $newCustomers = User::where('role_id', 3)
            ->where('created_at', '>=', Carbon::now()->subDays(7)->startOfDay())
            ->count();

        $totalOrdersCount = Transaction::whereNotIn('status', ['Cancelled'])->count();
        $aov = $totalOrdersCount > 0
            ? Transaction::whereNotIn('status', ['Cancelled'])->avg('total_amount')
            : 0;

        // ── REVENUE TREND — last 7 days ───────────────────────────────────────
        $revenueTrend = collect(range(6, 0))->map(function ($daysAgo) {
            $date = Carbon::now()->subDays($daysAgo);
            $revenue = Transaction::whereDate('created_at', $date->toDateString())
                ->whereNotIn('status', ['Cancelled'])
                ->sum('total_amount');
            $orders = Transaction::whereDate('created_at', $date->toDateString())
                ->count();
            return [
                'date'    => $date->format('M d'),
                'revenue' => (float) $revenue,
                'orders'  => (int) $orders,
            ];
        })->values();

        // ── ORDERS BY STATUS ─────────────────────────────────────────────────
        $statusCounts = Transaction::select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status');

        $statusColorMap = [
            'Pending'          => '#f59e0b',
            'In Process'       => '#3b82f6',
            'Ready to Pickup'  => '#8b5cf6',
            'On Delivery'      => '#06b6d4',
            'Product Received' => '#10b981',
            'Cancelled'        => '#f43f5e',    
        ];

        $statusData = collect($statusColorMap)->map(function ($color, $status) use ($statusCounts) {
            return [
                'label' => $status,
                'value' => (int) ($statusCounts[$status] ?? 0),
                'color' => $color,
            ];
        })->values();

        // ── TOP SELLING PRODUCTS — last 30 days ──────────────────────────────
        $topSellers = Order::select(
                'product_id',
                DB::raw('SUM(quantity) as total_sold'),
                DB::raw('SUM(quantity * price_at_sale) as total_revenue')
            )
            ->whereBetween('created_at', [
                Carbon::now()->subDays(30)->startOfDay(),
                Carbon::now()->endOfDay()
            ])
            ->whereHas('transaction', fn($q) => $q->whereNotIn('status', ['Cancelled']))
            ->groupBy('product_id')
            ->orderByDesc('total_sold')
            ->with('product')
            ->take(5)
            ->get()
            ->map(function ($item) {
                // Compute stock from inventories table
                $stockIn  = \DB::table('inventories')
                    ->where('product_id', $item->product_id)
                    ->where('type', 'in')
                    ->sum('quantity');
                $stockOut = \DB::table('inventories')
                    ->where('product_id', $item->product_id)
                    ->where('type', 'out')
                    ->sum('quantity');
                $stock = max(0, (int)$stockIn - (int)$stockOut);

                return [
                    'product'   => $item->product?->product ?? 'Unknown',
                    'image_url' => $item->product?->image_url,
                    'sold'      => (int) $item->total_sold,
                    'revenue'   => (float) $item->total_revenue,
                    'stock'     => $stock,
                    'reorder'   => 20,
                ];
            });

        // ── LOW STOCK PRODUCTS ────────────────────────────────────────────────
        $lowStock = Product::select('products.*')
            ->selectSub(function ($query) {
                $query->from('inventories')
                    ->whereColumn('inventories.product_id', 'products.id')
                    ->selectRaw(
                        'COALESCE(SUM(CASE WHEN type = "in" THEN quantity ELSE 0 END), 0) - ' .
                        'COALESCE(SUM(CASE WHEN type = "out" THEN quantity ELSE 0 END), 0)'
                    );
            }, 'computed_stock')
            ->havingRaw('computed_stock <= 20 AND computed_stock > 0')
            ->orderByRaw('computed_stock ASC')
            ->take(5)
            ->get()
            ->map(function ($p) {
                // Get latest restock_date from inventories for this product
                $lastRestock = \DB::table('inventories')
                    ->where('product_id', $p->id)
                    ->whereNotNull('restock_date')
                    ->orderByDesc('restock_date')
                    ->value('restock_date');

                return [
                    'product'      => $p->product,
                    'image_url'    => $p->image_url,
                    'available'    => (int) $p->computed_stock,
                    'restock_date' => $lastRestock ?? '—',
                ];
            });

        // ── RECENT ORDERS — last 6 ────────────────────────────────────────────
        $recentOrders = Transaction::with('user')
            ->latest()
            ->take(6)
            ->get()
            ->map(fn($t) => [
                'id'       => $t->id,
                'ref'      => $t->reference_no,
                'customer' => $t->user
                    ? trim("{$t->user->first_name} {$t->user->last_name}")
                    : 'Walk-in',
                'total'    => (float) $t->total_amount,
                'payment'  => $t->payment_method === 'Cash' ? 'Cash' : 'Bank Transfer',
                'status'   => $t->status,
                'date'     => Carbon::parse($t->created_at)->format('Y-m-d'),
            ]);

        // ── PAYMENT BREAKDOWN ─────────────────────────────────────────────────
        $paymentBreakdown = Transaction::select(
                'payment_method',
                DB::raw('SUM(total_amount) as total')
            )
            ->whereNotIn('status', ['Cancelled'])
            ->groupBy('payment_method')
            ->get()
            ->map(fn($p) => [
                'method' => $p->payment_method ?? 'Other',
                'amount' => (float) $p->total,
                'color'  => $p->payment_method === 'Cash' ? '#10b981' : '#8b5cf6',
            ]);

        // ── STORE PERFORMANCE ─────────────────────────────────────────────────
        $storeStats = [
            'total_orders'    => Transaction::count(),
            'revenue_today'   => (float) $revenueToday,
            'orders_today'    => (int) $ordersToday,
            'pending_orders'  => (int) $pendingOrders,
            'for_shipping'    => (int) $forShipping,
            'new_customers'   => (int) $newCustomers,
            'aov'             => round((float) $aov, 2),
            'visitors'        => '—',       // extend when analytics available
            'conversion'      => '—',
            'abandoned_carts' => '—',
            'reservations'    => (int) $pendingOrders,
            'raw_fg_ratio'    => '—',
        ];

        return Inertia::render('Admin/Dashboard', [
            'stats'            => $storeStats,
            'revenueData'      => $revenueTrend,
            'topSellers'       => $topSellers,
            'lowStock'         => $lowStock,
            'recentOrders'     => $recentOrders,
            'statusData'       => $statusData,
            'paymentBreakdown' => $paymentBreakdown,
        ]);
    }
}