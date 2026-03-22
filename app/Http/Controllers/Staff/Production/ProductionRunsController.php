<?php

namespace App\Http\Controllers\Staff\Production;

use App\Http\Controllers\Controller;
use App\Models\ProductionRun;
use App\Models\ProductionOrderItem;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ProductionRunsController extends Controller
{
    public function index(Request $request)
    {
        $query = ProductionRun::with(['orderItem.productionOrder', 'orderItem.product'])
            ->latest();

        if ($request->search) {
            $query->where('run_number', 'like', '%' . $request->search . '%');
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->date_from && $request->date_to) {
            $query->whereBetween('start_time', [$request->date_from . ' 00:00:00', $request->date_to . ' 23:59:59']);
        }

        $runs = $query->paginate(15)->withQueryString();

        // Load order items (for dropdown)
        $orderItems = ProductionOrderItem::with(['productionOrder', 'product'])
            ->get()
            ->map(fn($i) => [
                'id'           => $i->id,
                'label'        => ($i->productionOrder->order_number ?? '?') . ' — ' . ($i->product->name ?? '?'),
            ]);

        return Inertia::render('Staff/Production/ProductionRuns', [
            'runs'       => $runs,
            'orderItems' => $orderItems,
            'filters'    => $request->only(['search', 'status', 'date_from', 'date_to']),
            'flash'      => [
                'success' => session('success'),
                'error'   => session('error'),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'production_order_item_id' => 'required|exists:production_order_items,id',
            'run_number'               => 'required|string|max:50|unique:production_runs,run_number',
            'start_time'               => 'nullable|date',
            'end_time'                 => 'nullable|date|after_or_equal:start_time',
            'status'                   => 'required|in:scheduled,in_progress,completed',
        ]);

        ProductionRun::create($validated);

        return redirect()->back()->with('success', 'Production Run created successfully.');
    }

    public function update(Request $request, ProductionRun $run)
    {
        $validated = $request->validate([
            'production_order_item_id' => 'required|exists:production_order_items,id',
            'run_number'               => 'required|string|max:50|unique:production_runs,run_number,' . $run->id,
            'start_time'               => 'nullable|date',
            'end_time'                 => 'nullable|date|after_or_equal:start_time',
            'status'                   => 'required|in:scheduled,in_progress,completed',
        ]);

        $run->update($validated);

        return redirect()->back()->with('success', 'Production Run updated successfully.');
    }

    public function destroy(ProductionRun $run)
    {
        $run->delete();

        return redirect()->back()->with('success', 'Production Run deleted successfully.');
    }
}
