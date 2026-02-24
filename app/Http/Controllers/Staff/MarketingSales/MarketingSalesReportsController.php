<?php

namespace App\Http\Controllers\Staff\MarketingSales;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class MarketingSalesReportsController extends Controller
{
    public function index()
    {
        return Inertia::render('Staff/MarketingSales/Reports');
    }

    public function pdf()
    {
        return response()->json(['message' => 'PDF export coming soon.']);
    }

    public function excel()
    {
        return response()->json(['message' => 'Excel export coming soon.']);
    }
}
