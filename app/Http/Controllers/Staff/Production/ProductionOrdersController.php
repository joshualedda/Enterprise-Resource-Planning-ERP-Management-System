<?php

namespace App\Http\Controllers\Staff\Production;

use App\Http\Controllers\Controller;
use App\Models\ProductionOrder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ProductionOrdersController extends Controller
{
    public function index(Request $request)
    {
        $query = ProductionOrder::with(['items.product']);

        if ($request->search) {
            $query->where('order_number', 'like', '%' . $request->search . '%');
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->date_from && $request->date_to) {
            $query->whereBetween('order_date', [$request->date_from, $request->date_to]);
        }

        $orders = $query->latest('order_date')->paginate(15)->withQueryString();

        return Inertia::render('Staff/Production/ProductionOrders', [
            'orders' => $orders,
            'products' => \App\Models\RawProduct::where('is_active', true)->get(['id', 'name']),
            'filters' => $request->only(['search', 'status', 'date_from', 'date_to']),
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'order_number' => 'required|string|unique:production_orders,order_number',
            'status' => 'required|in:planned,in_progress,completed,cancelled',
            'order_date' => 'required|date',
            'scheduled_start_date' => 'nullable|date',
            'scheduled_end_date' => 'nullable|date',
            'items' => 'required|array|min:1',
            'items.*.raw_product_id' => 'required|exists:raw_products,id',
            'items.*.quantity' => 'required|numeric|min:0',
            'items.*.uom' => 'required|string|max:20',
        ]);

        DB::transaction(function () use ($validated) {
            $orderData = collect($validated)->except('items')->toArray();
            $order = ProductionOrder::create($orderData);

            foreach ($validated['items'] as $item) {
                $order->items()->create($item);
            }
        });

        return redirect()->back()->with('success', 'Production Order created successfully.');
    }

    public function update(Request $request, ProductionOrder $order)
    {
        $validated = $request->validate([
            'order_number' => 'required|string|unique:production_orders,order_number,' . $order->id,
            'status' => 'required|in:planned,in_progress,completed,cancelled',
            'order_date' => 'required|date',
            'scheduled_start_date' => 'nullable|date',
            'scheduled_end_date' => 'nullable|date',
            'actual_start_date' => 'nullable|date',
            'actual_end_date' => 'nullable|date',
            'items' => 'required|array|min:1',
            'items.*.id' => 'nullable|exists:production_order_items,id',
            'items.*.raw_product_id' => 'required|exists:raw_products,id',
            'items.*.quantity' => 'required|numeric|min:0',
            'items.*.uom' => 'required|string|max:20',
            'items.*.status' => 'required|in:pending,issued,produced',
        ]);

        DB::transaction(function () use ($validated, $order) {
            $orderData = collect($validated)->except('items')->toArray();
            $order->update($orderData);

            $itemIds = collect($validated['items'])->pluck('id')->filter()->toArray();
            $order->items()->whereNotIn('id', $itemIds)->delete();

            foreach ($validated['items'] as $itemData) {
                if (!empty($itemData['id'])) {
                    $order->items()->where('id', $itemData['id'])->update($itemData);
                } else {
                    $order->items()->create($itemData);
                }
            }
        });

        return redirect()->back()->with('success', 'Production Order updated successfully.');
    }

    public function destroy(ProductionOrder $order)
    {
        DB::transaction(function () use ($order) {
            $order->items()->delete();
            $order->delete();
        });

        return redirect()->back()->with('success', 'Production Order deleted successfully.');
    }
}
