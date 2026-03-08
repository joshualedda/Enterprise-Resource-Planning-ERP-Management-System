<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class InventoryCategoriesController extends Controller
{
    public function index()
    {
        return Inertia::render('Staff/Inventory/Categories');
    }
}
