<?php

namespace App\Http\Controllers\Staff\Cashier;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CashierPurchaseController extends Controller
{
    /**
     * Display a listing of customer purchases.
     */
    public function index(Request $request)
    {
        $query = Order::query()
            ->with(['product', 'transaction.user'])
            ->whereHas('transaction', function ($q) {
                // Ensure we only show orders belonging to valid transactions
                $q->whereNotNull('user_id');
            });

        // Search by product name or customer name
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('product', function ($pq) use ($search) {
                    $pq->where('product', 'like', "%{$search}%");
                })->orWhereHas('transaction.user', function ($uq) use ($search) {
                    $uq->where('first_name', 'like', "%{$search}%")
                       ->orWhere('last_name', 'like', "%{$search}%");
                });
            });
        }

        // Filter by status (from Order model)
        if ($request->filled('status') && $request->status !== 'All') {
            $query->where('status', $request->status);
        }

        // Filter by payment method (from Transaction model)
        if ($request->filled('payment_method') && $request->payment_method !== 'All') {
            $query->whereHas('transaction', function ($q) use ($request) {
                $q->where('payment_method', $request->payment_method);
            });
        }

        $purchases = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('Staff/Cashier/CustomerPurchases', [
            'purchases' => $purchases,
            'filters' => $request->only(['search', 'status', 'payment_method']),
            'statuses' => ['Pending', 'Processing', 'Shipping', 'Completed', 'Cancelled'],
            'paymentMethods' => ['Cash', 'GCash', 'Bank', 'COD'],
        ]);
    }
}
