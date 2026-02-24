<?php

namespace App\Http\Controllers\Staff\Cashier;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class CashierDashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('Staff/Cashier/Dashboard', [
            'stats' => [
                'total_sales_today'     => 0,
                'transactions_today'    => 0,
                'cash_in_drawer'        => 0,
                'pending_voids'         => 0,
                'held_orders'           => 0,
                'customers_served'      => 0,
            ],
        ]);
    }
}
