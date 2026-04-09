<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\RawProduct;
use App\Models\RawProductBatch;
use App\Models\RawProductStock;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryProductStocksController extends Controller
{
    public function index(Request $request)
    {
        $query = RawProductStock::with(['product', 'warehouse', 'batch']);

        // Search filtering
        $search = $request->input('search');
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('product', function ($p) use ($search) {
                    $p->where('name', 'like', '%' . $search . '%');
                })
                ->orWhereHas('warehouse', function ($w) use ($search) {
                    $w->where('name', 'like', '%' . $search . '%');
                })
                ->orWhereHas('batch', function ($b) use ($search) {
                    $b->where('batch_code', 'like', '%' . $search . '%');
                });
            });
        }

        // Filters
        if ($request->filled('warehouse_id')) {
            $query->where('warehouse_id', $request->warehouse_id);
        }

        $stocks = $query->paginate(10)->withQueryString();

        return Inertia::render('Staff/Inventory/ProductStocks', [
            'stocks' => $stocks,
            'products' => RawProduct::orderBy('name')->get(['id', 'name']),
            'warehouses' => Warehouse::orderBy('name')->get(['id', 'name']),
            'filters' => $request->only(['search', 'warehouse_id']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:raw_products,id',
            'warehouse_id' => 'required|exists:warehouses,id',
            'batch_id' => 'nullable|exists:raw_product_batches,id',
            'quantity_on_hand' => 'required|numeric|min:0',
            'quantity_reserved' => 'required|numeric|min:0',
        ]);

        RawProductStock::create($validated);

        return redirect()->back()->with('success', 'Stock record created successfully.');
    }

    public function update(Request $request, string $id)
    {
        $stock = RawProductStock::findOrFail($id);

        $validated = $request->validate([
            'product_id' => 'required|exists:raw_products,id',
            'warehouse_id' => 'required|exists:warehouses,id',
            'batch_id' => 'nullable|exists:raw_product_batches,id',
            'quantity_on_hand' => 'required|numeric|min:0',
            'quantity_reserved' => 'required|numeric|min:0',
        ]);

        $stock->update($validated);

        return redirect()->back()->with('success', 'Stock record updated successfully.');
    }

    public function destroy(string $id)
    {
        $stock = RawProductStock::findOrFail($id);
        $stock->delete();

        return redirect()->back()->with('success', 'Stock record deleted successfully.');
    }

    public function getBatchesByProduct(string $productId)
    {
        $batches = RawProductBatch::where('raw_product_id', $productId)
            ->orderBy('batch_code')
            ->get(['id', 'batch_code']);

        return response()->json($batches);
    }
}
