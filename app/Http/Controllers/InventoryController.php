<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Inventory; // Huwag kalimutan i-import ito
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class InventoryController extends Controller
{
public function index()
{
    // Eager load the 'inventory' relationship
    $inventory = Product::with(['category', 'inventory'])->get();

    return Inertia::render('Inventory/Index', [
        'inventory' => $inventory
    ]);
}
public function adjust(Request $request)
{
    $validated = $request->validate([
        'product_id'   => 'required|exists:products,id',
        'quantity'     => 'required|integer|min:0',
        'type'         => 'required|in:in,out',
        'batch_code'   => 'nullable|string',
        'restock_date' => 'nullable|date',
        'remarks'      => 'nullable|string'
    ]);

    // Hanapin ang existing inventory record para sa product na ito
    $inventory = Inventory::where('product_id', $validated['product_id'])->first();

    // Kung wala pang record, gawa muna tayo ng default (para hindi mag-error sa math)
    if (!$inventory) {
        $inventory = new Inventory();
        $inventory->product_id = $validated['product_id'];
        $inventory->quantity = 0; 
    }

    // Isagawa ang Math (Inventory Logic)
    if ($validated['type'] === 'in') {
        $inventory->quantity += $validated['quantity'];
    } else {
        // Iwasan mag-negative. Kung mas malaki bawas kaysa stock, i-zero (0) na lang.
        $inventory->quantity = max(0, $inventory->quantity - $validated['quantity']);
    }

    // I-overwrite ang ibang fields (Hindi ito magdadagdag ng bagong row)
    $inventory->batch_code = $validated['batch_code'];
    $inventory->restock_date = $validated['restock_date'];
    $inventory->remarks = $validated['remarks'] ?? 'Updated';
    
    $inventory->save();

    return redirect()->back()->with('message', 'Inventory updated!');
}
}