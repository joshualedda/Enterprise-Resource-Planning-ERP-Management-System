<?php

namespace App\Http\Controllers\Staff\Inventory;

use App\Http\Controllers\Controller;
use App\Models\RawPurchaseOrder;
use App\Models\RawPurchaseOrderItem;
use App\Models\RawProductSupplier;
use App\Models\RawProduct;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class InventoryPurchaseOrdersController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $purchaseOrders = RawPurchaseOrder::with(['supplier', 'items.product'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);
            
        $suppliers = RawProductSupplier::orderBy('name')->get();
        $products = RawProduct::orderBy('name')->get();

        $stats = [
            'total' => RawPurchaseOrder::count(),
            'pending' => RawPurchaseOrder::whereIn('status', ['draft', 'approved'])->count(),
        ];

        return Inertia::render('Staff/Inventory/PurchaseOrders', [
            'purchaseOrders' => $purchaseOrders,
            'suppliers' => $suppliers,
            'products' => $products,
            'stats' => $stats,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:raw_product_suppliers,id',
            'order_number' => 'required|string|max:255|unique:raw_purchase_orders,order_number',
            'status' => 'required|in:draft,approved,received,cancelled',
            'order_date' => 'required|date',
            'expected_date' => 'nullable|date|after_or_equal:order_date',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:raw_products,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_cost' => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($validated) {
            $purchaseOrder = RawPurchaseOrder::create([
                'supplier_id' => $validated['supplier_id'],
                'order_number' => $validated['order_number'],
                'status' => $validated['status'],
                'order_date' => $validated['order_date'],
                'expected_date' => $validated['expected_date'],
                'notes' => $validated['notes'],
            ]);

            foreach ($validated['items'] as $item) {
                RawPurchaseOrderItem::create([
                    'purchase_order_id' => $purchaseOrder->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_cost' => $item['unit_cost'],
                ]);
            }
        });

        return redirect()->back()->with('success', 'Purchase order created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, RawPurchaseOrder $purchaseOrder)
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:raw_product_suppliers,id',
            'order_number' => 'required|string|max:255|unique:raw_purchase_orders,order_number,' . $purchaseOrder->id,
            'status' => 'required|in:draft,approved,received,cancelled',
            'order_date' => 'required|date',
            'expected_date' => 'nullable|date|after_or_equal:order_date',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:raw_products,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_cost' => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($validated, $purchaseOrder) {
            $purchaseOrder->update([
                'supplier_id' => $validated['supplier_id'],
                'order_number' => $validated['order_number'],
                'status' => $validated['status'],
                'order_date' => $validated['order_date'],
                'expected_date' => $validated['expected_date'],
                'notes' => $validated['notes'],
            ]);

            // Delete existing items and recreate to handle modifications
            $purchaseOrder->items()->delete();

            foreach ($validated['items'] as $item) {
                RawPurchaseOrderItem::create([
                    'purchase_order_id' => $purchaseOrder->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_cost' => $item['unit_cost'],
                ]);
            }
        });

        return redirect()->back()->with('success', 'Purchase order updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(RawPurchaseOrder $purchaseOrder)
    {
        DB::transaction(function () use ($purchaseOrder) {
            $purchaseOrder->items()->delete();
            $purchaseOrder->delete();
        });

        return redirect()->back()->with('success', 'Purchase order deleted successfully.');
    }
}
