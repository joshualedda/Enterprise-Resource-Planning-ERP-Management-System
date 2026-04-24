<?php

namespace App\Http\Controllers\Staff\HumanResource;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Department;

class DepartmentController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search', '');
        $status = $request->input('status', '');

        $query = Department::query()
            ->when($search, function ($q) use ($search) {
                $q->where(function ($q2) use ($search) {
                    $q2->where('department_code', 'like', "%{$search}%")
                       ->orWhere('department_name', 'like', "%{$search}%");
                });
            })
            ->when($status, fn($q) => $q->where('status', $status))
            ->orderBy('id', 'desc');

        $statuses = $query->paginate(10)->withQueryString();

        return Inertia::render('Staff/HumanResource/Department', [
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
            'department_code' => 'required|string|max:10|unique:department,department_code',
            'department_name' => 'required|string|max:100',
            'status' => 'required|in:active,inactive'
        ]);

        Department::create($request->all());

        return redirect()->back()->with('success', 'Department created successfully.');
    }

    public function update(Request $request, $id)
    {
        $status = Department::findOrFail($id);

        $request->validate([
            'department_code' => 'required|string|max:10|unique:department,department_code,' . $id,
            'department_name' => 'required|string|max:100',
            'status' => 'required|in:active,inactive'
        ]);

        $status->update($request->all());

        return redirect()->back()->with('success', 'Department updated successfully.');
    }

    public function destroy($id)
    {
        $status = Department::findOrFail($id);
        $status->delete();

        return redirect()->back()->with('success', 'Department deleted successfully.');
    }
}
