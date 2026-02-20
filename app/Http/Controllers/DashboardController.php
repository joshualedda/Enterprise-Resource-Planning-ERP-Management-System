<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $filter = $request->query('filter', 'today');
        $now = Carbon::now();

        $startDate = match ($filter) {
            'week'  => $now->copy()->startOfWeek(),
            'month' => $now->copy()->startOfMonth(),
            'year'  => $now->copy()->startOfYear(),
            default => $now->copy()->startOfDay(),
        };
        $endDate = $now->copy()->endOfDay();

        $query = Order::with(['product', 'transaction.user'])
                      ->whereBetween('created_at', [$startDate, $endDate]);

        if ($user->role_id === 1 || $user->role_id === 2) {
            $orders = $query->latest()->get();
        } else {
            $orders = $query->whereHas('transaction', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })->latest()->get();
        }

        $productsCount = ($user->role_id === 1) ? Product::count() : 0;
        $topProducts = [];

        if ($user->role_id === 1) {
            $topProducts = Order::select('product_id', DB::raw('SUM(quantity) as total_sold'))
                ->whereBetween('created_at', [$startDate, $endDate])
                ->groupBy('product_id')
                ->orderBy('total_sold', 'desc')
                ->with('product')
                ->take(5)
                ->get()
                ->map(fn($item) => [
                    'name' => $item->product->product ?? 'Unknown',
                    'image' => $item->product->image_url,
                    'count' => (int) $item->total_sold, 
                ]);
        }

        return Inertia::render('Admin/Dashboard', [
            'orders' => $orders,
            'products' => $productsCount,
            'topProducts' => $topProducts,
            'currentFilter' => $filter
        ]);
    }
}