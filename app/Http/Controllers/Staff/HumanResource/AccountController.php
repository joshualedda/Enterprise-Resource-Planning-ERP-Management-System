<?php

namespace App\Http\Controllers\Staff\HumanResource;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\EmployeeUser;
use App\Models\EmployeeModel;
use App\Models\User;

class AccountController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search', '');
        $accessLevel = $request->input('access_level', '');

        $query = EmployeeUser::with(['employee', 'user'])
            ->when($search, function ($q) use ($search) {
                $q->whereHas('employee', function ($q2) use ($search) {
                    $q2->where('first_name', 'like', "%{$search}%")
                       ->orWhere('last_name', 'like', "%{$search}%");
                })->orWhereHas('user', function ($q2) use ($search) {
                    $q2->where('first_name', 'like', "%{$search}%")
                       ->orWhere('last_name', 'like', "%{$search}%")
                       ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($accessLevel, fn($q) => $q->where('access_level', $accessLevel))
            ->orderBy('id', 'desc');

        $accounts = $query->paginate(10)->withQueryString();

        return Inertia::render('Staff/HumanResource/Accounts', [
            'accounts' => $accounts,
            'employees' => EmployeeModel::where('status', 'active')->orderBy('last_name')->get(['id', 'first_name', 'last_name']),
            'users' => User::orderBy('last_name')->get(['id', 'first_name', 'last_name', 'email', 'role_id']),
            'filters' => [
                'search' => $search,
                'access_level' => $accessLevel,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'employee_id' => 'required|exists:employee,id',
            'user_id' => 'required|exists:users,id|unique:employee_user,user_id',
            'access_level' => 'required|string|max:50',
        ], [
            'user_id.unique' => 'This user is already linked to an employee.'
        ]);

        EmployeeUser::create($request->all());

        return redirect()->back()->with('success', 'Account linked successfully.');
    }

    public function update(Request $request, $id)
    {
        $account = EmployeeUser::findOrFail($id);

        $request->validate([
            'employee_id' => 'required|exists:employee,id',
            'user_id' => 'required|exists:users,id|unique:employee_user,user_id,' . $id,
            'access_level' => 'required|string|max:50',
        ]);

        $account->update($request->all());

        return redirect()->back()->with('success', 'Account updated successfully.');
    }

    public function destroy($id)
    {
        $account = EmployeeUser::findOrFail($id);
        $account->delete();

        return redirect()->back()->with('success', 'Account unlinked successfully.');
    }
}
