<?php

namespace App\Http\Controllers\Staff\MarketingSales;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MarketingSalesListController extends Controller
{
    /**
     * Display a listing of sales transactions.
     */
    public function index(Request $request)
    {
        $query = Transaction::query()
            ->with(['user', 'order_items.product'])
            ->latest();

        // Search by reference number or customer name
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('reference_no', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('first_name', 'like', "%{$search}%")
                         ->orWhere('last_name', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by status
        if ($request->filled('status') && $request->status !== 'All') {
            $query->where('status', $request->status);
        }

        $transactions = $query->paginate(10)->withQueryString();

        // Statistics
        $stats = [
            'total_sales' => Transaction::where('status', 'Completed')->sum('total_amount'),
            'pending_orders' => Transaction::where('status', 'Pending')->count(),
            'total_orders' => Transaction::count(),
            'monthly_sales' => Transaction::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->sum('total_amount'),
        ];

        return Inertia::render('Staff/MarketingSales/SalesList', [
            'transactions' => $transactions,
            'filters' => $request->only(['search', 'status']),
            'stats' => $stats,
        ]);
    }

    /**
     * Generate PDF for the sales list.
     */
    public function pdf()
    {
        // Placeholder for PDF generation logic
        return back()->with('success', 'PDF generation is coming soon!');
    }

    /**
     * Export sales list to Excel.
     */
    public function excel()
    {
        // Placeholder for Excel export logic
        return back()->with('success', 'Excel export is coming soon!');
    }
}
