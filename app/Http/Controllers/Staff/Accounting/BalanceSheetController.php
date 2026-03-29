<?php

namespace App\Http\Controllers\Staff\Accounting;

use App\Http\Controllers\Controller;
use App\Models\ChartOfAccount;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class BalanceSheetController extends Controller
{
    public function index(Request $request)
    {
        $asOfDate = $request->query('as_of', Carbon::now()->toDateString());

        // Load all active accounts with their transactions up to the as_of date
        $accounts = ChartOfAccount::where('is_active', true)
            ->with(['lines' => function($q) use ($asOfDate) {
                $q->whereHas('journalEntry', function($jeQuery) use ($asOfDate) {
                    $jeQuery->where('entry_date', '<=', $asOfDate);
                });
            }])
            ->get();

        $assets = [];
        $liabilities = [];
        $equity = [];
        
        $totalAssets = 0;
        $totalLiabilities = 0;
        $totalEquity = 0;

        foreach ($accounts as $account) {
            $debitSum = $account->lines->sum('debit');
            $creditSum = $account->lines->sum('credit');
            $balance = 0;

            if ($account->account_type === 'asset') {
                $balance = $debitSum - $creditSum;
                if (round($balance, 2) != 0) {
                    $assets[] = [
                        'code' => $account->account_code,
                        'name' => $account->account_name,
                        'balance' => round($balance, 2),
                    ];
                    $totalAssets += $balance;
                }
            } elseif ($account->account_type === 'liability') {
                $balance = $creditSum - $debitSum;
                if (round($balance, 2) != 0) {
                    $liabilities[] = [
                        'code' => $account->account_code,
                        'name' => $account->account_name,
                        'balance' => round($balance, 2),
                    ];
                    $totalLiabilities += $balance;
                }
            } elseif ($account->account_type === 'equity') {
                $balance = $creditSum - $debitSum;
                if (round($balance, 2) != 0) {
                    $equity[] = [
                        'code' => $account->account_code,
                        'name' => $account->account_name,
                        'balance' => round($balance, 2),
                    ];
                    $totalEquity += $balance;
                }
            }
        }

        // Calculate Net Income to force balancing (Retained Earnings/Current Profit)
        // We need all Income and Expense accounts up to this date
        $incomeAccounts = ChartOfAccount::whereIn('account_type', ['income', 'expense'])
            ->with(['lines' => function($q) use ($asOfDate) {
                $q->whereHas('journalEntry', function($jeQuery) use ($asOfDate) {
                    $jeQuery->where('entry_date', '<=', $asOfDate);
                });
            }])
            ->get();

        $totalIncome = 0;
        $totalExpense = 0;

        foreach ($incomeAccounts as $acc) {
            $d = $acc->lines->sum('debit');
            $c = $acc->lines->sum('credit');
            if ($acc->account_type === 'income') {
                $totalIncome += ($c - $d);
            } else {
                $totalExpense += ($d - $c);
            }
        }

        $netIncome = $totalIncome - $totalExpense;

        // Add Net Income to Equity section if it's non-zero
        if (round($netIncome, 2) != 0) {
            $equity[] = [
                'code' => 'RE-999',
                'name' => 'Current Period Net Profit / (Loss)',
                'balance' => round($netIncome, 2),
            ];
            $totalEquity += $netIncome;
        }

        return Inertia::render('Staff/Accounting/BalanceSheet', [
            'assets' => $assets,
            'liabilities' => $liabilities,
            'equity' => $equity,
            'totalAssets' => round($totalAssets, 2),
            'totalLiabilities' => round($totalLiabilities, 2),
            'totalEquity' => round($totalEquity, 2),
            'totalLiabilitiesEquity' => round($totalLiabilities + $totalEquity, 2),
            'filters' => [
                'as_of' => $asOfDate,
            ]
        ]);
    }
}
