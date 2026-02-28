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
        ]);
    }
}