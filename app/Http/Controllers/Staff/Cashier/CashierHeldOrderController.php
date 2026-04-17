<?php

namespace App\Http\Controllers\Staff\Cashier;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CashierHeldOrderController extends Controller
{
    /**
     * Display a listing of held orders.
     */
    public function index(Request $request)
    {
        $query = Transaction::query()
            ->with(['user', 'order_items.product'])
            ->where('status', 'Held')
            ->latest();

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

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        if ($request->filled('order_type') && $request->order_type !== 'All') {
            $query->where('order_type', $request->order_type);
        }

        $heldOrders = $query->paginate(10)->withQueryString();

        return Inertia::render('Staff/Cashier/HeldOrders', [
            'heldOrders' => $heldOrders,
            'filters' => $request->only(['search', 'date_from', 'date_to', 'order_type']),
            'orderTypes' => ['Walk-in', 'Online'],
        ]);
    }

    /**
     * Resume a held order (re-open it in POS).
     */
    public function resume($id)
    {
        // Placeholder for resume logic
        return back()->with('success', 'Resuming held order... (POS loading integration coming soon)');
    }

    /**
     * Cancel a held order.
     */
    public function destroy($id)
    {
        $transaction = Transaction::findOrFail($id);
        $transaction->update(['status' => 'Cancelled']);
        
        return back()->with('success', 'Held order has been cancelled.');
    }
}
