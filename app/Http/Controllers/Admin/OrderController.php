<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index()
    {
        $transactions = Transaction::with(['user', 'order_items.product'])
            ->latest()
            ->get();

        return Inertia::render('Admin/Orders/Index', [
            'orders' => $transactions
        ]);
    }

    public function show($id)
    {
        $transaction = Transaction::with(['user', 'order_items.product'])->findOrFail($id);

        return Inertia::render('Admin/Orders/View', [
            'order' => $transaction
        ]);
    }

    public function update(Request $request, $id)
    {
        $transaction = Transaction::findOrFail($id);
        
        $validated = $request->validate([
            'status' => 'required|string'
        ]);

        $transaction->update([
            'status' => $validated['status']
        ]);

        return redirect()->back()->with('success', 'Order status updated successfully.');
    }
}
