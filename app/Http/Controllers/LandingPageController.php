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
            ->withAvg('ratings', 'stars') // Kinukuha ang average stars
            ->withCount('ratings')        // Kinukuha ang bilang ng reviews
            ->where('status', 'active')
            ->latest()
            ->get()
            ->map(function ($product) {
                // Kalkulahin ang totoong stock (In minus Out)
                $in = $product->inventory()->where('type', 'in')->sum('quantity');
                $out = $product->inventory()->where('type', 'out')->sum('quantity');
                $product->stock_count = $in - $out;
                return $product;
            });

        return Inertia::render('Storefront', [
            'products' => $products,
        ]);
    }
}