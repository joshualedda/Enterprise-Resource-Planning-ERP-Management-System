<?php

namespace App\Http\Controllers\Staff\HumanResource;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\EmployeeStatus;

class EmployeeStatusController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search', '');
        $status = $request->input('status', '');

        $query = EmployeeStatus::query()
            ->when($search, function ($q) use ($search) {
                $q->where(function ($q2) use ($search) {
                    $q2->where('employee_status_code', 'like', "%{$search}%")
                       ->orWhere('employee_status_name', 'like', "%{$search}%");
                });
            })
            ->when($status, fn($q) => $q->where('status', $status))
            ->orderBy('id', 'desc');

        $statuses = $query->paginate(10)->withQueryString();

        return Inertia::render('Staff/HumanResource/EmpStatus', [
            'statuses' => $statuses,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'employee_status_code' => 'required|string|max:10|unique:employee_status,employee_status_code',
            'employee_status_name' => 'required|string|max:100',
            'status' => 'required|in:active,inactive'
        ]);

        EmployeeStatus::create($request->all());

        return redirect()->back()->with('success', 'Employee Status created successfully.');
    }

    public function update(Request $request, $id)
    {
        $status = EmployeeStatus::findOrFail($id);

        $request->validate([
            'employee_status_code' => 'required|string|max:10|unique:employee_status,employee_status_code,' . $id,
            'employee_status_name' => 'required|string|max:100',
            'status' => 'required|in:active,inactive'
        ]);

        $status->update($request->all());

        return redirect()->back()->with('success', 'Employee Status updated successfully.');
    }

    public function destroy($id)
    {
        $status = EmployeeStatus::findOrFail($id);
        $status->delete();

        return redirect()->back()->with('success', 'Employee Status deleted successfully.');
    }
}
