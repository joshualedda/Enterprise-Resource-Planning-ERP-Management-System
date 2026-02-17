<?php

namespace App\Http\Controllers\Customer;

// Import ang Base Controller mula sa main folder
use App\Http\Controllers\Controller; 
use App\Models\Order;
use App\Models\Transaction;
use App\Models\Inventory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index()
    {
        $orders = Transaction::with(['order_items.product'])
            ->where('user_id', Auth::id())
            ->latest()
            ->paginate(5);

        return Inertia::render('Customer/MyOrders', [
            'orders' => $orders
        ]);
    }

    /**
     * API para sa Receipt data
     */
    public function getReceipt($id)
    {
        $order = Transaction::with(['order_items.product', 'user'])
            ->where('user_id', Auth::id())
            ->findOrFail($id);

        return response()->json([
            'receipt' => $order
        ]);
    }

    /**
     * I-update ang status kapag natanggap na ang produkto
     */
    public function markAsReceived(Transaction $transaction)
    {
        // Security: Siguraduhin na ang user na naka-login ang may-ari ng transaction
        if ($transaction->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $transaction->update(['status' => 'completed']);

        return response()->json(['message' => 'Order marked as completed!']);
    }

    public function placeOrder(Request $request)
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'total' => 'required|numeric',
        ]);

        try {
            return DB::transaction(function () use ($request) {
                $refNo = 'SRDI-' . date('Y') . '-' . strtoupper(substr(uniqid(), -8));

                $transaction = Transaction::create([
                    'user_id' => Auth::id(),
                    'reference_no' => $refNo,
                    'total_amount' => $request->total,
                    'transacted_by' => Auth::user()->name,
                    'status' => 'In process',
                ]);

                foreach ($request->items as $item) {
                    Order::create([
                        'transaction_id' => $transaction->id,
                        'product_id' => $item['id'],
                        'quantity' => $item['quantity'],
                        'price_at_sale' => $item['price'],
                    ]);

                    $inventory = Inventory::where('product_id', $item['id'])->first();
                    if (!$inventory || $inventory->quantity < $item['quantity']) {
                        // Gagamit ng full class path para sa Exception sa loob ng namespace
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