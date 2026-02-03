<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Auth\Events\Registered;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

date_default_timezone_set('Asia/Manila');
class UsersController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Fetch users from database, excluding sensitive data like full password hash
        $users = User::select('id', 'name', 'email', 'role', 'created_at')
                    ->latest()
                    ->get();

        return Inertia::render('Admin/Users', [
            'users' => $users
        ]);
    }

public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'role' => 'required|string|in:admin,staff,customer',
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'password' => Hash::make($validated['password']),
        ]);


        event(new Registered($user));

        return back()->with('success', 'New user ' . $validated['name'] . ' has been added! A verification email has been sent.');
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,'.$user->id,
            'role' => 'required|string|in:admin,staff,customer',
        ]);

        if ($request->filled('password')) {
            $request->validate([
                'password' => ['confirmed', Password::defaults()],
            ]);
            $user->password = Hash::make($request->password);
        }

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->role = $validated['role'];
        $user->save();

        return back()->with('success', 'User ' . $user->name . ' updated successfully!');
    }

    public function destroy(Request $request, User $user)
    {
        $request->validate([
            'admin_password' => ['required', 'current_password'],
        ]);

        $userName = $user->name;
        $user->delete();

        return back()->with('success', 'User ' . $userName . ' has been permanently deleted.');
    }
}