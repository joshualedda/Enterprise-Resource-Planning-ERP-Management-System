<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\RawProduct;
use App\Models\RawProductCategory;
use App\Models\RawProductUnit;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryProductsController extends Controller
{
    public function index(Request $request)
    {
        $query = RawProduct::with(['category', 'unit'])->latest();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhereHas('category', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('category') && $request->category !== 'All') {
            $query->whereHas('category', function ($q) use ($request) {
                $q->where('name', $request->category);
            });
        }

        if ($request->filled('unit') && $request->unit !== 'All') {
            $query->whereHas('unit', function ($q) use ($request) {
                $q->where('name', $request->unit);
            });
        }

        $products = $query->paginate(10)->withQueryString();

        $stats = [
            'total' => RawProduct::count(),
            'active' => RawProduct::where('is_active', true)->count(),
            'archived' => RawProduct::where('is_active', false)->count(),
            'low_stock' => 0, // Implement real low stock logic later if needed
        ];

        return Inertia::render('Staff/Inventory/AllProducts', [
            'products' => $products,
            'categories' => RawProductCategory::all(),
            'units' => RawProductUnit::all(),
            'stats' => $stats,
            'filters' => $request->only(['search', 'category', 'unit'])
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'nullable|string|max:100|unique:raw_products,sku',
            'category_id' => 'nullable|exists:raw_product_categories,id',
            'unit_id' => 'nullable|exists:raw_product_units,id',
            'product_type' => 'required|in:raw_material,wip,finished_good,supply',
            'description' => 'nullable|string',
            'cost_price' => 'nullable|numeric|min:0',
            'selling_price' => 'nullable|numeric|min:0',
            'reorder_level' => 'nullable|integer|min:0',
            'is_active' => 'boolean'
        ]);

        RawProduct::create($validated);

        return redirect()->back()->with('success', 'Product created successfully.');
    }

    public function update(Request $request, RawProduct $product)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'nullable|string|max:100|unique:raw_products,sku,' . $product->id,
            'category_id' => 'nullable|exists:raw_product_categories,id',
            'unit_id' => 'nullable|exists:raw_product_units,id',
            'product_type' => 'required|in:raw_material,wip,finished_good,supply',
            'description' => 'nullable|string',
            'cost_price' => 'nullable|numeric|min:0',
            'selling_price' => 'nullable|numeric|min:0',
            'reorder_level' => 'nullable|integer|min:0',
            'is_active' => 'boolean'
        ]);

        $product->update($validated);

        return redirect()->back()->with('success', 'Product updated successfully.');
    }

    public function destroy(RawProduct $product)
    {
        $product->delete();

        return redirect()->back()->with('success', 'Product deleted successfully.');
    }
}
