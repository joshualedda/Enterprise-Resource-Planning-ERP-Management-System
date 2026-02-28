<?php
namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Inertia\Inertia;

class StorefrontController extends Controller
{
    public function index()
    {
        return Inertia::render('Customer/StoreView', [
            'products' => Product::with(['category', 'inventory'])
                ->where('status', 'active')
                ->latest()
                ->get(),
        ]);
    }
}