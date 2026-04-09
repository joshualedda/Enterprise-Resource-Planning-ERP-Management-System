<?php

namespace App\Http\Controllers\Staff\Accounting;

use App\Http\Controllers\Controller;
use App\Models\CustomerPayment;
use App\Models\Transaction;
use App\Models\ChartOfAccount;
use App\Models\JournalEntry;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class CustomerPaymentController extends Controller
{
    public function index(Request $request)
    {
        $query = CustomerPayment::with(['transaction', 'customer', 'journalEntry.lines'])->latest('id');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('reference', 'like', "%{$search}%")
                  ->orWhere('payment_method', 'like', "%{$search}%")
                  ->orWhereHas('customer', function($c) use ($search) {
                      $c->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('transaction', function($t) use ($search) {
                      $t->where('reference_no', 'like', "%{$search}%");
                  });
            });
        }

        $payments = $query->paginate(10)->withQueryString();

        $stats = [
            'total_payments' => CustomerPayment::count(),
            'total_amount' => CustomerPayment::sum('amount'),
            'this_month_count' => CustomerPayment::whereMonth('payment_date', now()->month)
                                                 ->whereYear('payment_date', now()->year)->count(),
            'this_month_amount' => CustomerPayment::whereMonth('payment_date', now()->month)
                                                  ->whereYear('payment_date', now()->year)->sum('amount'),
        ];

        // Fetch dependent data for forms
        $accounts = ChartOfAccount::where('is_active', true)->orderBy('account_code')->get();
        // Load partial transaction list
        $transactions = Transaction::with('user')->orderBy('id', 'desc')->take(200)->get();

        return Inertia::render('Staff/Accounting/CustomerPayments', [
            'payments' => $payments,
            'stats'    => $stats,
            'filters'  => $request->only(['search']),
            'accounts' => $accounts,
            'transactions' => $transactions,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'transaction_id' => 'required|exists:transactions,id',
            'payment_date'   => 'required|date',
            'amount'         => 'required|numeric|min:0.01',
            'payment_method' => 'nullable|string|max:50',
            'reference'      => 'nullable|string|max:100',
            'debit_account_id'  => 'required|exists:chart_of_accounts,id',
            'credit_account_id' => 'required|exists:chart_of_accounts,id',
        ]);

        $transaction = Transaction::findOrFail($validated['transaction_id']);

        DB::beginTransaction();

        try {
            // Create Journal Entry First
            $je = JournalEntry::create([
                'entry_number' => 'CP-' . strtoupper(uniqid()), // auto-generate entry number
                'entry_date'   => $validated['payment_date'],
                'reference'    => $validated['reference'] ?? 'Payment for Trans#' . $transaction->reference_no,
                'description'  => 'Customer Payment Receipt. TransRef: ' . $transaction->reference_no,
                'posted_by'    => Auth::id(),
            ]);

            // Insert Journal Entry Lines
            $je->lines()->create([
                'account_id' => $validated['debit_account_id'],
                'debit'      => $validated['amount'],
                'credit'     => 0,
            ]);
            $je->lines()->create([
                'account_id' => $validated['credit_account_id'],
                'debit'      => 0,
                'credit'     => $validated['amount'],
            ]);

            // Create Customer Payment Mapping
            CustomerPayment::create([
                'transaction_id' => $transaction->id,
                'journal_entry_id' => $je->id,
                'customer_id'    => $transaction->user_id, // Map strictly to the user attached to transaction
                'payment_date'   => $validated['payment_date'],
                'amount'         => $validated['amount'],
                'payment_method' => $validated['payment_method'],
                'reference'      => $validated['reference'],
            ]);

            DB::commit();
            return redirect()->back()->with('success', 'Customer Payment logged successfully with its balanced Journal Entry.');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Failed to process payment framework: ' . $e->getMessage()]);
        }
    }

    public function update(Request $request, $id)
    {
        $payment = CustomerPayment::findOrFail($id);
        
        $validated = $request->validate([
            'payment_date'   => 'required|date',
            'amount'         => 'required|numeric|min:0.01',
            'payment_method' => 'nullable|string|max:50',
            'reference'      => 'nullable|string|max:100',
            'debit_account_id'  => 'required|exists:chart_of_accounts,id',
            'credit_account_id' => 'required|exists:chart_of_accounts,id',
        ]);

        DB::beginTransaction();

        try {
            // 1. Update Payment master details
            $payment->update([
                'payment_date'   => $validated['payment_date'],
                'amount'         => $validated['amount'],
                'payment_method' => $validated['payment_method'],
                'reference'      => $validated['reference'],
            ]);

            // 2. Refresh linked Journal Entry
            $je = JournalEntry::findOrFail($payment->journal_entry_id);
            $je->update([
                'entry_date' => $validated['payment_date'],
                'reference'  => $validated['reference'],
            ]);

            // 3. Clear existing debit/credit lines
            $je->lines()->delete();

            // 4. Repost debit/credits with fresh balances
            $je->lines()->create([
                'account_id' => $validated['debit_account_id'],
                'debit'      => $validated['amount'],
                'credit'     => 0,
            ]);
            $je->lines()->create([
                'account_id' => $validated['credit_account_id'],
                'debit'      => 0,
                'credit'     => $validated['amount'],
            ]);

            DB::commit();
            return redirect()->back()->with('success', 'Customer Payment updated effectively, syncing DB ledgers.');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Failed to synchronize payment updates: ' . $e->getMessage()]);
        }
    }

    public function destroy($id)
    {
        $payment = CustomerPayment::findOrFail($id);
        
        // Given cascading FK constraint: deleting the primary Journal Entry
        // flushes the CustomerPayment gracefully without stranding orphan accounting data.
        $je = JournalEntry::findOrFail($payment->journal_entry_id);
        $je->delete(); 

        return redirect()->back()->with('success', 'Payment deleted flawlessly preventing ghost ledgers.');
    }
}
