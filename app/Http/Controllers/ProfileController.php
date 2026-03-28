<?php
namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Models\Region;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        // toArray() ensures plain arrays reach the frontend — no Eloquent model issues
        $regions = Region::with(['provinces' => function($q) {
                $q->orderBy('provDesc');
            }, 'provinces.municipalities' => function($q) {
                $q->orderBy('citymunDesc');
            }, 'provinces.municipalities.barangays' => function($q) {
                $q->orderBy('brgyDesc');
            }])
            ->orderBy('regDesc')
            ->get()
            ->toArray();

        $sharedProps = [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status'          => session('status'),
            'regions'         => $regions,
            'userInformation' => [
                'region_id'       => (string) ($request->user()->region_id       ?? ''),
                'province_id'     => (string) ($request->user()->province_id     ?? ''),
                'municipality_id' => (string) ($request->user()->municipality_id ?? ''),
                'barangay_id'     => (string) ($request->user()->barangay_id     ?? ''),
                'zipcode'         => $request->user()->zip_code ?? '',
            ],
        ];

        if ($request->is('staff/inventory/profile')) {
            return Inertia::render('Staff/Inventory/Profile', $sharedProps);
        }

        // Use the same default profile edit page for all other roles
        return Inertia::render('Profile/Edit', $sharedProps);
    }

    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $fillData = $request->only(['first_name', 'middle_name', 'last_name', 'email']);
        $fillData['region_id'] = $request->input('region_id') ?: null;
        $fillData['province_id'] = $request->input('province_id') ?: null;
        $fillData['municipality_id'] = $request->input('municipality_id') ?: null;
        $fillData['barangay_id'] = $request->input('barangay_id') ?: null;
        $fillData['zip_code'] = $request->input('zipcode') ?: null;

        $request->user()->fill($fillData);

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return match ((int) $request->user()->role_id) {
            // Check if the request came from staff inventory profile
            default => str_contains(url()->previous(), 'staff/inventory/profile')
                ? Redirect::route('staff.inventory.profile')
                : Redirect::route('profile.edit'),
        };
    }

    public function destroy(Request $request): RedirectResponse
    {
        $request->validate(['password' => ['required', 'current_password']]);

        $user = $request->user();
        Auth::logout();
        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}