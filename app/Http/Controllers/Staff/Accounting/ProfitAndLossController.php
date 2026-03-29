<?php

namespace App\Http\Controllers\Staff\Accounting;

use App\Http\Controllers\Controller;
use App\Models\ChartOfAccount;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class ProfitAndLossController extends Controller
{
    public function index(Request $request)
    {
        $startDate = $request->query('start_date', Carbon::now()->startOfMonth()->toDateString());
        $endDate = $request->query('end_date', Carbon::now()->endOfMonth()->toDateString());

        // Load income and expense accounts with their scoped journal entry lines
        $accounts = ChartOfAccount::whereIn('account_type', ['income', 'expense'])
            ->where('is_active', true)
            ->with(['lines' => function($q) use ($startDate, $endDate) {
                $q->whereHas('journalEntry', function($jeQuery) use ($startDate, $endDate) {
                    $jeQuery->whereBetween('entry_date', [$startDate, $endDate]);
                });
            }])
            ->orderBy('account_code')
            ->get();

        $incomes = [];
        $expenses = [];
        $totalIncome = 0;
        $totalExpense = 0;

        foreach ($accounts as $account) {
            $debitSum = $account->lines->sum('debit');
            $creditSum = $account->lines->sum('credit');

            if ($debitSum == 0 && $creditSum == 0) continue;

            $netBalance = 0;

            if ($account->account_type === 'income') {
                // Income generally increments via Credits. 
                $netBalance = $creditSum - $debitSum;
                if (round($netBalance, 2) != 0) {
                    $incomes[] = [
                        'id' => $account->id,
                        'account_code' => $account->account_code,
                        'account_name' => $account->account_name,
                        'balance' => $netBalance,
                    ];
                    $totalIncome += $netBalance;
                }
            } else if ($account->account_type === 'expense') {
                // Expenses generally increment via Debits.
                $netBalance = $debitSum - $creditSum;
                if (round($netBalance, 2) != 0) {
                    $expenses[] = [
                        'id' => $account->id,
                        'account_code' => $account->account_code,
                        'account_name' => $account->account_name,
                        'balance' => $netBalance,
                    ];
                    $totalExpense += $netBalance;
                }
            }
        }

        $netProfit = $totalIncome - $totalExpense;

        return Inertia::render('Staff/Accounting/ProfitAndLoss', [
            'incomes' => $incomes,
            'expenses' => $expenses,
            'totalIncome' => round($totalIncome, 2),
            'totalExpense' => round($totalExpense, 2),
            'netProfit' => round($netProfit, 2),
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ]
        ]);
    }
}
