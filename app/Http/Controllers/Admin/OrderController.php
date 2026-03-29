<?php

namespace App\Http\Controllers\Admin;

use App\Models\Notification;
use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\Inventory;
use App\Models\Region;
use App\Models\Province;
use App\Models\Municipality;
use App\Models\Barangay;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
        $transaction = Transaction::with([
            'user',
            'user.information',
            'order_items.product'
        ])->findOrFail($id);

        $user = $transaction->user;
        $shippingAddress = null;

        if ($user && $user->region_id) {
            $region       = Region::where('regCode', $user->region_id)->first();
            $province     = Province::where('provCode', $user->province_id)->first();
            $municipality = Municipality::where('citymunCode', $user->municipality_id)->first();
            $barangay     = Barangay::where('brgyCode', $user->barangay_id)->first();

            $shippingAddress = [
                'phone_number' => null, // Assuming no phone_number in users table based on provided schema
                'region'       => $region?->regDesc ?? null,
                'province'     => $province?->provDesc    ?? null,
                'municipality' => $municipality?->citymunDesc ?? null,
                'barangay'     => $barangay?->brgyDesc            ?? null,
                'zipcode'      => $user->zip_code ?? null,
            ];
        }

        return Inertia::render('Admin/Orders/View', [
            'order'           => $transaction,
            'shippingAddress' => $shippingAddress,
        ]);
    }

    /**
     * Update order status
     */
    public function update(Request $request, $id)
    {
        $transaction = Transaction::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|string|in:Pending,In Process,Ready to Pickup,On Delivery,Product Received,Cancelled'
        ]);

        $transaction->update(['status' => $validated['status']]);

        Notification::create([
            'user_id' => $transaction->user_id,
            'icon'    => '📦',
            'title'   => 'Order Status Update',
            'body'    => "Your order #{$transaction->reference_no} is now {$validated['status']}.",
            'unread'  => true,
            'type'    => 'order_update',
            'url'     => route('customer.orders.index')
        ]);

        return redirect()->back()->with('success', 'Order status updated successfully.');
    }

    /**
     * Reject receipt — cancel order, restore stock, notify customer with reason
     */
    public function rejectReceipt(Request $request, $id)
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $transaction = Transaction::with('order_items')->findOrFail($id);

        if ($transaction->status !== 'Pending') {
            return redirect()->back()->with('error', 'Only pending orders can have their receipt rejected.');
        }

        DB::beginTransaction();

        try {
            // 1. Cancel the order
            $transaction->update(['status' => 'Cancelled']);

            // 2. Restore inventory stock
            foreach ($transaction->order_items as $item) {
                $inventoryRow = Inventory::where('product_id', $item->product_id)
                    ->where('type', 'in')
                    ->latest()
                    ->first();

                if ($inventoryRow) {
                    $inventoryRow->increment('quantity', $item->quantity);
                    $inventoryRow->update([
                        'remarks' => "Stock restored — rejected receipt for Order #{$transaction->reference_no}",
                    ]);
                }
            }

            // 3. Notify customer with the reason
            Notification::create([
                'user_id' => $transaction->user_id,
                'icon'    => '❌',
                'title'   => 'Receipt Rejected — Order Cancelled',
                'body'    => "Your payment receipt for order #{$transaction->reference_no} was rejected. Reason: {$validated['reason']}. Please place a new order and upload a valid receipt.",
                'unread'  => true,
                'type'    => 'receipt_rejected',
                'url'     => route('customer.orders.index')
            ]);

            DB::commit();

            return redirect()->back()->with('success', 'Receipt rejected. Order cancelled and stock has been restored.');

        } catch (\Throwable $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Something went wrong: ' . $e->getMessage());
        }
    }
}