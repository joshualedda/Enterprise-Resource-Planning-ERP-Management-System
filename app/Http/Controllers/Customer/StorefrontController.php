<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Transaction;
use App\Models\Order;
use App\Models\Inventory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class StorefrontController extends Controller
{
    /**
     * Display the storefront/welcome page with products
     */
    public function index()
    {
        return Inertia::render('Customer/StoreView', [
            'products' => Product::with(['category', 'inventory']) // Load inventory para sa stock check
                ->where('status', 'active')
                ->latest()
                ->get(),
        ]);
    }

       public function front()
    {
        return Inertia::render('Storefront', [
            'products' => Product::with(['category', 'inventory']) // Load inventory para sa stock check
                ->where('status', 'active')
                ->latest()
                ->get(),
        ]);
    }

    /**
     * Handle the checkout process
     */
    public function placeOrder(Request $request)
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'total' => 'required|numeric',
        ]);

        try {
            return DB::transaction(function () use ($request) {
                // 1. Generate Unique Reference Number: SRDI-2026-RANDOM
                $year = date('Y');
                $random = strtoupper(substr(md5(uniqid()), 0, 8)); // 8 random characters
                $refNo = "SRDI-{$year}-{$random}";

                // 2. Create Transaction
                $transaction = Transaction::create([
                    'user_id' => Auth::id(),
                    'reference_no' => $refNo,
                    'total_amount' => $request->total,
                    'transacted_by' => Auth::user()->name ?? 'Customer',
                    'status' => 'In process',
                ]);

                // 3. Process each item
                foreach ($request->items as $item) {
                    // Create Order (OrderItem)
                    Order::create([
                        'transaction_id' => $transaction->id,
                        'product_id' => $item['id'],
                        'quantity' => $item['quantity'],
                        'price_at_sale' => $item['price'],
                    ]);

                    // 4. Bawas sa Inventory Stock
                    $inventory = Inventory::where('product_id', $item['id'])->first();

                    if (!$inventory || $inventory->quantity < $item['quantity']) {
                        throw new \Exception("Insufficient stock for {$item['product']}");
                    }

                    $inventory->decrement('quantity', $item['quantity']);
                }

                return redirect()->back()->with('success', "Order placed! Ref: {$refNo}");
            });
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }
}