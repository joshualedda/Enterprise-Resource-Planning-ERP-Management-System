<?php

namespace App\Http\Controllers\Staff\Production;

use App\Http\Controllers\Controller;
use App\Models\ProductionMaterialIssue;
use App\Models\ProductionRun;
use App\Models\RawProduct;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MaterialIssuesController extends Controller
{
    public function index(Request $request)
    {
        $query = ProductionMaterialIssue::with(['run', 'material'])
            ->latest('issue_date');

        if ($request->search) {
            $query->whereHas('material', fn($q) => $q->where('name', 'like', '%' . $request->search . '%'))
                  ->orWhereHas('run', fn($q) => $q->where('run_number', 'like', '%' . $request->search . '%'));
        }

        if ($request->date_from && $request->date_to) {
            $query->whereBetween('issue_date', [$request->date_from . ' 00:00:00', $request->date_to . ' 23:59:59']);
        }

        $issues = $query->paginate(15)->withQueryString();

        $runs = ProductionRun::all()->map(fn($r) => [
            'id'    => $r->id,
            'label' => $r->run_number,
        ]);

        $rawProducts = RawProduct::where('is_active', true)->get(['id', 'name']);

        return Inertia::render('Staff/Production/MaterialIssues', [
            'issues'      => $issues,
            'runs'        => $runs,
            'rawProducts' => $rawProducts,
            'filters'     => $request->only(['search', 'date_from', 'date_to']),
            'flash'       => [
                'success' => session('success'),
                'error'   => session('error'),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'production_run_id' => 'required|exists:production_runs,id',
            'material_id'       => 'required|exists:raw_products,id',
            'quantity'          => 'required|numeric|min:0.01',
            'uom'               => 'required|string|max:20',
            'issue_date'        => 'required|date',
        ]);

        ProductionMaterialIssue::create($validated);

        return redirect()->back()->with('success', 'Material issued successfully.');
    }

    public function update(Request $request, ProductionMaterialIssue $materialIssue)
    {
        $validated = $request->validate([
            'production_run_id' => 'required|exists:production_runs,id',
            'material_id'       => 'required|exists:raw_products,id',
            'quantity'          => 'required|numeric|min:0.01',
            'uom'               => 'required|string|max:20',
            'issue_date'        => 'required|date',
        ]);

        $materialIssue->update($validated);

        return redirect()->back()->with('success', 'Material issue updated successfully.');
    }

    public function destroy(ProductionMaterialIssue $materialIssue)
    {
        $materialIssue->delete();

        return redirect()->back()->with('success', 'Material issue deleted successfully.');
    }
}
