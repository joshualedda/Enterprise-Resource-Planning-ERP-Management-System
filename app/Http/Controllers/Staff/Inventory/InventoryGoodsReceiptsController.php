<?php

namespace App\Http\Controllers\Staff\Inventory;

use App\Http\Controllers\Controller;
use App\Models\RawGoodsReceipt;
use App\Models\RawGoodsReceiptItem;
use App\Models\RawPurchaseOrder;
use App\Models\Warehouse;
use App\Models\RawProduct;
use App\Models\RawProductBatch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class InventoryGoodsReceiptsController extends Controller
{
    public function index()
    {
        $goodsReceipts = RawGoodsReceipt::with(['purchaseOrder.supplier', 'warehouse', 'items.product', 'items.batch'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);
            
        // We only want approved or received POs to create a receipt from
        $purchaseOrders = RawPurchaseOrder::whereIn('status', ['approved', 'received'])
            ->with(['supplier', 'items.product'])
            ->orderBy('order_number')
            ->get();
            
        $warehouses = Warehouse::orderBy('name')->get();
        $products = RawProduct::orderBy('name')->get();

        // Optional: Provide batches if needed, or lookup dynamically
        $batches = RawProductBatch::orderBy('batch_code')->get();

        $stats = [
            'total' => RawGoodsReceipt::count(),
            'posted' => RawGoodsReceipt::where('status', 'posted')->count(),
        ];

        return Inertia::render('Staff/Inventory/GoodsReceipt', [
            'goodsReceipts' => $goodsReceipts,
            'purchaseOrders' => $purchaseOrders,
            'warehouses' => $warehouses,
            'products' => $products,
            'batches' => $batches,
            'stats' => $stats,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'purchase_order_id' => 'required|exists:raw_purchase_orders,id',
            'warehouse_id' => 'required|exists:warehouses,id',
            'receipt_number' => 'required|string|max:50|unique:raw_goods_receipts,receipt_number',
            'received_date' => 'required|date',
            'status' => 'required|in:draft,posted,void',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:raw_products,id',
            'items.*.batch_id' => 'nullable|exists:raw_product_batches,id',
            'items.*.quantity_received' => 'required|numeric|min:0.01',
            'items.*.unit_cost' => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($validated) {
            $receipt = RawGoodsReceipt::create([
                'purchase_order_id' => $validated['purchase_order_id'],
                'warehouse_id' => $validated['warehouse_id'],
                'receipt_number' => $validated['receipt_number'],
                'received_date' => $validated['received_date'],
                'status' => $validated['status'],
                'received_by' => auth()->id() ?? null,
                'notes' => $validated['notes'],
            ]);

            foreach ($validated['items'] as $item) {
                RawGoodsReceiptItem::create([
                    'goods_receipt_id' => $receipt->id,
                    'product_id' => $item['product_id'],
                    'batch_id' => $item['batch_id'] ?? null,
                    'quantity_received' => $item['quantity_received'],
                    'unit_cost' => $item['unit_cost'],
                ]);
            }
        });

        return redirect()->back()->with('success', 'Goods receipt created successfully.');
    }

    public function update(Request $request, RawGoodsReceipt $goodsReceipt)
    {
        $validated = $request->validate([
            'purchase_order_id' => 'required|exists:raw_purchase_orders,id',
            'warehouse_id' => 'required|exists:warehouses,id',
            'receipt_number' => 'required|string|max:50|unique:raw_goods_receipts,receipt_number,' . $goodsReceipt->id,
            'received_date' => 'required|date',
            'status' => 'required|in:draft,posted,void',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:raw_products,id',
            'items.*.batch_id' => 'nullable|exists:raw_product_batches,id',
            'items.*.quantity_received' => 'required|numeric|min:0.01',
            'items.*.unit_cost' => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($validated, $goodsReceipt) {
            $goodsReceipt->update([
                'purchase_order_id' => $validated['purchase_order_id'],
                'warehouse_id' => $validated['warehouse_id'],
                'receipt_number' => $validated['receipt_number'],
                'received_date' => $validated['received_date'],
                'status' => $validated['status'],
                'notes' => $validated['notes'],
            ]);

            // Replace items
            $goodsReceipt->items()->delete();

            foreach ($validated['items'] as $item) {
                RawGoodsReceiptItem::create([
                    'goods_receipt_id' => $goodsReceipt->id,
                    'product_id' => $item['product_id'],
                    'batch_id' => $item['batch_id'] ?? null,
                    'quantity_received' => $item['quantity_received'],
                    'unit_cost' => $item['unit_cost'],
                ]);
            }
        });

        return redirect()->back()->with('success', 'Goods receipt updated successfully.');
    }

    public function destroy(RawGoodsReceipt $goodsReceipt)
    {
        DB::transaction(function () use ($goodsReceipt) {
            $goodsReceipt->items()->delete();
            $goodsReceipt->delete();
        });

        return redirect()->back()->with('success', 'Goods receipt deleted successfully.');
    }
}
