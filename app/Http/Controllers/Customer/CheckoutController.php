<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Transaction;
use App\Models\Order;
use App\Models\Inventory;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CheckoutController extends Controller
{
    /**
     * Show Checkout Page
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $selectedIds = $request->input('items', []);
        
        if (is_string($selectedIds)) {
            $selectedIds = explode(',', $selectedIds);
        }

        // Get active cart
        $cart = Cart::where('user_id', $user->id)->where('status', 'active')->first();
        
        if (!$cart) {
            return redirect()->route('customer.cart.index')->with('error', 'Your cart is empty.');
        }

        // Fetch selected items
        $items = CartItem::with(['product.category'])
            ->where('cart_id', $cart->id)
            ->whereIn('product_id', $selectedIds)
            ->get();

        if ($items->isEmpty()) {
            return redirect()->route('customer.cart.index')->with('error', 'Please select items to checkout.');
        }

        // Fetch geographic data
        $regions = \App\Models\Region::with(['provinces' => function($q) {
                $q->orderBy('provDesc');
            }, 'provinces.municipalities' => function($q) {
                $q->orderBy('citymunDesc');
            }, 'provinces.municipalities.barangays' => function($q) {
                $q->orderBy('brgyDesc');
            }])
            ->orderBy('regDesc')
            ->get();

        return Inertia::render('Checkout', [
            'checkoutItems' => $items->map(fn($item) => [
                'id' => $item->product_id,
                'product' => $item->product->product,
                'price' => (float) $item->product->price,
                'quantity' => (int) $item->quantity,
                'subtotal' => (float) ($item->product->price * $item->quantity),
                'image_url' => $item->product->image_url,
                'category' => $item->product->category?->category
            ]),
            'regions' => $regions,
            'customer' => [
                'name' => "{$user->first_name} {$user->last_name}",
                'email' => $user->email,
                'phone' => $user->information?->phone_number ?? '',
                'savedAddress' => [
                    'region_id'       => (string) ($user->region_id       ?? ''),
                    'province_id'     => (string) ($user->province_id     ?? ''),
                    'municipality_id' => (string) ($user->municipality_id ?? ''),
                    'barangay_id'     => (string) ($user->barangay_id     ?? ''),
                    'zipcode'         => $user->zip_code ?? '',
                ]
            ]
        ]);
    }

    /**
     * Process Checkout
     */
    public function store(Request $request)
    {
        $request->validate([
            'items' => 'required|array',
            'customer_name' => 'required|string',
            'contact' => 'required|string',
            'address' => 'nullable|string',
            'region_id' => 'required|exists:region,region_id',
            'province_id' => 'required|exists:province,province_id',
            'municipality_id' => 'required|exists:municipality,municipality_id',
            'barangay_id' => 'required|exists:barangay,barangay_id',
            'zip_code' => 'nullable|string',
            'payment_method' => 'required|in:cash,gcash,bank',
            'reference_no' => 'nullable|string',
            'receipt' => 'nullable|image|max:2048'
        ]);

        $user = Auth::user();
        
        DB::beginTransaction();
        try {
            // Update User Profile with new address as fallback
            $user->update([
                'region_id' => $request->region_id,
                'province_id' => $request->province_id,
                'municipality_id' => $request->municipality_id,
                'barangay_id' => $request->barangay_id,
                'zip_code' => $request->zip_code,
            ]);

            // 1. Calculate Total
            $totalAmount = 0;
            foreach ($request->items as $item) {
                $totalAmount += $item['price'] * $item['quantity'];
            }

            // 2. Receipt Upload
            $receiptPath = null;
            if ($request->hasFile('receipt')) {
                $receiptPath = $request->file('receipt')->store('receipts', 'public');
            }

            // 3. Create Transaction
            $referenceNo = $this->generateReferenceNo();
            $transaction = Transaction::create([
                'user_id' => $user->id,
                'reference_no' => $referenceNo,
                'total_amount' => $totalAmount,
                'status' => 'In Process',
                'payment_method' => ucfirst($request->payment_method),
                'receipt_path' => $receiptPath,
                'transacted_by' => $user->id,
                'order_type' => 'delivery'
            ]);

            // 4. Process Items
            foreach ($request->items as $itemData) {
                // Create Order (Line Item)
                Order::create([
                    'transaction_id' => $transaction->id,
                    'product_id' => $itemData['id'],
                    'quantity' => $itemData['quantity'],
                    'price_at_sale' => $itemData['price'],
                    'status' => 'Pending'
                ]);

                // 5. Deduct Inventory (Insert OUT record)
                Inventory::create([
                    'product_id' => $itemData['id'],
                    'quantity' => $itemData['quantity'],
                    'type' => 'out',
                    'remarks' => "Order #{$referenceNo}"
                ]);
            }

            // 6. Clear Cart (Update status to ordered)
            $cart = Cart::where('user_id', $user->id)->where('status', 'active')->first();
            if ($cart) {
                $cart->update(['status' => 'ordered']);
            }

            // 7. Notifications
            $admin = User::where('role_id', 1)->first();
            if ($admin) {
                Notification::create([
                    'user_id' => $admin->id,
                    'icon' => '🛍️',
                    'title' => 'New Order Received',
                    'body' => "New order #{$referenceNo} placed by {$request->customer_name}.",
                    'unread' => true,
                    'type' => 'new_order',
                    'url' => '#' // Add link when admin route is ready
                ]);
            }

            DB::commit();

            return redirect()->route('customer.orders.index')->with('success', "Order #{$referenceNo} has been placed successfully!");

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Checkout failed: ' . $e->getMessage());
        }
    }

    private function generateReferenceNo(): string
    {
        do {
            $ref = 'SRDI-' . now()->format('Y') . '-' . strtoupper(bin2hex(random_bytes(3)));
        } while (Transaction::where('reference_no', $ref)->exists());
        return $ref;
    }

    private function formatAddress($user)
    {
        $info = $user->userInformation;
        if (!$info) return '';
        
        $parts = [];
        if ($user->barangay?->brgyDesc) $parts[] = $user->barangay->brgyDesc;
        if ($user->municipality?->citymunDesc) $parts[] = $user->municipality->citymunDesc;
        if ($user->province?->provDesc) $parts[] = $user->province->provDesc;
        if ($info->zipcode) $parts[] = $info->zipcode;
        
        return implode(', ', $parts);
    }
}
