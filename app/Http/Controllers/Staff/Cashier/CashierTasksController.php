<?php

namespace App\Http\Controllers\Staff\Cashier;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class CashierTasksController extends Controller
{
    public function index()
    {
        return Inertia::render('Staff/Cashier/Tasks');
    }
}
