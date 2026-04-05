<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LandingPageController extends Controller
{
    public function front()
    {
        $products = Product::with(['category', 'ratings.user'])
            ->withAvg('ratings', 'stars')
            ->withCount('ratings')
            ->where('status', 'active')
            ->latest()
            ->take(8)
            ->get();

        return Inertia::render('Storefront', [
            'products' => $products,
        ]);
    }

    public function allProducts()
    {
        $products = Product::with(['category', 'ratings.user'])
            ->withAvg('ratings', 'stars')
            ->withCount('ratings')
            ->where('status', 'active')
            ->get()
            ->map(function ($product) {
                // Get sales count from successful orders (Order model is the line item)
                $product->sales_count = \App\Models\Order::where('product_id', $product->id)
                    ->whereHas('transaction', function ($q) {
                        $q->whereIn('status', ['Ready to Pickup', 'On Delivery', 'Product Received']);
                    })
                    ->sum('quantity');
                return $product;
            });

        $categories = \App\Models\Category::all();

        return Inertia::render('AllProduct', [
            'products'   => $products,
            'categories' => $categories,
        ]);
    }
}