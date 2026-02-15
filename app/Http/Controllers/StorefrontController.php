<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StorefrontController extends Controller
{
    /**
     * Display the storefront/welcome page with products
     */
    public function index()
    {
        return Inertia::render('Storefront', [
            'products' => Product::with('category')
                ->where('status', 'active')
                ->latest()
                ->get(),
        ]);
    }
}