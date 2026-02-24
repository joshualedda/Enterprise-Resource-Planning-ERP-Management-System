<?php

namespace App\Http\Controllers\Staff\MarketingSales;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class MarketingSalesDashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('Staff/MarketingSales/Dashboard', [
            'stats' => [],
        ]);
    }
}
