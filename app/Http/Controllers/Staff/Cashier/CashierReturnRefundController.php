<?php

namespace App\Http\Controllers\Staff\Cashier;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CashierReturnRefundController extends Controller
{
    /**
     * Display a listing of returns and refunds.
     */
    public function index(Request $request)
    {
        $query = Transaction::query()
            ->with(['user', 'order_items.product'])
            ->whereIn('status', ['Cancelled', 'Product Received'])
            ->latest();

        // Search by reference or customer name
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
        } else {
            // By default, maybe show those most relevant to returns/refunds
            // $query->whereIn('status', ['Cancelled', 'Product Received']);
        }

        $transactions = $query->paginate(15)->withQueryString();

        return Inertia::render('Staff/Cashier/ReturnRefunds', [
            'transactions' => $transactions,
            'filters' => $request->only(['search', 'status']),
            'statuses' => ['Cancelled', 'Product Received'],
        ]);
    }

    /**
     * Placeholder for return processing logic.
     */
    public function processReturn(Request $request, $id)
    {
        // Logic to mark as returned/refunded or handle specific item returns
        return back()->with('success', 'Return processing initiated for transaction #' . $id);
    }
}
