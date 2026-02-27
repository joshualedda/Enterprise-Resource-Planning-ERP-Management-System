<?php

namespace App\Http\Controllers\Customer;

// Import ang Base Controller mula sa main folder
use App\Http\Controllers\Controller; 
use App\Models\Order;
use App\Models\Transaction;
use App\Models\Inventory;
use App\Models\Province;
use App\Models\Municipality;
use App\Models\Barangay;
use App\Models\UserInformation;
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
            'order_type' => 'required|in:walk_in,delivery',
            'payment_method' => 'required|in:bank_to_bank,cash_on_hand',
            'street_number' => 'nullable|string|max:255',
            'province_id' => 'nullable|integer|exists:province,id',
            'municipality_id' => 'nullable|integer|exists:municipality,id',
            'barangay_id' => 'nullable|integer|exists:barangay,id',
            'zip_code' => 'nullable|string|max:20',
        ]);

        if ($request->order_type === 'delivery') {
            if (!$request->barangay_id || !$request->municipality_id || !$request->province_id || !$request->street_number) {
                return redirect()->back()->with('error', 'Delivery address is incomplete.');
            }
            // force payment to bank_to_bank for delivery
            $request->merge(['payment_method' => 'bank_to_bank']);
        }

        try {
            return DB::transaction(function () use ($request) {
                $refNo = 'SRDI-' . date('Y') . '-' . strtoupper(substr(uniqid(), -8));

                // Resolve names for storage in transaction (columns currently store strings)
                $provName = $request->province;
                $munName = $request->municipality;
                $brgyName = $request->barangay;

                if ($request->province_id) {
                    $prov = Province::find($request->province_id);
                    $provName = $prov ? $prov->province_name : $provName;
                }
                if ($request->municipality_id) {
                    $mun = Municipality::find($request->municipality_id);
                    $munName = $mun ? $mun->municipality_name : $munName;
                }
                if ($request->barangay_id) {
                    $brg = Barangay::find($request->barangay_id);
                    $brgyName = $brg ? $brg->name : $brgyName;
                }

                $transaction = Transaction::create([
                    'user_id' => Auth::id(),
                    'reference_no' => $refNo,
                    'total_amount' => $request->total,
                    'transacted_by' => Auth::user()->name,
                    'status' => 'In Process',
                    'order_type' => $request->order_type,
                    'payment_method' => $request->payment_method,
                    'street_number' => $request->street_number,
                    'barangay' => $brgyName,
                    'municipality' => $munName,
                    'province' => $provName,
                    'zip_code' => $request->zip_code,
                ]);

                // If delivery, ensure the location is stored in reference tables and save to user_information
                if ($request->order_type === 'delivery') {
                    // If frontend provided IDs, use them; otherwise create/find by names
                    if ($request->province_id) {
                        $provinceModel = Province::find($request->province_id);
                    } else {
                        $provinceModel = Province::firstOrCreate(['province_name' => $provName], ['region_id' => 1]);
                    }

                    if ($request->municipality_id) {
                        $municipalityModel = Municipality::find($request->municipality_id);
                    } else {
                        $municipalityModel = Municipality::firstOrCreate(['municipality_name' => $munName, 'province_id' => $provinceModel->id], ['province_id' => $provinceModel->id]);
                    }

                    if ($request->barangay_id) {
                        $barangayModel = Barangay::find($request->barangay_id);
                    } else {
                        $barangayModel = Barangay::firstOrCreate(['name' => $brgyName, 'municipality_id' => $municipalityModel->id], ['municipality_id' => $municipalityModel->id]);
                    }

                    // Update or create user's user_information
                    UserInformation::updateOrCreate(
                        ['user_id' => Auth::id()],
                        [
                            'province_id' => $provinceModel->id,
                            'municipality_id' => $municipalityModel->id,
                            'barangay_id' => $barangayModel->id,
                        ]
                    );
                }

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