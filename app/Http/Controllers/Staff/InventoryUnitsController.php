<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\RawProductUnit;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryUnitsController extends Controller
{
    public function index(Request $request)
    {
        $query = RawProductUnit::withCount('products')->latest();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $units = $query->paginate(10)->withQueryString();

        $stats = [
            'total' => RawProductUnit::count(),
            'with_products' => RawProductUnit::has('products')->count(),
        ];

        return Inertia::render('Staff/Inventory/Units', [
            'units' => $units,
            'stats' => $stats,
            'filters' => $request->only(['search'])
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150|unique:raw_product_units,name',
            'description' => 'nullable|string'
        ]);

        RawProductUnit::create($validated);

        return redirect()->back()->with('success', 'Unit created successfully.');
    }

    public function update(Request $request, RawProductUnit $unit)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150|unique:raw_product_units,name,' . $unit->id,
            'description' => 'nullable|string'
        ]);

        $unit->update($validated);

        return redirect()->back()->with('success', 'Unit updated successfully.');
    }

    public function destroy(RawProductUnit $unit)
    {
        if ($unit->products()->count() > 0) {
            return redirect()->back()->withErrors(['unit' => 'Cannot delete a unit that has products attached to it.']);
        }
        
        $unit->delete();

        return redirect()->back()->with('success', 'Unit deleted successfully.');
    }
}
