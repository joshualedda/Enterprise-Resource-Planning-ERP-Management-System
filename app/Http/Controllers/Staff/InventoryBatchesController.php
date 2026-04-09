<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\RawProductBatch;
use App\Models\RawProduct;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryBatchesController extends Controller
{
    public function index(Request $request)
    {
        $query = RawProductBatch::with('product')->latest();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('batch_code', 'like', "%{$search}%")
                  ->orWhereHas('product', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('product') && $request->product !== 'All') {
            $query->where('raw_product_id', $request->product);
        }

        $batches = $query->paginate(10)->withQueryString();
        $products = RawProduct::orderBy('name')->get();

        $stats = [
            'total' => RawProductBatch::count(),
            'expiring_soon' => RawProductBatch::where('expiry_date', '>', now())
                ->where('expiry_date', '<=', now()->addDays(30))
                ->count(),
            'expired' => RawProductBatch::where('expiry_date', '<', now())->count(),
        ];

        return Inertia::render('Staff/Inventory/Batches', [
            'batches' => $batches,
            'products' => $products,
            'stats' => $stats,
            'filters' => $request->only(['search', 'product'])
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'raw_product_id' => 'required|exists:raw_products,id',
            'batch_code' => 'required|string|max:100|unique:raw_product_batches,batch_code',
            'supplier_id' => 'nullable|integer',
            'manufacturing_date' => 'nullable|date',
            'expiry_date' => 'nullable|date|after_or_equal:manufacturing_date',
        ]);

        RawProductBatch::create($validated);

        return redirect()->back()->with('success', 'Batch created successfully.');
    }

    public function update(Request $request, RawProductBatch $batch)
    {
        $validated = $request->validate([
            'raw_product_id' => 'required|exists:raw_products,id',
            'batch_code' => 'required|string|max:100|unique:raw_product_batches,batch_code,' . $batch->id,
            'supplier_id' => 'nullable|integer',
            'manufacturing_date' => 'nullable|date',
            'expiry_date' => 'nullable|date|after_or_equal:manufacturing_date',
        ]);

        $batch->update($validated);

        return redirect()->back()->with('success', 'Batch updated successfully.');
    }

    public function destroy(RawProductBatch $batch)
    {
        $batch->delete();

        return redirect()->back()->with('success', 'Batch deleted successfully.');
    }
}
