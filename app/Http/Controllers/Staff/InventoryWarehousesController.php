<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryWarehousesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Warehouse::query();

        // Optional filtering
        $search = $request->input('search');
        if ($search) {
            $query->where('name', 'like', '%' . $search . '%')
                  ->orWhere('code', 'like', '%' . $search . '%');
        }

        // Sorting
        $query->orderBy('name', 'asc');

        $warehouses = $query->paginate(10)->withQueryString();

        $stats = [
            'total' => Warehouse::count(),
        ];

        return Inertia::render('Staff/Inventory/Warehouses', [
            'warehouses' => $warehouses,
            'stats' => $stats,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'code' => 'nullable|string|max:50',
            'location' => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ]);

        Warehouse::create($validated);

        return redirect()->back()->with('success', 'Warehouse created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $warehouse = Warehouse::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'code' => 'nullable|string|max:50',
            'location' => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ]);

        $warehouse->update($validated);

        return redirect()->back()->with('success', 'Warehouse updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $warehouse = Warehouse::findOrFail($id);

        // Optional: you can add a check here if the warehouse is in use.
        // For now, we allow deletion.

        $warehouse->delete();

        return redirect()->back()->with('success', 'Warehouse deleted successfully.');
    }
}
