<?php

namespace App\Http\Controllers\Staff\Accounting;

use App\Http\Controllers\Controller;
use App\Models\ChartOfAccount;
use App\Models\JournalEntryLine;
use App\Models\Transaction;
use App\Models\CustomerPayment;
use App\Models\RawPurchaseOrder;
use App\Models\RawSupplierPayment;
use App\Models\RawProduct;
use App\Models\RawProductStock;
use App\Models\ProductionMaterialIssue;
use App\Models\ProductionOutputPosting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class AccountingDashboardController extends Controller
{
    public function index(Request $request)
    {
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();

        // 1. KPI Stats
        $revenue = $this->getAccountBalanceByType('income', $startOfMonth, $endOfMonth);
        $expenses = $this->getAccountBalanceByType('expense', $startOfMonth, $endOfMonth);
        
        $cashBalance = $this->getAccountBalanceByName(['Cash', 'Bank']);
        $arBalance = $this->getAccountBalanceByName(['Receivable']);
        $apBalance = $this->getAccountBalanceByName(['Payable']);

        // 2. Trend Data (Last 6 Months)
        $trendMonthly = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = $now->copy()->subMonths($i);
            $mStart = $month->copy()->startOfMonth();
            $mEnd = $month->copy()->endOfMonth();
            
            $rev = $this->getAccountBalanceByType('income', $mStart, $mEnd);
            $exp = $this->getAccountBalanceByType('expense', $mStart, $mEnd);
            
            $trendMonthly[] = [
                'period' => $month->format('M'),
                'revenue' => round($rev, 2),
                'expenses' => round($exp, 2),
                'profit' => round($rev - $exp, 2),
            ];
        }

        // 3. Category Breakdowns
        $incomeBreakdown = ChartOfAccount::where('account_type', 'income')
            ->withSum(['lines as balance' => function($q) use ($startOfMonth, $endOfMonth) {
                $q->whereHas('journalEntry', function($je) use ($startOfMonth, $endOfMonth) {
                    $je->whereBetween('entry_date', [$startOfMonth, $endOfMonth]);
                });
            }], 'credit') // Income increases on credit
            ->get()
            ->map(fn($a) => [
                'label' => $a->account_name,
                'value' => (float)$a->balance,
                'color' => $this->getRandomColor($a->id)
            ])
            ->where('value', '>', 0)
            ->values();

        $expenseBreakdown = ChartOfAccount::where('account_type', 'expense')
            ->withSum(['lines as balance' => function($q) use ($startOfMonth, $endOfMonth) {
                $q->whereHas('journalEntry', function($je) use ($startOfMonth, $endOfMonth) {
                    $je->whereBetween('entry_date', [$startOfMonth, $endOfMonth]);
                });
            }], 'debit') // Expenses increase on debit
            ->orderByDesc('balance')
            ->take(5)
            ->get()
            ->map(fn($a) => [
                'label' => $a->account_name,
                'value' => (float)$a->balance,
                'color' => $this->getRandomColor($a->id + 100)
            ])
            ->where('value', '>', 0)
            ->values();

        // 4. Accounts Receivable (Recent Transactions with Balance)
        $arRows = Transaction::with('user')
            ->where('status', '!=', 'cancelled')
            ->latest()
            ->take(5)
            ->get()
            ->map(function($t) use ($now) {
                $paid = CustomerPayment::where('transaction_id', $t->id)->sum('amount');
                $due = Carbon::parse($t->created_at)->addDays(14);
                return [
                    'inv' => $t->reference_no,
                    'customer' => ($t->user->first_name ?? 'N/A') . ' ' . ($t->user->last_name ?? ''),
                    'amount' => (float)$t->total_amount - $paid,
                    'due' => $due->toDateString(),
                    'overdue' => $now->diffInDays($due, false) * -1,
                ];
            })
            ->where('amount', '>', 0)
            ->values();

        // 5. Accounts Payable (Recent POs with Balance)
        $apRows = RawPurchaseOrder::with('supplier')
            ->latest()
            ->take(5)
            ->get()
            ->map(function($po) use ($now) {
                $total = $po->items->sum(fn($item) => $item->quantity * $item->unit_cost);
                $paid = RawSupplierPayment::where('purchase_order_id', $po->id)->sum('amount');
                $due = Carbon::parse($po->order_date)->addDays(30);
                return [
                    'bill' => $po->order_number,
                    'supplier' => $po->supplier->name,
                    'amount' => (float)$total - $paid,
                    'due' => $due->toDateString(),
                    'overdue' => $now->diffInDays($due, false) * -1,
                ];
            })
            ->where('amount', '>', 0)
            ->values();

        // 6. Inventory Snapshot (Valuation)
        $rawMaterialValue = 0;
        $rawProducts = RawProduct::all();
        foreach ($rawProducts as $rp) {
            $stock = RawProductStock::where('product_id', $rp->id)->sum('quantity_on_hand');
            $rawMaterialValue += ($stock * $rp->cost_price);
        }

        $inventorySnapshot = [
            [
                'label' => 'Total Raw Materials',
                'value' => (float)$rawMaterialValue,
                'color' => '#10b981',
                'icon' => 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
            ],
            // You can add more categories here as they are defined in your system
        ];

        return Inertia::render('Staff/Accounting/Dashboard', [
            'stats' => [
                'revenue_month' => round($revenue, 2),
                'expenses_month' => round($expenses, 2),
                'net_profit' => round($revenue - $expenses, 2),
                'cash_balance' => round($cashBalance, 2),
                'accounts_receivable' => round($arBalance, 2),
                'accounts_payable' => round($apBalance, 2),
            ],
            'trend_monthly' => $trendMonthly,
            'income_breakdown' => $incomeBreakdown,
            'expense_breakdown' => $expenseBreakdown,
            'ar_rows' => $arRows,
            'ap_rows' => $apRows,
            'inventory_snapshot' => $inventorySnapshot,
        ]);
    }

    private function getAccountBalanceByType($type, $start, $end)
    {
        $accounts = ChartOfAccount::where('account_type', $type)->get();
        $total = 0;
        foreach ($accounts as $acc) {
            $lines = JournalEntryLine::where('account_id', $acc->id)
                ->whereHas('journalEntry', function($q) use ($start, $end) {
                    $q->whereBetween('entry_date', [$start, $end]);
                })->get();
            
            if ($type === 'income') {
                $total += ($lines->sum('credit') - $lines->sum('debit'));
            } else {
                $total += ($lines->sum('debit') - $lines->sum('credit'));
            }
        }
        return $total;
    }

    private function getAccountBalanceByName($keywords)
    {
        $total = 0;
        foreach ($keywords as $word) {
            $accounts = ChartOfAccount::where('account_name', 'like', "%{$word}%")->get();
            foreach ($accounts as $acc) {
                $lines = JournalEntryLine::where('account_id', $acc->id)->get();
                if ($acc->normal_balance === 'debit') {
                    $total += ($lines->sum('debit') - $lines->sum('credit'));
                } else {
                    $total += ($lines->sum('credit') - $lines->sum('debit'));
                }
            }
        }
        return $total;
    }

    private function getRandomColor($id)
    {
        $colors = ['#10b981', '#6366f1', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4', '#ec4899'];
        return $colors[$id % count($colors)];
    }
}
