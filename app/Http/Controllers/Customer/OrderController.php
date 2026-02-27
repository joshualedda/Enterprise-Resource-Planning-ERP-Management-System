<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Transaction;
use App\Models\UserInformation;
use App\Models\Inventory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class OrderController extends Controller
{
    /**
     * GET /customer/orders
     */
    public function index()
    {
        $transactions = Transaction::with('order_items.product')
            ->where('user_id', Auth::id())
            ->latest()
            ->get()
            ->map(function ($transaction) {
                // Fix image URLs to include /storage/ prefix
                $transaction->order_items->each(function ($item) {
                    if ($item->product && $item->product->image_url) {
                        $item->product->image_url = '/storage/' . $item->product->image_url;
                    }
                });
                return $transaction;
            });

        return Inertia::render('Customer/MyOrders', [
            // Page expects orders.data
            'orders' => [
                'data' => $transactions,
            ],
        ]);
    }

    /**
     * GET /customer/api/orders/{id}/receipt
     */
    public function getReceipt(int $id)
    {
        $transaction = Transaction::where('user_id', Auth::id())->findOrFail($id);

        if (!$transaction->receipt_path || !Storage::disk('public')->exists($transaction->receipt_path)) {
            abort(404, 'Receipt not found.');
        }

        return response()->json([
            'url' => Storage::disk('public')->url($transaction->receipt_path),
        ]);
    }

    /**
     * POST /customer/checkout/place-order
     */
    public function placeOrder(Request $request)
    {
        // ── Parse items ──────────────────────────────────────────────────────
        // Inertia sends items as JSON string when using forceFormData with a file
        $items = $request->input('items');
        if (is_string($items)) {
            $items = json_decode($items, true);
        }

        // Parse address the same way
        $address = $request->input('address', []);
        if (is_string($address)) {
            $address = json_decode($address, true) ?? [];
        }

        $method  = $request->input('method');
        $payment = $request->input('payment');
        $user    = Auth::user();

        // ── Basic validation ─────────────────────────────────────────────────
        if (empty($items) || !is_array($items)) {
            return back()->with('error', 'Your cart is empty or invalid. Please try again.');
        }

        if (!in_array($method, ['walk-in', 'delivery'])) {
            return back()->with('error', 'Invalid order method.');
        }

        if (!in_array($payment, ['Cash', 'Bank'])) {
            return back()->with('error', 'Invalid payment method.');
        }

        // ── Receipt validation ───────────────────────────────────────────────
        if ($payment === 'Bank' && !$request->hasFile('receipt')) {
            return back()->with('error', 'Please upload your GCash or bank transfer receipt.');
        }

        // ── Stock validation ─────────────────────────────────────────────────
        foreach ($items as $productId => $item) {
            $availableStock = (int) Inventory::where('product_id', $productId)
                ->where('type', 'in')
                ->latest()
                ->value('quantity') ?? 0;

            $needed = (int) ($item['quantity'] ?? 0);

            if ($availableStock < $needed) {
                $name = $item['product'] ?? "Product #{$productId}";
                return back()->with('error', "Insufficient stock for \"{$name}\". Only {$availableStock} unit(s) available.");
            }
        }

        DB::beginTransaction();

        try {
            // 1. Upload receipt
            $receiptPath = null;
            if ($request->hasFile('receipt') && $request->file('receipt')->isValid()) {
                $receiptPath = $request->file('receipt')->store('receipts', 'public');
            }

            // 2. Total amount
            $totalAmount = collect($items)->sum(fn($item) => ($item['price'] ?? 0) * ($item['quantity'] ?? 0));

            // 3. Create Transaction
            $transaction = Transaction::create([
                'user_id'        => $user->id,
                'reference_no'   => $this->generateReferenceNo(),
                'total_amount'   => $totalAmount,
                'status'         => 'In Process',
                'order_type'     => $method,
                'payment_method' => $payment,
                'receipt_path'   => $receiptPath,
            ]);

            // 4. Order items + inventory deduction
            foreach ($items as $productId => $item) {
                Order::create([
                    'transaction_id' => $transaction->id,
                    'product_id'     => $productId,
                    'quantity'       => $item['quantity'],
                    'price_at_sale'  => $item['price'],
                    'status'         => 'In Process',
                ]);

                // Decrement directly on the existing 'in' row — no new row added
                $inventoryRow = Inventory::where('product_id', $productId)
                    ->where('type', 'in')
                    ->latest()
                    ->first();

                if ($inventoryRow) {
                    $inventoryRow->decrement('quantity', $item['quantity']);
                    $inventoryRow->update([
                        'remarks' => "Order #{$transaction->reference_no} — {$method}",
                    ]);
                }
            }

            // 5. Save shipping address (delivery only)
            if ($method === 'delivery' && !empty($address)) {
                UserInformation::updateOrCreate(
                    ['user_id' => $user->id],
                    [
                        'role_id'         => $user->role_id,
                        'phone_number'    => $address['phone_number']    ?? null,
                        'region_id'       => $address['region_id']       ?? null,
                        'province_id'     => $address['province_id']     ?? null,
                        'municipality_id' => $address['municipality_id'] ?? null,
                        'barangay_id'     => $address['barangay_id']     ?? null,
                        'zipcode'         => $address['zipcode']         ?? null,
                    ]
                );
            }

            DB::commit();

            // Clear the session cart after successful order
            session()->forget('cart');

            return back()->with(
                'success',
                "Order placed successfully! Reference No: {$transaction->reference_no}. Our staff will contact you shortly."
            );

        } catch (\Throwable $e) {
            DB::rollBack();
            \Log::error('Order placement failed: ' . $e->getMessage() . ' | Line: ' . $e->getLine() . ' | File: ' . $e->getFile());

            return back()->with('error', 'Something went wrong: ' . $e->getMessage());
        }
    }


    /**
     * PATCH /customer/orders/{id}/received
     * Customer marks their own order as received.
     */
    public function markReceived(int $id)
    {
        $transaction = Transaction::where('user_id', Auth::id())->findOrFail($id);

        if ($transaction->status !== 'Ready to Pickup') {
            return response()->json(['error' => 'Order is not ready for pickup.'], 422);
        }

        $transaction->update([
            'status'         => 'Product Received',
            'transacted_by'  => Auth::id(),
        ]);

        return response()->json(['message' => 'Order marked as received.']);
    }

    /**
     * SRDI-2026-XXXXXXXX (7 digits + 1 uppercase letter, shuffled, unique)
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


    