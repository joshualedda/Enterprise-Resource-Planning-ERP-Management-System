<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\Warehouse;
use App\Models\WarehouseLocation;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryWarehouseLocationsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = WarehouseLocation::with('warehouse');

        // Search filtering
        $search = $request->input('search');
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', '%' . $search . '%')
                  ->orWhere('description', 'like', '%' . $search . '%')
                  ->orWhereHas('warehouse', function ($wh) use ($search) {
                      $wh->where('name', 'like', '%' . $search . '%');
                  });
            });
        }

        // Warehouse filtering
        $warehouseId = $request->input('warehouse_id');
        if ($warehouseId) {
            $query->where('warehouse_id', $warehouseId);
        }

        $locations = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('Staff/Inventory/WarehouseLocation', [
            'locations' => $locations,
            'warehouses' => Warehouse::orderBy('name')->get(['id', 'name', 'code']),
            'filters' => $request->only(['search', 'warehouse_id']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'warehouse_id' => 'required|exists:warehouses,id',
            'code' => 'nullable|string|max:100',
            'description' => 'nullable|string',
        ]);

        WarehouseLocation::create($validated);

        return redirect()->back()->with('success', 'Warehouse location created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $location = WarehouseLocation::findOrFail($id);

        $validated = $request->validate([
            'warehouse_id' => 'required|exists:warehouses,id',
            'code' => 'nullable|string|max:100',
            'description' => 'nullable|string',
        ]);

        $location->update($validated);

        return redirect()->back()->with('success', 'Warehouse location updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $location = WarehouseLocation::findOrFail($id);
        $location->delete();

        return redirect()->back()->with('success', 'Warehouse location deleted successfully.');
    }
}
