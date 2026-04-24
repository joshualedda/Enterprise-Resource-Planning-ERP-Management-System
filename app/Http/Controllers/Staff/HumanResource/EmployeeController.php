<?php

namespace App\Http\Controllers\Staff\HumanResource;

use App\Http\Controllers\Controller;
use App\Models\EmployeeModel;
use App\Models\Department;
use App\Models\Position;
use App\Models\CivilStatus;
use App\Models\EmployeeStatus;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

use App\Models\Region;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $search      = $request->input('search', '');
        $deptId      = $request->input('department_id', '');
        $posId       = $request->input('position_id', '');
        $statusId    = $request->input('employee_status_id', '');

        $query = EmployeeModel::with(['department', 'position', 'civilStatus', 'employeeStatus'])
            ->when($search, function ($q) use ($search) {
                $q->where(function ($q2) use ($search) {
                    $q2->where('first_name', 'like', "%{$search}%")
                       ->orWhere('last_name', 'like', "%{$search}%")
                       ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($deptId, fn($q) => $q->where('department_id', $deptId))
            ->when($posId,  fn($q) => $q->where('position_id', $posId))
            ->when($statusId, fn($q) => $q->where('employee_status_id', $statusId))
            ->orderBy('id', 'desc');

        $employees = $query->paginate(10)->through(function ($employee) {
            $employee->image_url = $employee->employee_image
                ? asset('storage/' . $employee->employee_image)
                : null;
            return $employee;
        })->withQueryString();

        return Inertia::render('Staff/HumanResource/Employee/Employees', [
            'employees'       => $employees,
            'departments'     => Department::where('status', 'active')->get(['id', 'department_name']),
            'positions'       => Position::where('status', 'active')->get(['id', 'position_name']),
            'employeeStatuses'=> EmployeeStatus::where('status', 'active')->get(['id', 'employee_status_name']),
            'filters'         => [
                'search'             => $search,
                'department_id'      => $deptId,
                'position_id'        => $posId,
                'employee_status_id' => $statusId,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('Staff/HumanResource/Employee/CreateEmployee', [
            'departments' => Department::where('status', 'active')->get(),
            'positions' => Position::where('status', 'active')->get(),
            'civilStatuses' => CivilStatus::where('status', 'active')->get(),
            'employeeStatuses' => EmployeeStatus::where('status', 'active')->get(),
            'regions' => Region::with(['provinces.municipalities.barangays'])->get(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:50',
            'last_name' => 'required|string|max:50',
            'email' => 'nullable|email|max:250',
            'department_id' => 'required|integer',
            'position_id' => 'required|integer',
            'status' => 'required|in:active,inactive',
            'birthday' => 'required|date',
            'gender' => 'required|in:Male,Female,Other',
            'date_started' => 'required|date',
            'sss' => 'nullable|string|max:50',
            'tin' => 'nullable|string|max:50',
            'phil_health' => 'nullable|string|max:50',
            'pag_ibig' => 'nullable|string|max:50',
            'remark' => 'nullable|string|max:500',
            'employee_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $data = $request->except('employee_image');
        $data['updated_by'] = auth()->id() ?? 1;

        if ($request->hasFile('employee_image')) {
            $path = $request->file('employee_image')->store('employees', 'public');
            $data['employee_image'] = $path;
        }

        EmployeeModel::create($data);

        return redirect()->route('staff.hr.employees')->with('success', 'Employee created successfully.');
    }

    public function edit($id)
    {
        $employee = EmployeeModel::findOrFail($id);
        if ($employee->employee_image) {
            $employee->image_url = asset('storage/' . $employee->employee_image);
        }

        return Inertia::render('Staff/HumanResource/Employee/CreateEmployee', [
            'employee' => $employee,
            'departments' => Department::where('status', 'active')->get(),
            'positions' => Position::where('status', 'active')->get(),
            'civilStatuses' => CivilStatus::where('status', 'active')->get(),
            'employeeStatuses' => EmployeeStatus::where('status', 'active')->get(),
            'regions' => Region::with(['provinces.municipalities.barangays'])->get(),
        ]);
    }

    public function update(Request $request, $id)
    {
        $employee = EmployeeModel::findOrFail($id);

        $request->validate([
            'first_name' => 'required|string|max:50',
            'last_name' => 'required|string|max:50',
            'email' => 'nullable|email|max:250',
            'department_id' => 'required|integer',
            'position_id' => 'required|integer',
            'status' => 'required|in:active,inactive',
            'birthday' => 'required|date',
            'gender' => 'required|in:Male,Female,Other',
            'date_started' => 'required|date',
            'sss' => 'nullable|string|max:50',
            'tin' => 'nullable|string|max:50',
            'phil_health' => 'nullable|string|max:50',
            'pag_ibig' => 'nullable|string|max:50',
            'remark' => 'nullable|string|max:500',
            'employee_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $data = $request->except('employee_image');
        $data['updated_by'] = auth()->id() ?? 1;

        if ($request->hasFile('employee_image')) {
            if ($employee->employee_image && Storage::disk('public')->exists($employee->employee_image)) {
                Storage::disk('public')->delete($employee->employee_image);
            }
            $path = $request->file('employee_image')->store('employees', 'public');
            $data['employee_image'] = $path;
        }

        $employee->update($data);

        return redirect()->route('staff.hr.employees')->with('success', 'Employee updated successfully.');
    }

    public function destroy($id)
    {
        $employee = EmployeeModel::findOrFail($id);

        if ($employee->employee_image && Storage::disk('public')->exists($employee->employee_image)) {
            Storage::disk('public')->delete($employee->employee_image);
        }

        $employee->delete();

        return redirect()->back()->with('success', 'Employee deleted successfully.');
    }
}
