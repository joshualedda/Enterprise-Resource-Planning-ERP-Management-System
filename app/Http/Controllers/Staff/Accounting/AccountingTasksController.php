<?php

namespace App\Http\Controllers\Staff\Accounting;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AccountingTasksController extends Controller
{
    /**
     * Display accounting tasks / pending actions list.
     */
    public function index(Request $request)
    {
        // TODO: Fetch real tasks (pending invoices, overdue bills, journal approvals, etc.)
        return Inertia::render('Staff/Accounting/Tasks', [
            'tasks' => [],
        ]);
    }
}
