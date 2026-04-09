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

    /**
     * POST /admin/orders/{id}/approve-return
     * Approve a returned order and create a replacement delivery
     */
    public function approveReturn(Request $request, $id)
    {
        $validated = $request->validate([
            'action' => 'required|in:approve,reject',
            'reason' => 'nullable|string|max:500',
        ]);

        $transaction = Transaction::with('order_items')->findOrFail($id);

        if ($transaction->status !== 'Returned') {
            return response()->json(['error' => 'Order is not in Returned status.'], 422);
        }

        DB::beginTransaction();

        try {
            if ($validated['action'] === 'approve') {
                // Restore inventory stock
                foreach ($transaction->order_items as $item) {
                    $inventoryRow = Inventory::where('product_id', $item->product_id)
                        ->where('type', 'in')
                        ->latest()
                        ->first();

                    if ($inventoryRow) {
                        $inventoryRow->increment('quantity', $item->quantity);
                        $inventoryRow->update([
                            'remarks' => "Stock restored — Return approved for Order #{$transaction->reference_no}",
                        ]);
                    }
                }

                // Create a new replacement transaction
                $replacementTransaction = Transaction::create([
                    'user_id'        => $transaction->user_id,
                    'reference_no'   => $this->generateReferenceNo(),
                    'total_amount'   => $transaction->total_amount,
                    'status'         => 'In Process',
                    'order_type'     => $transaction->order_type,
                    'payment_method' => $transaction->payment_method,
                    'receipt_path'   => $transaction->receipt_path,
                    'transacted_by'  => auth()->id(),
                ]);

                // Copy order items to replacement transaction
                foreach ($transaction->order_items as $item) {
                    Order::create([
                        'transaction_id' => $replacementTransaction->id,
                        'product_id'     => $item->product_id,
                        'quantity'       => $item->quantity,
                        'price_at_sale'  => $item->price_at_sale,
                        'status'         => 'In Process',
                    ]);

                    // Deduct inventory for replacement
                    $inventoryRow = Inventory::where('product_id', $item->product_id)
                        ->where('type', 'in')
                        ->latest()
                        ->first();

                    if ($inventoryRow) {
                        $inventoryRow->decrement('quantity', $item->quantity);
                        $inventoryRow->update([
                            'remarks' => "Replacement Order #{$replacementTransaction->reference_no} — from Return #{$transaction->reference_no}",
                        ]);
                    }
                }

                // Update original transaction to Completed (return approved)
                $transaction->update(['status' => 'Completed']);

                // Notify customer about refund/replacement
                $customer = $transaction->user;
                Notification::create([
                    'user_id' => $transaction->user_id,
                    'icon'    => '✅',
                    'title'   => 'Return Approved - Replacement Approved!',
                    'body'    => "Your return for order #{$transaction->reference_no} has been approved! A replacement order #{$replacementTransaction->reference_no} has been created and will be re-delivered to you.",
                    'unread'  => true,
                    'type'    => 'return_approved',
                    'url'     => route('customer.orders.index')
                ]);

            } else {
                // Reject return
                $transaction->update(['status' => 'Completed']);

                Notification::create([
                    'user_id' => $transaction->user_id,
                    'icon'    => '❌',
                    'title'   => 'Return Request Rejected',
                    'body'    => "Your return request for order #{$transaction->reference_no} has been rejected. Reason: {$validated['reason']}",
                    'unread'  => true,
                    'type'    => 'return_rejected',
                    'url'     => route('customer.orders.index')
                ]);
            }

            DB::commit();

            $action = $validated['action'] === 'approve' ? 'approved' : 'rejected';
            return response()->json([
                'success' => true,
                'message' => "Return {$action} successfully.",
                'replacementRef' => $validated['action'] === 'approve' ? $replacementTransaction->reference_no ?? null : null
            ]);

        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['error' => 'Something went wrong: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Generate unique reference number
     */
    private function generateReferenceNo(): string
    {
        do {
            $digits = str_pad(rand(0, 9999999), 7, '0', STR_PAD_LEFT);
            $letter = chr(rand(65, 90));
            $code   = strtoupper(str_shuffle($digits . $letter));
            $refNo  = 'SRDI-2026-' . $code;
        } while (Transaction::where('reference_no', $refNo)->exists());

        return $refNo;
    }
}