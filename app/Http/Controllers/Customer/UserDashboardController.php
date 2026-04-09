<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\Product;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class UserDashboardController extends Controller
{
    public function index()
    {
        $userId = Auth::id();
    
        // Recent transactions with order items + products
        $transactions = Transaction::with('order_items.product')
            ->where('user_id', $userId)
            ->latest()
            ->get()
            ->map(function ($t) {
                $t->order_items->each(function ($item) {
                    if ($item->product?->image_url) {
                        $item->product->image_url = asset('storage/' . $item->product->image_url);
                    }
                });
                return $t;
            });

        // ── Chart Data: Last 6 Months ──
        $chartData = [];
        for ($i = 5; $i >= 0; $i--) {
            $date  = now()->subMonths($i);
            $month = $date->format('M Y');
            $year  = $date->year;
            $mNum  = $date->month;

            // Spending (Only Received)
            $spending = Transaction::where('user_id', $userId)
                ->where('status', 'Product Received')
                ->whereYear('created_at', $year)
                ->whereMonth('created_at', $mNum)
                ->sum('total_amount');

            // Order Count (All status except Cancelled)
            $orders = Transaction::where('user_id', $userId)
                ->where('status', '!=', 'Cancelled')
                ->whereYear('created_at', $year)
                ->whereMonth('created_at', $mNum)
                ->count();

            $chartData[] = [
                'name'     => $month,
                'amount'   => (float) $spending,
                'orders'   => (int) $orders,
            ];
        }

        // 4 random active products for "For You" section
        $recentProducts = Product::with('category')
            ->where('status', 'active')
            ->inRandomOrder()
            ->limit(4)
            ->get()
            ->map(function ($p) {
                $p->image_url = $p->image_url ? asset('storage/' . $p->image_url) : null;
                return $p;
            });

        return Inertia::render('Customer/Dashboard', [
            'transactions'   => $transactions,
            'recentProducts' => $recentProducts,
            'chartData'      => $chartData,
        ]);
    }
}