<?php

namespace App\Http\Controllers\Staff\Accounting;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AccountingDashboardController extends Controller
{
    /**
     * Render the Accounting Staff Dashboard.
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        // TODO: Replace with real aggregated financial data from your models
        $stats = [
            'revenue_month'  => 0,
            'expenses_month' => 0,
            'net_profit'     => 0,
            'accounts_receivable' => 0,
            'accounts_payable'    => 0,
            'cash_balance'        => 0,
        ];

        return Inertia::render('Staff/Accounting/Dashboard', [
            'stats' => $stats,
        ]);
    }
}
