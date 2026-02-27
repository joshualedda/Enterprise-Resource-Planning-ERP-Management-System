<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Inventory;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryController extends Controller
{
    public function index()
    {
        $products = Product::with(['category', 'inventories' => function ($q) {
            $q->latest()->limit(20);
        }])
            ->withSum(['inventories as stock_in'  => fn($q) => $q->where('type', 'in')],  'quantity')
            ->withSum(['inventories as stock_out' => fn($q) => $q->where('type', 'out')], 'quantity')
            ->latest()
            ->get()
            ->map(function ($product) {
                $product->current_stock = max(0, ($product->stock_in ?? 0) - ($product->stock_out ?? 0));
                return $product;
            });

        return Inertia::render('Admin/Inventory/Index', [
            'products' => $products,
        ]);
    }

    /**
     * View a single product's inventory log.
     */
    public function show(Product $product)
    {
        $product->load(['category', 'inventories' => fn($q) => $q->latest()]);

        $stockIn  = $product->inventories->where('type', 'in')->sum('quantity');
        $stockOut = $product->inventories->where('type', 'out')->sum('quantity');

        return Inertia::render('Admin/Inventory/View', [
            'product'       => $product,
            'logs'          => $product->inventories,
            'current_stock' => max(0, $stockIn - $stockOut),
            'total_in'      => $stockIn,
            'total_out'     => $stockOut,
        ]);
    }

    /**
     * Record an inventory adjustment.
     * Instead of inserting new rows, this updates the single 'in' row per product.
     * - type = 'in'  → increments the existing stock row (or creates it)
     * - type = 'out' → decrements the existing stock row
     */
    public function adjust(Request $request)
    {
        $request->validate([
            'product_id'   => 'required|exists:products,id',
            'quantity'     => 'required|integer|min:1',
            'type'         => 'required|in:in,out',
            'batch_code'   => 'nullable|string|max:191',
            'restock_date' => 'nullable|date',
            'remarks'      => 'nullable|string',
        ]);

        // Get the single inventory row for this product
        $inventory = Inventory::where('product_id', $request->product_id)
            ->where('type', 'in')
            ->latest()
            ->first();

        $currentStock = $inventory ? $inventory->quantity : 0;

        // Guard: cannot deduct more than what's available
        if ($request->type === 'out') {
            if ($request->quantity > $currentStock) {
                return back()->withErrors([
                    'quantity' => "Cannot remove {$request->quantity}. Current stock is only {$currentStock}."
                ])->withInput();
            }
        }

        if ($request->type === 'in') {
            if ($inventory) {
                // Add to existing row
                $inventory->increment('quantity', $request->quantity);
                $inventory->update([
                    'batch_code'   => $request->batch_code   ?? $inventory->batch_code,
                    'restock_date' => $request->restock_date ?? $inventory->restock_date,
                    'remarks'      => $request->remarks      ?? $inventory->remarks,
                ]);
            } else {
                // No row yet — create the first one
                Inventory::create([
                    'product_id'   => $request->product_id,
                    'quantity'     => $request->quantity,
                    'type'         => 'in',
                    'batch_code'   => $request->batch_code,
                    'restock_date' => $request->restock_date,
                    'remarks'      => $request->remarks,
                ]);
            }
        } else {
            // type = 'out': deduct directly from the stock row
            $inventory->decrement('quantity', $request->quantity);

            if ($request->remarks) {
                $inventory->update(['remarks' => $request->remarks]);
            }
        }

        return back()->with('success', 'Inventory updated successfully.');
    }

    /**
     * Delete a specific inventory log entry.
     */
    public function destroy(Inventory $inventory)
    {
        $inventory->delete();
        return back()->with('success', 'Log entry deleted.');
    }
}