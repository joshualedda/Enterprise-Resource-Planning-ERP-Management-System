<?php

namespace App\Http\Controllers\Staff\Accounting;

use App\Http\Controllers\Controller;
use App\Models\ChartOfAccount;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TrialBalanceController extends Controller
{
    public function index(Request $request)
    {
        $asOfDate = $request->query('as_of', date('Y-m-d'));

        // Load all active accounts pulling only their transactions up to the target date.
        $accounts = ChartOfAccount::where('is_active', true)
            ->with(['lines' => function($q) use ($asOfDate) {
                $q->whereHas('journalEntry', function($jeQuery) use ($asOfDate) {
                    $jeQuery->where('entry_date', '<=', $asOfDate);
                });
            }])
            ->orderBy('account_code')
            ->get();

        $trialBalance = [];
        $totalDebit = 0;
        $totalCredit = 0;

        foreach ($accounts as $account) {
            $debitSum = $account->lines->sum('debit');
            $creditSum = $account->lines->sum('credit');

            if ($debitSum == 0 && $creditSum == 0) continue;

            $balance = 0;
            $isDebitBalance = true;

            if ($account->normal_balance === 'debit') {
                $balance = $debitSum - $creditSum;
                if ($balance < 0) {
                    $isDebitBalance = false;
                    $balance = abs($balance);
                }
            } else {
                $balance = $creditSum - $debitSum;
                if ($balance < 0) {
                    $isDebitBalance = true;
                    $balance = abs($balance);
                } else {
                    $isDebitBalance = false;
                }
            }

            // Exclude exactly flat accounts
            if (round($balance, 2) == 0) continue;

            $row = [
                'id' => $account->id,
                'account_code' => $account->account_code,
                'account_name' => $account->account_name,
                'account_type' => $account->account_type,
                'debit' => $isDebitBalance ? round($balance, 2) : 0,
                'credit' => !$isDebitBalance ? round($balance, 2) : 0,
            ];

            $totalDebit += $row['debit'];
            $totalCredit += $row['credit'];
            $trialBalance[] = $row;
        }

        return Inertia::render('Staff/Accounting/TrialBalance', [
            'trialBalance' => $trialBalance,
            'totalDebit' => round($totalDebit, 2),
            'totalCredit' => round($totalCredit, 2),
            'asOfDate' => $asOfDate,
        ]);
    }
}
