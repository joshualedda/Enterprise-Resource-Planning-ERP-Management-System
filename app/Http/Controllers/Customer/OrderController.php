<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Transaction;
use App\Models\UserInformation;
use App\Models\Inventory;
use App\Models\Notification;
use App\Models\User;
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
                $transaction->order_items->each(function ($item) {
                    if ($item->product && $item->product->image_url) {
                        $item->product->image_url = '/storage/' . $item->product->image_url;
                    }
                });
                return $transaction;
            });

        return Inertia::render('Orders', [
            'orders' => [
                'data' => $transactions,
            ],
        ]);
    }

    /**
     * POST /customer/checkout/place-order
     */
    public function placeOrder(Request $request)
    {
        $items = is_string($request->input('items')) ? json_decode($request->input('items'), true) : $request->input('items');
        $address = is_string($request->input('address')) ? json_decode($request->input('address'), true) : $request->input('address', []);

        $method  = $request->input('method');
        $payment = $request->input('payment');
        $user    = Auth::user();

        // 1. Validation
        if (empty($items) || !is_array($items)) {
            return back()->with('error', 'Your cart is empty or invalid.');
        }

        if ($payment === 'Bank' && !$request->hasFile('receipt')) {
            return back()->with('error', 'Please upload your GCash or bank transfer receipt.');
        }

        // 2. Stock Validation
        foreach ($items as $productId => $item) {
            $availableStock = (int) Inventory::where('product_id', $productId)
                ->where('type', 'in')
                ->latest()
                ->value('quantity') ?? 0;

            if ($availableStock < (int)$item['quantity']) {
                $name = $item['product'] ?? "Product #{$productId}";
                return back()->with('error', "Insufficient stock for \"{$name}\". Only {$availableStock} left.");
            }
        }

        DB::beginTransaction();

        try {
            // 3. Upload receipt
            $receiptPath = null;
            if ($request->hasFile('receipt') && $request->file('receipt')->isValid()) {
                $receiptPath = $request->file('receipt')->store('receipts', 'public');
            }

            // 4. Calculate total
            $totalAmount = collect($items)->sum(fn($item) => ($item['price'] ?? 0) * ($item['quantity'] ?? 0));

            // 5. Create Transaction
            $transaction = Transaction::create([
                'user_id'        => $user->id,
                'reference_no'   => $this->generateReferenceNo(),
                'total_amount'   => $totalAmount,
                'status'         => 'Pending',
                'order_type'     => $method,
                'payment_method' => $payment,
                'receipt_path'   => $receiptPath,
            ]);

            // 6. Order items + inventory deduction
            foreach ($items as $productId => $item) {
                Order::create([
                    'transaction_id' => $transaction->id,
                    'product_id'     => $productId,
                    'quantity'       => $item['quantity'],
                    'price_at_sale'  => $item['price'],
                    'status'         => 'Pending',
                ]);

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

            // 7. Shipping Info (delivery)
            if ($method === 'delivery' && !empty($address)) {
                $user->update([
                    'region_id'       => $address['region_id'] ?? null,
                    'province_id'     => $address['province_id'] ?? null,
                    'municipality_id' => $address['municipality_id'] ?? null,
                    'barangay_id'     => $address['barangay_id'] ?? null,
                    'zip_code'        => $address['zipcode'] ?? null,
                ]);
            }

            // 8. Notification para sa ADMIN — may bagong order
            $admin = User::where('role_id', 1)->first();
            if ($admin) {
                Notification::create([
                    'user_id' => $admin->id,
                    'icon'    => '🛒',
                    'title'   => 'New Order Received!',
                    'body' => "Customer {$user->first_name} {$user->last_name} placed a new order #{$transaction->reference_no}.",
                    'unread'  => true,
                    'type'    => 'new_order',
                    'url'     => route('admin.orders.show', $transaction->id)
                ]);
            }

            // 9. Notification para sa CUSTOMER — confirmation ng order
            Notification::create([
                'user_id' => $user->id,
                'icon'    => '🛒',
                'title'   => 'Order Placed Successfully!',
                'body'    => "Your order #{$transaction->reference_no} has been placed and is now Pending.",
                'unread'  => true,
                'type'    => 'new_order',
                'url'     => route('customer.orders.index')
            ]);

            DB::commit();
            
            $cart = \App\Models\Cart::where('user_id', $user->id)->where('status', 'active')->first();
            if ($cart) {
                $cart->update(['status' => 'ordered']);
            }

            return back()->with('success', "Order placed! Ref: {$transaction->reference_no}");

        } catch (\Throwable $e) {
            DB::rollBack();
            return back()->with('error', 'Something went wrong: ' . $e->getMessage());
        }
    }

    /**
     * PATCH /customer/orders/{id}/received
     */
    public function markReceived(int $id)
    {
        $transaction = Transaction::where('user_id', Auth::id())->findOrFail($id);

        if ($transaction->status !== 'Ready to Pickup' && $transaction->status !== 'Delivery in Progress') {
            return response()->json(['error' => 'Order is not ready for pickup/delivery.'], 422);
        }

        $transaction->update([
            'status'        => 'Product Received',
            'transacted_by' => Auth::id(),
        ]);

        // Notification para sa ADMIN — nareceive na ng customer
        $admin = User::where('role_id', 1)->first();
        if ($admin) {
            Notification::create([
                'user_id' => $admin->id,
                'icon'    => '✅',
                'title'   => 'Order Received by Customer',
                'body'    => "Order #{$transaction->reference_no} has been marked as received.",
                'unread'  => true,
                'type'    => 'order_completed',
                'url'     => route('admin.orders.show', $transaction->id)
            ]);
        }

        // Notification para sa CUSTOMER — confirmation na nareceive
        Notification::create([
            'user_id' => Auth::id(),
            'icon'    => '✅',
            'title'   => 'Order Completed!',
            'body'    => "Your order #{$transaction->reference_no} has been marked as received. Thank you!",
            'unread'  => true,
            'type'    => 'order_completed',
            'url'     => route('customer.orders.index')
        ]);

        return response()->json(['message' => 'Order marked as received.']);
    }

    /**
     * PATCH /customer/orders/{transaction}/cancel
     */
    public function cancelOrder(int $id)
    {
        $transaction = Transaction::with('order_items')->where('user_id', Auth::id())->findOrFail($id);

        $allowedStatuses = ['Pending', 'Ready to Pickup', 'Delivery in Progress'];
        if (!in_array($transaction->status, $allowedStatuses)) {
            return response()->json(['error' => 'Orders that are already completed or already cancelled cannot be cancelled.'], 422);
        }

        DB::beginTransaction();

        try {
            // 1. Update status
            $transaction->update(['status' => 'Cancelled']);

            // 2. Restore stock
            foreach ($transaction->order_items as $item) {
                // Fetch the latest stock log entry for this product (type 'in' is typically used for positive stock)
                $inventoryRow = Inventory::where('product_id', $item->product_id)
                    ->where('type', 'in')
                    ->latest()
                    ->first();

                if ($inventoryRow) {
                    $inventoryRow->increment('quantity', $item->quantity);
                    $inventoryRow->update([
                        'remarks' => "Stock restored — Order #{$transaction->reference_no} cancelled by customer",
                    ]);
                }
            }

            // 3. Notification for ADMIN
            $admin = User::where('role_id', 1)->first();
            if ($admin) {
                Notification::create([
                    'user_id' => $admin->id,
                    'icon'    => '❌',
                    'title'   => 'Order Cancelled by Customer',
                    'body'    => "Customer " . Auth::user()->first_name . " cancelled order #{$transaction->reference_no}.",
                    'unread'  => true,
                    'type'    => 'order_cancelled',
                    'url'     => route('admin.orders.show', $transaction->id)
                ]);
            }

            DB::commit();
            return response()->json(['message' => 'Order cancelled successfully.']);

        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['error' => 'Cancellation failed: ' . $e->getMessage()], 500);
        }
    }

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