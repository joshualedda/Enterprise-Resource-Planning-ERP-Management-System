<?php

namespace App\Http\Controllers\Staff\HumanResource;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\CivilStatus;

class CivilStatusController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search', '');
        $status = $request->input('status', '');

        $query = CivilStatus::query()
            ->when($search, function ($q) use ($search) {
                $q->where(function ($q2) use ($search) {
                    $q2->where('civil_status_code', 'like', "%{$search}%")
                       ->orWhere('civil_status_name', 'like', "%{$search}%");
                });
            })
            ->when($status, fn($q) => $q->where('status', $status))
            ->orderBy('id', 'desc');

        $statuses = $query->paginate(10)->withQueryString();

        return Inertia::render('Staff/HumanResource/CivilStatus', [
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
            'civil_status_code' => 'required|string|max:10|unique:civil_status,civil_status_code',
            'civil_status_name' => 'required|string|max:100',
            'status' => 'required|in:active,inactive'
        ]);

        CivilStatus::create($request->all());

        return redirect()->back()->with('success', 'Civil Status created successfully.');
    }

    public function update(Request $request, $id)
    {
        $status = CivilStatus::findOrFail($id);

        $request->validate([
            'civil_status_code' => 'required|string|max:10|unique:civil_status,civil_status_code,' . $id,
            'civil_status_name' => 'required|string|max:100',
            'status' => 'required|in:active,inactive'
        ]);

        $status->update($request->all());

        return redirect()->back()->with('success', 'Civil Status updated successfully.');
    }

    public function destroy($id)
    {
        $status = CivilStatus::findOrFail($id);
        $status->delete();

        return redirect()->back()->with('success', 'Civil Status deleted successfully.');
    }
}
