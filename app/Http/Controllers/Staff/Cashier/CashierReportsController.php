<?php

namespace App\Http\Controllers\Staff\Cashier;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class CashierReportsController extends Controller
{
    public function index()
    {
        return Inertia::render('Staff/Cashier/Reports');
    }

    public function pdf()
    {
        // TODO: generate PDF report
        return response()->json(['message' => 'PDF export coming soon.']);
    }

    public function excel()
    {
        // TODO: generate Excel report
        return response()->json(['message' => 'Excel export coming soon.']);
    }
}
