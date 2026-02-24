<?php

namespace App\Http\Controllers\Staff\Production;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class ProductionTasksController extends Controller
{
    public function index()
    {
        return Inertia::render('Staff/Production/Tasks');
    }
}
