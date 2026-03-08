<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class InventoryStockLevelsController extends Controller
{
    public function index()
    {
        return Inertia::render('Staff/Inventory/StockLevels');
    }
}
