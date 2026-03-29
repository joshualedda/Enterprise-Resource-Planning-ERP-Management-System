<?php

namespace App\Http\Controllers\Staff\Accounting;

use App\Http\Controllers\Controller;
use App\Models\RawSupplierPayment;
use App\Models\RawProductSupplier;
use App\Models\RawPurchaseOrder;
use App\Models\ChartOfAccount;
use App\Models\JournalEntry;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class SupplierPaymentController extends Controller
{
    public function index(Request $request)
    {
        $query = RawSupplierPayment::with(['supplier', 'purchaseOrder', 'journalEntry.lines'])->latest('id');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('reference', 'like', "%{$search}%")
                  ->orWhere('payment_method', 'like', "%{$search}%")
                  ->orWhereHas('supplier', function($s) use ($search) {
                      $s->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $payments = $query->paginate(10)->withQueryString();

        $stats = [
            'total_payments' => RawSupplierPayment::count(),
            'total_amount' => RawSupplierPayment::sum('amount'),
            'this_month_count' => RawSupplierPayment::whereMonth('payment_date', now()->month)
                                                    ->whereYear('payment_date', now()->year)->count(),
            'this_month_amount' => RawSupplierPayment::whereMonth('payment_date', now()->month)
                                                     ->whereYear('payment_date', now()->year)->sum('amount'),
        ];

        // Fetch dependent data for forms
        $accounts = ChartOfAccount::where('is_active', true)->orderBy('account_code')->get();
        $suppliers = RawProductSupplier::orderBy('name')->get();
        // Load POs safely
        $purchase_orders = RawPurchaseOrder::orderBy('id', 'desc')->take(200)->get();

        return Inertia::render('Staff/Accounting/SupplierPayments', [
            'payments' => $payments,
            'stats'    => $stats,
            'filters'  => $request->only(['search']),
            'accounts' => $accounts,
            'suppliers' => $suppliers,
            'purchase_orders' => $purchase_orders,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_supplier_id' => 'required|exists:raw_product_suppliers,id',
            'purchase_order_id'   => 'nullable|exists:raw_purchase_orders,id',
            'payment_date'   => 'required|date',
            'amount'         => 'required|numeric|min:0.01',
            'payment_method' => 'nullable|string|max:50',
            'reference'      => 'nullable|string|max:100',
            'debit_account_id'  => 'required|exists:chart_of_accounts,id',
            'credit_account_id' => 'required|exists:chart_of_accounts,id',
        ]);

        $supplier = RawProductSupplier::findOrFail($validated['product_supplier_id']);
        
        $refStr = $validated['reference'] ?? 'Payment to Supplier';
        if (!empty($validated['purchase_order_id'])) {
            $po = RawPurchaseOrder::find($validated['purchase_order_id']);
            $refStr .= ' (PO: ' . $po->order_number . ')';
        }

        DB::beginTransaction();

        try {
            // Create Journal Entry First
            $je = JournalEntry::create([
                'entry_number' => 'SP-' . strtoupper(uniqid()), // auto-generate entry number
                'entry_date'   => $validated['payment_date'],
                'reference'    => $validated['reference'] ?? 'Supplier Disbursement',
                'description'  => 'Disbursement to ' . $supplier->name . '. ' . $refStr,
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

            // Create Supplier Payment Mapping
            RawSupplierPayment::create([
                'product_supplier_id' => $validated['product_supplier_id'],
                'purchase_order_id'   => $validated['purchase_order_id'] ?? null,
                'journal_entry_id'    => $je->id,
                'payment_date'        => $validated['payment_date'],
                'amount'              => $validated['amount'],
                'payment_method'      => $validated['payment_method'],
                'reference'           => $validated['reference'],
            ]);

            DB::commit();
            return redirect()->back()->with('success', 'Supplier Payment disbursed successfully with its balanced Journal Entry.');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Failed to process payment framework: ' . $e->getMessage()]);
        }
    }

    public function update(Request $request, $id)
    {
        $payment = RawSupplierPayment::findOrFail($id);
        
        $validated = $request->validate([
            'product_supplier_id' => 'required|exists:raw_product_suppliers,id',
            'purchase_order_id'   => 'nullable|exists:raw_purchase_orders,id',
            'payment_date'   => 'required|date',
            'amount'         => 'required|numeric|min:0.01',
            'payment_method' => 'nullable|string|max:50',
            'reference'      => 'nullable|string|max:100',
            'debit_account_id'  => 'required|exists:chart_of_accounts,id',
            'credit_account_id' => 'required|exists:chart_of_accounts,id',
        ]);

        DB::beginTransaction();

        try {
            $payment->update([
                'product_supplier_id' => $validated['product_supplier_id'],
                'purchase_order_id'   => $validated['purchase_order_id'] ?? null,
                'payment_date'   => $validated['payment_date'],
                'amount'         => $validated['amount'],
                'payment_method' => $validated['payment_method'],
                'reference'      => $validated['reference'],
            ]);

            // Refresh linked Journal Entry
            $je = JournalEntry::findOrFail($payment->journal_entry_id);
            $je->update([
                'entry_date' => $validated['payment_date'],
                'reference'  => $validated['reference'],
            ]);

            // Clear existing debit/credit lines & Recreate
            $je->lines()->delete();

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
            return redirect()->back()->with('success', 'Supplier Payment updated effectively, syncing DB ledgers.');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Failed to synchronize payment updates: ' . $e->getMessage()]);
        }
    }

    public function destroy($id)
    {
        $payment = RawSupplierPayment::findOrFail($id);
        
        // Deleting the primary Journal Entry cascades and deletes the SupplierPayment 
        $je = JournalEntry::findOrFail($payment->journal_entry_id);
        $je->delete(); 

        return redirect()->back()->with('success', 'Supplier Payment deleted flawlessly preventing ghost ledgers.');
    }
}
