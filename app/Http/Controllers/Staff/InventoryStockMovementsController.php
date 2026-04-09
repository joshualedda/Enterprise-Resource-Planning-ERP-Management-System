<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\RawProduct;
use App\Models\RawProductBatch;
use App\Models\StockMovement;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class InventoryStockMovementsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = StockMovement::with(['product', 'warehouse', 'batch']);

        // Search filtering
        $search = $request->input('search');
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('notes', 'like', '%' . $search . '%')
                  ->orWhere('movement_type', 'like', '%' . $search . '%')
                  ->orWhereHas('product', function ($p) use ($search) {
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
        if ($request->filled('type')) {
            $query->where('movement_type', $request->type);
        }
        if ($request->filled('warehouse_id')) {
            $query->where('warehouse_id', $request->warehouse_id);
        }

        $movements = $query->latest('movement_date')->paginate(10)->withQueryString();

        return Inertia::render('Staff/Inventory/StockMovement', [
            'movements' => $movements,
            'products' => RawProduct::orderBy('name')->get(['id', 'name']),
            'warehouses' => Warehouse::orderBy('name')->get(['id', 'name']),
            'batches' => RawProductBatch::orderBy('batch_code')->get(['id', 'batch_code', 'raw_product_id']),
            'filters' => $request->only(['search', 'type', 'warehouse_id']),
            'movementTypes' => [
                'purchase', 'sale', 'transfer_in', 'transfer_out', 'adjustment', 'production_use', 'return'
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:raw_products,id',
            'warehouse_id' => 'required|exists:warehouses,id',
            'batch_id' => 'nullable|exists:raw_product_batches,id',
            'movement_type' => 'required|in:purchase,sale,transfer_in,transfer_out,adjustment,production_use,return',
            'quantity' => 'required|numeric',
            'unit_cost' => 'required|numeric|min:0',
            'movement_date' => 'required|date',
            'notes' => 'nullable|string',
            'reference_type' => 'nullable|string|max:100',
            'reference_id' => 'nullable|integer',
        ]);

        StockMovement::create($validated);

        return redirect()->back()->with('success', 'Stock movement logged successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $movement = StockMovement::findOrFail($id);

        $validated = $request->validate([
            'product_id' => 'required|exists:raw_products,id',
            'warehouse_id' => 'required|exists:warehouses,id',
            'batch_id' => 'nullable|exists:raw_product_batches,id',
            'movement_type' => 'required|in:purchase,sale,transfer_in,transfer_out,adjustment,production_use,return',
            'quantity' => 'required|numeric',
            'unit_cost' => 'required|numeric|min:0',
            'movement_date' => 'required|date',
            'notes' => 'nullable|string',
            'reference_type' => 'nullable|string|max:100',
            'reference_id' => 'nullable|integer',
        ]);

        $movement->update($validated);

        return redirect()->back()->with('success', 'Stock movement updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $movement = StockMovement::findOrFail($id);
        $movement->delete();

        return redirect()->back()->with('success', 'Stock movement deleted successfully.');
    }
    public function getBatchesByProduct(string $productId)
    {
        $batches = RawProductBatch::where('raw_product_id', $productId)
            ->orderBy('batch_code')
            ->get(['id', 'batch_code']);

        return response()->json($batches);
    }
}
