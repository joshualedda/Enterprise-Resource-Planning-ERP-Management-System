<?php

namespace App\Http\Controllers\Staff\Production;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class ProductionReportsController extends Controller
{
    public function index()
    {
        return Inertia::render('Staff/Production/Reports');
    }

    public function pdf()
    {
        // PDF export — implement when ready
        abort(501, 'Not implemented yet.');
    }

    public function excel()
    {
        // Excel export — implement when ready
        abort(501, 'Not implemented yet.');
    }
}
