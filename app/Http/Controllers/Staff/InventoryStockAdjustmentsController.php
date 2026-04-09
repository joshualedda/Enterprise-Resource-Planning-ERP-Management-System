<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\RawProduct;
use App\Models\RawProductBatch;
use App\Models\RawStockAdjustment;
use App\Models\RawStockAdjustmentItem;
use App\Models\Warehouse;
use App\Models\RawProductStock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class InventoryStockAdjustmentsController extends Controller
{
    /**
     * Display a listing of stock adjustment history.
     */
    public function index(Request $request)
    {
        $query = RawStockAdjustment::with(['warehouse', 'items.product', 'items.batch'])
            ->latest();

        if ($request->filled('search')) {
            $query->where('adjustment_number', 'like', '%' . $request->search . '%')
                  ->orWhere('reason', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('warehouse_id')) {
            $query->where('warehouse_id', $request->warehouse_id);
        }

        return Inertia::render('Staff/Inventory/StockAdjustmentHistory', [
            'adjustments' => $query->paginate(10)->withQueryString(),
            'warehouses' => Warehouse::all(),
            'filters' => $request->only(['search', 'warehouse_id']),
        ]);
    }

    /**
     * Show the form for creating a new stock adjustment.
     */
    public function create()
    {
        return Inertia::render('Staff/Inventory/StockAdjustment', [
            'products' => RawProduct::where('is_active', true)->get(),
            'warehouses' => Warehouse::all(),
            'batches' => RawProductBatch::all(),
        ]);
    }

    /**
     * Store a newly created stock adjustment in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'warehouse_id' => 'required|exists:warehouses,id',
            'reason' => 'required|string|max:255',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:raw_products,id',
            'items.*.batch_id' => 'nullable|exists:raw_product_batches,id',
            'items.*.quantity' => 'required|numeric',
        ]);

        DB::transaction(function () use ($request) {
            $adjustment = RawStockAdjustment::create([
                'adjustment_number' => 'ADJ-' . strtoupper(uniqid()),
                'warehouse_id' => $request->warehouse_id,
                'reason' => $request->reason,
                'notes' => $request->notes,
            ]);

            foreach ($request->items as $item) {
                RawStockAdjustmentItem::create([
                    'adjustment_id' => $adjustment->id,
                    'product_id' => $item['product_id'],
                    'batch_id' => $item['batch_id'] ?? null,
                    'quantity' => $item['quantity'],
                ]);

                // Update RawProductStock (WIP: Logic depends on how you handle stock)
                $stock = RawProductStock::firstOrNew([
                    'product_id' => $item['product_id'],
                    'warehouse_id' => $request->warehouse_id,
                    'batch_id' => $item['batch_id'] ?? null,
                ]);

                $stock->quantity_on_hand += $item['quantity'];
                $stock->save();
            }
        });

        return redirect()->route('staff.inventory.stock-adjustments.index')
            ->with('success', 'Stock adjustment recorded successfully.');
    }

    /**
     * Remove the specified stock adjustment from storage.
     */
    public function destroy(RawStockAdjustment $adjustment)
    {
        DB::transaction(function () use ($adjustment) {
            // Optional: Reverse the stock changes if needed
            foreach ($adjustment->items as $item) {
                $stock = RawProductStock::where([
                    'product_id' => $item->product_id,
                    'warehouse_id' => $adjustment->warehouse_id,
                    'batch_id' => $item->batch_id,
                ])->first();

                if ($stock) {
                    $stock->quantity_on_hand -= $item->quantity;
                    $stock->save();
                }
            }
            $adjustment->delete();
        });

        return redirect()->back()->with('success', 'Stock adjustment deleted successfully.');
    }

    /**
     * Get batches for a specific product.
     */
    public function getBatchesByProduct(RawProduct $product)
    {
        $batches = RawProductBatch::where('raw_product_id', $product->id)->get();
        return response()->json($batches);
    }
}
