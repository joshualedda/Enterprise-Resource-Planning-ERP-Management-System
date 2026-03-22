<?php

namespace App\Http\Controllers\Staff\Production;

use App\Http\Controllers\Controller;
use App\Models\ProductionOutputPosting;
use App\Models\ProductionRun;
use App\Models\Product;
use App\Models\Inventory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OutputPostingController extends Controller
{
    public function index(Request $request)
    {
        $query = ProductionOutputPosting::with(['run', 'product', 'postedBy'])
            ->latest('posting_date');

        if ($request->search) {
            $query->whereHas('product', fn($q) => $q->where('product', 'like', '%' . $request->search . '%'))
                  ->orWhereHas('run', fn($q) => $q->where('run_number', 'like', '%' . $request->search . '%'));
        }

        if ($request->date_from && $request->date_to) {
            $query->whereBetween('posting_date', [
                $request->date_from . ' 00:00:00',
                $request->date_to . ' 23:59:59',
            ]);
        }

        $postings = $query->paginate(15)->withQueryString();

        $runs = ProductionRun::all()->map(fn($r) => [
            'id'    => $r->id,
            'label' => $r->run_number,
        ]);

        $products = Product::where('status', 'active')
            ->orWhereNull('status')
            ->get(['id', 'product as name']);

        return Inertia::render('Staff/Production/OutputPosting', [
            'postings' => $postings,
            'runs'     => $runs,
            'products' => $products,
            'filters'  => $request->only(['search', 'date_from', 'date_to']),
            'flash'    => [
                'success' => session('success'),
                'error'   => session('error'),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'production_run_id' => 'required|exists:production_runs,id',
            'product_id'        => 'required|exists:products,id',
            'quantity'          => 'required|numeric|min:0.01',
            'uom'               => 'required|string|max:20',
            'posting_date'      => 'nullable|date',
        ]);

        try {
            DB::transaction(function () use ($validated, $request) {
                $data = [
                    'production_run_id' => $validated['production_run_id'],
                    'product_id'        => $validated['product_id'],
                    'quantity'          => $validated['quantity'],
                    'uom'               => $validated['uom'],
                    'posted_by'         => Auth::id(),
                    'posting_date'      => $validated['posting_date'] ?? now(),
                ];

                ProductionOutputPosting::create($data);

                // ── Update product stock (inventories table uses int quantity) ──
                Inventory::create([
                    'product_id' => $validated['product_id'],
                    'quantity'   => (int) round($validated['quantity']),
                    'type'       => 'in',
                    'remarks'    => 'Production output posting',
                ]);
            });
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed: ' . $e->getMessage());
        }

        return redirect()->back()->with('success', 'Output posted and product stock updated.');
    }

    public function update(Request $request, ProductionOutputPosting $outputPosting)
    {
        $validated = $request->validate([
            'production_run_id' => 'required|exists:production_runs,id',
            'product_id'        => 'required|exists:products,id',
            'quantity'          => 'required|numeric|min:0.01',
            'uom'               => 'required|string|max:20',
            'posting_date'      => 'nullable|date',
        ]);

        try {
            DB::transaction(function () use ($validated, $outputPosting) {
                $oldQty       = (int) round($outputPosting->quantity);
                $oldProductId = $outputPosting->product_id;
                $newQty       = (int) round($validated['quantity']);
                $newProductId = $validated['product_id'];

                $outputPosting->update([
                    'production_run_id' => $validated['production_run_id'],
                    'product_id'        => $newProductId,
                    'quantity'          => $validated['quantity'],
                    'uom'               => $validated['uom'],
                    'posting_date'      => $validated['posting_date'] ?? $outputPosting->posting_date,
                ]);

                // Reverse old stock entry
                Inventory::create([
                    'product_id' => $oldProductId,
                    'quantity'   => $oldQty,
                    'type'       => 'out',
                    'remarks'    => 'Production output posting correction (edit)',
                ]);

                // Apply new stock entry
                Inventory::create([
                    'product_id' => $newProductId,
                    'quantity'   => $newQty,
                    'type'       => 'in',
                    'remarks'    => 'Production output posting (edited)',
                ]);
            });
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed: ' . $e->getMessage());
        }

        return redirect()->back()->with('success', 'Output posting updated and stock adjusted.');
    }

    public function destroy(ProductionOutputPosting $outputPosting)
    {
        try {
            DB::transaction(function () use ($outputPosting) {
                // Reverse the stock
                Inventory::create([
                    'product_id' => $outputPosting->product_id,
                    'quantity'   => (int) round($outputPosting->quantity),
                    'type'       => 'out',
                    'remarks'    => 'Production output posting reversed (deleted)',
                ]);

                $outputPosting->delete();
            });
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed: ' . $e->getMessage());
        }

        return redirect()->back()->with('success', 'Output posting deleted and stock reversed.');
    }
}
