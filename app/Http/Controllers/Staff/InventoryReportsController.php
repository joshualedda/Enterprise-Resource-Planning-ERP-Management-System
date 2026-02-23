<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use Inertia\Inertia;
use App\Http\Controllers\Admin\ReportsController;

class InventoryReportsController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with(['transaction', 'product', 'user']);
        
        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->whereHas('transaction', fn($t) => $t->where('reference_no', 'like', "%{$request->search}%"))
                  ->orWhereHas('product', fn($p) => $p->where('product', 'like', "%{$request->search}%"));
            });
        }
        
        if ($request->start_date && $request->end_date) {
            $query->whereBetween('created_at', [$request->start_date . ' 00:00:00', $request->end_date . ' 23:59:59']);
        }
        
        return Inertia::render('Staff/Inventory/Reports', [
            'orders'  => $query->latest()->paginate(10)->withQueryString(),
            'filters' => $request->only(['search', 'start_date', 'end_date']),
        ]);
    }

    public function pdf(Request $request)
    {
        return app(ReportsController::class)->generatePDF($request);
    }

    public function excel(Request $request)
    {
        return app(ReportsController::class)->generateExcel($request);
    }
}
