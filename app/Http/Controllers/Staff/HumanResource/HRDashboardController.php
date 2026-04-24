<?php

namespace App\Http\Controllers\Staff\HumanResource;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\EmployeeModel;
use App\Models\Department;
use Carbon\Carbon;

class HRDashboardController extends Controller
{
    /**
     * Display the HR Dashboard.
     */
    public function index(): Response
    {
        $totalEmployees = EmployeeModel::count();
        $activeEmployees = EmployeeModel::where('status', 'active')->count();
        
        // New hires in the last 30 days
        $thirtyDaysAgo = Carbon::now()->subDays(30);
        $newHires = EmployeeModel::where('date_started', '>=', $thirtyDaysAgo)->count();

        // Headcount by Department
        $departments = Department::withCount('employees')->get()->map(function ($dept) {
            return [
                'name' => $dept->department_name,
                'count' => $dept->employees_count,
            ];
        });

        // Dummy data for leaves as requested
        $leaveRequests = [
            [
                'id' => 1,
                'employee_name' => 'John Doe',
                'type' => 'Vacation',
                'start_date' => '2026-05-01',
                'end_date' => '2026-05-05',
                'status' => 'pending',
                'avatar' => null,
            ],
            [
                'id' => 2,
                'employee_name' => 'Jane Smith',
                'type' => 'Sick Leave',
                'start_date' => '2026-04-25',
                'end_date' => '2026-04-26',
                'status' => 'pending',
                'avatar' => null,
            ],
            [
                'id' => 3,
                'employee_name' => 'Robert Johnson',
                'type' => 'Emergency',
                'start_date' => '2026-04-24',
                'end_date' => '2026-04-24',
                'status' => 'pending',
                'avatar' => null,
            ]
        ];

        return Inertia::render('Staff/HumanResource/Dashboard', [
            'stats' => [
                'totalEmployees' => $totalEmployees,
                'activeEmployees' => $activeEmployees,
                'newHires' => $newHires,
                'pendingLeaves' => count($leaveRequests),
            ],
            'departmentHeadcount' => $departments,
            'leaveRequests' => $leaveRequests,
        ]);
    }
}
