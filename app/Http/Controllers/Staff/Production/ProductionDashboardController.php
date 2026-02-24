<?php

namespace App\Http\Controllers\Staff\Production;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class ProductionDashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('Staff/Production/Dashboard', [
            'stats' => [
                'active_orders'   => 0,
                'pending_approval' => 0,
                'qc_pending'      => 0,
                'completed_today' => 0,
            ],
        ]);
    }
}
