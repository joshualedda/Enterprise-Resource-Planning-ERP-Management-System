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
            'product'      => $product,
            'logs'         => $product->inventories,
            'current_stock' => max(0, $stockIn - $stockOut),
            'total_in'     => $stockIn,
            'total_out'    => $stockOut,
        ]);
    }

    /**
     * Record a new inventory adjustment (stock in or out).
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

        // Stock-out guard: cannot remove more than available
        if ($request->type === 'out') {
            $product = Product::findOrFail($request->product_id);
            if ($request->quantity > $product->stock_count) {
                return back()->withErrors(['quantity' => "Cannot remove more than current stock ({$product->stock_count})."])->withInput();
            }
        }

        Inventory::create([
            'product_id'   => $request->product_id,
            'quantity'     => $request->quantity,
            'type'         => $request->type,
            'batch_code'   => $request->batch_code,
            'restock_date' => $request->restock_date,
            'remarks'      => $request->remarks,
        ]);

        return back()->with('success', 'Inventory adjustment recorded.');
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
