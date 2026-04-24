<?php

namespace App\Http\Controllers\Staff\HumanResource;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Position;

class PositionController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search', '');
        $status = $request->input('status', '');

        $query = Position::query()
            ->when($search, function ($q) use ($search) {
                $q->where(function ($q2) use ($search) {
                    $q2->where('position_code', 'like', "%{$search}%")
                       ->orWhere('position_name', 'like', "%{$search}%");
                });
            })
            ->when($status, fn($q) => $q->where('status', $status))
            ->orderBy('id', 'desc');

        $statuses = $query->paginate(10)->withQueryString();

        return Inertia::render('Staff/HumanResource/Positions', [
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
            'position_code' => 'required|string|max:10|unique:position,position_code',
            'position_name' => 'required|string|max:100',
            'status' => 'required|in:active,inactive'
        ]);

        Position::create($request->all());

        return redirect()->back()->with('success', 'Position created successfully.');
    }

    public function update(Request $request, $id)
    {
        $status = Position::findOrFail($id);

        $request->validate([
            'position_code' => 'required|string|max:10|unique:position,position_code,' . $id,
            'position_name' => 'required|string|max:100',
            'status' => 'required|in:active,inactive'
        ]);

        $status->update($request->all());

        return redirect()->back()->with('success', 'Position updated successfully.');
    }

    public function destroy($id)
    {
        $status = Position::findOrFail($id);
        $status->delete();

        return redirect()->back()->with('success', 'Position deleted successfully.');
    }
}
