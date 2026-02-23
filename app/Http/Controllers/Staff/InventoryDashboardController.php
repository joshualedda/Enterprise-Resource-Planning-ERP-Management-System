<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Product;

class InventoryDashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('Staff/Inventory/Dashboard', [
            'products' => Product::with('category')->get(),
        ]);
    }
}
