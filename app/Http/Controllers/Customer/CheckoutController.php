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
        \Illuminate\Support\Facades\Log::info('Checkout process started', ['request' => $request->except(['receipt'])]);

        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'items' => 'required|array',
            'customer_name' => 'required|string',
            'contact' => 'required|string',
            'address' => 'required|string',
            'region_id' => 'required',
            'province_id' => 'required',
            'municipality_id' => 'required',
            'barangay_id' => 'required',
            'zip_code' => 'nullable|string',
            'payment_method' => 'required|in:cash,gcash,bank',
            'reference_no' => 'nullable|string',
            'receipt' => 'nullable|image|max:2048'
        ]);

        if ($validator->fails()) {
            \Illuminate\Support\Facades\Log::warning('Checkout validation failed', ['errors' => $validator->errors()->toArray()]);
            return back()->withErrors($validator)->withInput();
        }

        $user = Auth::user();
        
        DB::beginTransaction();
        try {
            // 1. Receipt Upload
            $receiptPath = null;
            if ($request->hasFile('receipt')) {
                $receiptPath = $request->file('receipt')->store('receipts', 'public');
                \Illuminate\Support\Facades\Log::info('Receipt uploaded', ['path' => $receiptPath]);
            }

            // 2. Create Transaction
            $referenceNo = $this->generateReferenceNo();
            $transaction = Transaction::create([
                'user_id' => $user->id,
                'barangay_id' => (int) $request->barangay_id,
                'municipal_id' => (int) $request->municipality_id,
                'province_id' => (int) $request->province_id,
                'region_id' => (int) $request->region_id,
                'shipping_address' => $request->address,
                'reference_no' => $request->reference_no ?? $referenceNo,
                'total_amount' => collect($request->items)->sum(fn($i) => (float)$i['price'] * (int)$i['quantity']),
                'status' => 'Pending',
                'payment_method' => ucfirst($request->payment_method),
                'receipt_path' => $receiptPath,
                'transacted_by' => $request->customer_name,
                'order_type' => 'Delivery'
            ]);

            \Illuminate\Support\Facades\Log::info('Transaction created', ['id' => $transaction->id, 'ref' => $transaction->reference_no]);

            // 3. Process Items & Inventory
            foreach ($request->items as $itemData) {
                Order::create([
                    'transaction_id' => $transaction->id,
                    'product_id' => $itemData['id'],
                    'quantity' => $itemData['quantity'],
                    'price_at_sale' => $itemData['price'],
                    'status' => 'Pending'
                ]);

                Inventory::create([
                    'product_id' => $itemData['id'],
                    'quantity' => $itemData['quantity'],
                    'type' => 'out',
                    'remarks' => "Order #{$transaction->reference_no}"
                ]);
            }

            // 4. Clear Cart
            $cart = Cart::where('user_id', $user->id)->where('status', 'active')->first();
            if ($cart) {
                $cart->update(['status' => 'ordered']);
            }

            // 5. Notifications
            $admins = User::where('role_id', 1)->get();
            foreach ($admins as $admin) {
                Notification::create([
                    'user_id' => $admin->id,
                    'icon' => '🛍️',
                    'title' => 'New Order Received',
                    'body' => "Order #{$transaction->reference_no} by {$request->customer_name}",
                    'unread' => true,
                    'type' => 'new_order',
                    'url' => route('admin.orders.show', $transaction->id)
                ]);
            }

            DB::commit();
            \Illuminate\Support\Facades\Log::info('Checkout success', ['transaction_id' => $transaction->id]);

            return redirect()->route('customer.orders.index')->with('success', "Order placed successfully! Reference: {$transaction->reference_no}");

        } catch (\Exception $e) {
            DB::rollBack();
            \Illuminate\Support\Facades\Log::error('Checkout Fatal Error: ' . $e->getMessage(), [
                'exception' => $e,
                'trace' => $e->getTraceAsString()
            ]);
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
