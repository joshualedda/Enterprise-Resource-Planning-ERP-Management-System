<?php

namespace App\Http\Controllers\Staff\Accounting;

use App\Http\Controllers\Controller;
use App\Models\JournalEntry;
use App\Models\JournalEntryLine;
use App\Models\ChartOfAccount;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class JournalEntryController extends Controller
{
    public function index(Request $request)
    {
        $query = JournalEntry::with(['lines.account', 'user'])->latest('id');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('entry_number', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('reference', 'like', "%{$search}%");
            });
        }

        $entries = $query->paginate(10)->withQueryString();

        $stats = [
            'total_entries' => JournalEntry::count(),
            'total_debit' => JournalEntryLine::sum('debit'),
            'total_credit' => JournalEntryLine::sum('credit'),
            'this_month' => JournalEntry::whereMonth('entry_date', now()->month)
                                        ->whereYear('entry_date', now()->year)->count(),
        ];

        return Inertia::render('Staff/Accounting/JournalEntries', [
            'entries' => $entries,
            'stats'   => $stats,
            'filters' => $request->only(['search']),
            'accounts' => ChartOfAccount::where('is_active', true)->orderBy('account_code')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'entry_number' => 'required|string|max:50|unique:journal_entries,entry_number',
            'entry_date'   => 'required|date',
            'reference'    => 'nullable|string|max:100',
            'description'  => 'nullable|string',
            'lines'        => 'required|array|min:2',
            'lines.*.account_id' => 'required|exists:chart_of_accounts,id',
            'lines.*.debit'      => 'required|numeric|min:0',
            'lines.*.credit'     => 'required|numeric|min:0',
        ]);

        $totalDebit = collect($request->lines)->sum('debit');
        $totalCredit = collect($request->lines)->sum('credit');

        if (abs($totalDebit - $totalCredit) > 0.01) {
            return redirect()->back()->withErrors(['lines' => 'Debits must equal Credits to balance the entry.']);
        }

        if ($totalDebit == 0 && $totalCredit == 0) {
            return redirect()->back()->withErrors(['lines' => 'Journal entry cannot be zero value.']);
        }

        DB::beginTransaction();
        try {
            $entry = JournalEntry::create([
                'entry_number' => $validated['entry_number'],
                'entry_date'   => $validated['entry_date'],
                'reference'    => $validated['reference'],
                'description'  => $validated['description'],
                'posted_by'    => Auth::id(),
            ]);

            foreach ($validated['lines'] as $line) {
                $entry->lines()->create([
                    'account_id' => $line['account_id'],
                    'debit'      => $line['debit'],
                    'credit'     => $line['credit'],
                ]);
            }

            DB::commit();
            return redirect()->back()->with('success', 'Journal Entry posted successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Failed to save Journal Entry: ' . $e->getMessage()]);
        }
    }

    public function update(Request $request, $id)
    {
        $entry = JournalEntry::findOrFail($id);

        $validated = $request->validate([
            'entry_number' => 'required|string|max:50|unique:journal_entries,entry_number,' . $entry->id,
            'entry_date'   => 'required|date',
            'reference'    => 'nullable|string|max:100',
            'description'  => 'nullable|string',
            'lines'        => 'required|array|min:2',
            'lines.*.account_id' => 'required|exists:chart_of_accounts,id',
            'lines.*.debit'      => 'required|numeric|min:0',
            'lines.*.credit'     => 'required|numeric|min:0',
        ]);

        $totalDebit = collect($request->lines)->sum('debit');
        $totalCredit = collect($request->lines)->sum('credit');

        if (abs($totalDebit - $totalCredit) > 0.01) {
            return redirect()->back()->withErrors(['lines' => 'Debits must equal Credits to balance the entry.']);
        }

        if ($totalDebit == 0 && $totalCredit == 0) {
            return redirect()->back()->withErrors(['lines' => 'Journal entry cannot be zero value.']);
        }

        DB::beginTransaction();
        try {
            $entry->update([
                'entry_number' => $validated['entry_number'],
                'entry_date'   => $validated['entry_date'],
                'reference'    => $validated['reference'],
                'description'  => $validated['description'],
            ]);

            $entry->lines()->delete();

            foreach ($validated['lines'] as $line) {
                $entry->lines()->create([
                    'account_id' => $line['account_id'],
                    'debit'      => $line['debit'],
                    'credit'     => $line['credit'],
                ]);
            }

            DB::commit();
            return redirect()->back()->with('success', 'Journal Entry updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Failed to update Journal Entry: ' . $e->getMessage()]);
        }
    }

    public function destroy($id)
    {
        $entry = JournalEntry::findOrFail($id);
        $entry->delete();

        return redirect()->back()->with('success', 'Journal Entry deleted successfully.');
    }
}
