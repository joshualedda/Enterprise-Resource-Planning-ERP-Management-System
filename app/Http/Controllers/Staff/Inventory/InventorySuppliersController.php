<?php

namespace App\Http\Controllers\Staff\Inventory;

use App\Http\Controllers\Controller;
use App\Models\RawProductSupplier;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventorySuppliersController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $suppliers = RawProductSupplier::orderBy('name')->paginate(10);
        
        $stats = [
            'total' => RawProductSupplier::count(),
            'recent' => RawProductSupplier::where('created_at', '>=', now()->subDays(30))->count(),
        ];

        return Inertia::render('Staff/Inventory/Suppliers', [
            'suppliers' => $suppliers,
            'stats' => $stats,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'contact_person' => 'nullable|string|max:150',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:150',
            'address' => 'nullable|string',
        ]);

        RawProductSupplier::create($validated);

        return redirect()->back()->with('success', 'Supplier created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, RawProductSupplier $supplier)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'contact_person' => 'nullable|string|max:150',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:150',
            'address' => 'nullable|string',
        ]);

        $supplier->update($validated);

        return redirect()->back()->with('success', 'Supplier updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(RawProductSupplier $supplier)
    {
        $supplier->delete();

        return redirect()->back()->with('success', 'Supplier deleted successfully.');
    }
}
