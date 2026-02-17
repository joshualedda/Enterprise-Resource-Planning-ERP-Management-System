<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\MonthlyReportExport;

class ReportsController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with(['transaction', 'product', 'user']);

        // 1. Search Logic
        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->whereHas('transaction', function($t) use ($request) {
                    $t->where('reference_no', 'like', "%{$request->search}%");
                })->orWhereHas('product', function($p) use ($request) {
                    $p->where('product', 'like', "%{$request->search}%");
                });
            });
        }

        // 2. Date Filter Logic
        if ($request->start_date && $request->end_date) {
            $query->whereBetween('created_at', [
                $request->start_date . " 00:00:00", 
                $request->end_date . " 23:59:59"
            ]);
        }

        $orders = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('Admin/Reports', [
            'orders' => $orders,
            'filters' => $request->only(['search', 'start_date', 'end_date'])
        ]);
    }

    public function generatePDF(Request $request)
    {
        $orders = $this->getFilteredData($request);

        $pdf = Pdf::loadView('Admin.pdf_template', [
            'orders' => $orders,
            'date' => now()->format('m/d/Y'),
            'filters' => $request->all()
        ]);

        return $pdf->stream('Monthly_Report_' . now()->format('Ymd') . '.pdf');
    }

    // --- ITO YUNG NAWAWALA NA METHOD ---
    public function generateExcel(Request $request)
    {
        // Gagamit tayo ng MonthlyReportExport class
        // Siguraduhin na nagawa mo na ito: php artisan make:export MonthlyReportExport
        return Excel::download(
            new MonthlyReportExport($request->start_date, $request->end_date, $request->search), 
            'Monthly_Report_' . now()->format('Ymd') . '.xlsx'
        );
    }

    // Helper function para hindi paulit-ulit ang filter logic
    private function getFilteredData(Request $request)
    {
        $query = Order::with(['transaction', 'product', 'user']);

        if ($request->start_date && $request->end_date) {
            $query->whereBetween('created_at', [
                $request->start_date . " 00:00:00", 
                $request->end_date . " 23:59:59"
            ]);
        }
        
        if ($request->search) {
            $query->whereHas('transaction', function($q) use ($request) {
                $q->where('reference_no', 'like', "%{$request->search}%");
            });
        }

        return $query->get();
    }
}