<?php

namespace App\Http\Controllers\Staff\MarketingSales;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MarketingCustomerController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query()->where('role_id', 3); // Customer role

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $customers = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('Staff/MarketingSales/CustomerList', [
            'customers' => $customers,
            'filters' => $request->only(['search']),
        ]);
    }
}
