<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Transaction;
use App\Models\Order;
use App\Models\Inventory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LandingPageController extends Controller
{


       public function front()
    {
        return Inertia::render('Storefront', [
            'products' => Product::with(['category', 'inventory']) // Load inventory para sa stock check
                ->where('status', 'active')
                ->latest()
                ->get(),
        ]);
    }

}