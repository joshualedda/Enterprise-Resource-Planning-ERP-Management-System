<?php

namespace App\Http\Controllers\Staff\Accounting;

use App\Http\Controllers\Controller;
use App\Models\ChartOfAccount;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ChartOfAccountController extends Controller
{
    public function index(Request $request)
    {
        $query = ChartOfAccount::query();

        // Filters
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('account_code', 'like', "%{$search}%")
                  ->orWhere('account_name', 'like', "%{$search}%");
            });
        }

        if ($request->filled('account_type') && $request->account_type !== 'All') {
            $query->where('account_type', $request->account_type);
        }

        if ($request->filled('status') && $request->status !== 'All') {
            $query->where('is_active', $request->status === 'active');
        }

        $accounts = $query->latest('id')->paginate(10)->withQueryString();

        // KPI Stats
        $stats = [
            'total'       => ChartOfAccount::count(),
            'assets'      => ChartOfAccount::where('account_type', 'asset')->count(),
            'liabilities' => ChartOfAccount::where('account_type', 'liability')->count(),
            'income'      => ChartOfAccount::where('account_type', 'income')->count(),
            'expenses'    => ChartOfAccount::where('account_type', 'expense')->count(),
            'active'      => ChartOfAccount::where('is_active', true)->count(),
        ];

        return Inertia::render('Staff/Accounting/ChartAccount', [
            'accounts' => $accounts,
            'stats'    => $stats,
            'filters'  => $request->only(['search', 'account_type', 'status']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'account_code'   => 'required|string|max:20|unique:chart_of_accounts,account_code',
            'account_name'   => 'required|string|max:100',
            'account_type'   => 'required|string|in:asset,liability,equity,income,expense',
            'normal_balance' => 'required|string|in:debit,credit',
            'is_active'      => 'boolean',
        ]);

        ChartOfAccount::create($validated);

        return redirect()->back()->with('success', 'Account created successfully.');
    }

    public function update(Request $request, $id)
    {
        $chartOfAccount = ChartOfAccount::findOrFail($id);

        $validated = $request->validate([
            'account_code'   => 'required|string|max:20|unique:chart_of_accounts,account_code,' . $chartOfAccount->id,
            'account_name'   => 'required|string|max:100',
            'account_type'   => 'required|string|in:asset,liability,equity,income,expense',
            'normal_balance' => 'required|string|in:debit,credit',
            'is_active'      => 'boolean',
        ]);

        $chartOfAccount->update($validated);

        return redirect()->back()->with('success', 'Account updated successfully.');
    }

    public function destroy($id)
    {
        $chartOfAccount = ChartOfAccount::findOrFail($id);
        $chartOfAccount->delete();

        return redirect()->back()->with('success', 'Account deleted successfully.');
    }
}
