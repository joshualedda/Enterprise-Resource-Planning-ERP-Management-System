<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryTasksController extends Controller
{
    public function index()
    {
        return Inertia::render('Staff/Inventory/Tasks');
    }
}
