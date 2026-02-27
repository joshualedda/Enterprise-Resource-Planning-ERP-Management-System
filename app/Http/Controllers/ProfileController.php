<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Models\UserInformation;
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
        $userInformation = UserInformation::where('user_id', $request->user()->id)->first();

        // toArray() ensures plain arrays reach the frontend — no Eloquent model issues
        $regions = Region::with('provinces.municipalities.barangays')
            ->orderBy('region_name')
            ->get()
            ->toArray();

        $sharedProps = [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status'          => session('status'),
            'regions'         => $regions,
            'userInformation' => $userInformation ? [
                'phone_number'    => $userInformation->phone_number    ?? '',
                'region_id'       => (string) ($userInformation->region_id       ?? ''),
                'province_id'     => (string) ($userInformation->province_id     ?? ''),
                'municipality_id' => (string) ($userInformation->municipality_id ?? ''),
                'barangay_id'     => (string) ($userInformation->barangay_id     ?? ''),
                'zipcode'         => $userInformation->zipcode ?? '',
            ] : null,
        ];

        if ((int) $request->user()->role_id === 1) {
            return Inertia::render('Admin/Profile/Index', $sharedProps);
        }

        return Inertia::render('Profile/Edit', $sharedProps);
    }

    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->only(['first_name', 'middle_name', 'last_name', 'email']));

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        UserInformation::updateOrCreate(
            ['user_id' => $request->user()->id],
            [
                'user_id'         => $request->user()->id,
                'role_id'         => $request->user()->role_id,
                'phone_number'    => $request->input('phone_number'),
                'region_id'       => $request->input('region_id')       ?: null,
                'province_id'     => $request->input('province_id')     ?: null,
                'municipality_id' => $request->input('municipality_id') ?: null,
                'barangay_id'     => $request->input('barangay_id')     ?: null,
                'zipcode'         => $request->input('zipcode'),
            ]
        );

        return match ((int) $request->user()->role_id) {
            1       => Redirect::route('admin.profile.index'),
            4       => Redirect::route('staff.inventory.profile'),
            5       => Redirect::route('staff.productionprofile'),
            6       => Redirect::route('staff.accountingprofile'),
            7       => Redirect::route('staff.cashierprofile'),
            8       => Redirect::route('staff.marketing-salesprofile'),
            default => Redirect::route('profile.edit'),
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