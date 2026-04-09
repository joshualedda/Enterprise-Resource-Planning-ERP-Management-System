<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\RawProductCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryCategoriesController extends Controller
{
    public function index(Request $request)
    {
        $query = RawProductCategory::withCount('products')->latest();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $categories = $query->paginate(10)->withQueryString();

        $stats = [
            'total' => RawProductCategory::count(),
            'active' => RawProductCategory::count(),
            'archived' => 0,
            'with_products' => RawProductCategory::has('products')->count(),
        ];

        return Inertia::render('Staff/Inventory/Categories', [
            'categories' => $categories,
            'stats' => $stats,
            'filters' => $request->only(['search'])
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150|unique:raw_product_categories,name',
            'description' => 'nullable|string'
        ]);

        RawProductCategory::create($validated);

        return redirect()->back()->with('success', 'Category created successfully.');
    }

    public function update(Request $request, RawProductCategory $category)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150|unique:raw_product_categories,name,' . $category->id,
            'description' => 'nullable|string'
        ]);

        $category->update($validated);

        return redirect()->back()->with('success', 'Category updated successfully.');
    }

    public function destroy(RawProductCategory $category)
    {
        if ($category->products()->count() > 0) {
            return redirect()->back()->withErrors(['category' => 'Cannot delete a category that has products attached to it.']);
        }
        
        $category->delete();

        return redirect()->back()->with('success', 'Category deleted successfully.');
    }
}
