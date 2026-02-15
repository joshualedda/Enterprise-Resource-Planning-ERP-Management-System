<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role; // Siguraduhin na may Role model ka
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class UsersController extends Controller
{
    public function index()
    {
        // Ginagamit ang 'with' para makuha ang role name galing sa roles table
        $users = User::with('role') 
                    ->select('id', 'first_name', 'middle_name', 'last_name', 'email', 'role_id', 'created_at')
                    ->latest()
                    ->get();

        // Isama rin natin ang listahan ng roles para sa dropdown sa frontend
        $roles = Role::all(['id', 'name']); 

        return Inertia::render('Admin/Users', [
            'users' => $users,
            'roles' => $roles
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name'  => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name'   => 'required|string|max:255',
            'email'       => 'required|string|email|max:255|unique:users',
            'role_id'     => 'required|exists:roles,id', // Sinisiguro na valid ang ID sa roles table
            'password'    => ['required', 'confirmed', Password::defaults()],
        ]);

        $user = User::create([
            'first_name'  => $validated['first_name'],
            'middle_name' => $validated['middle_name'],
            'last_name'   => $validated['last_name'],
            'email'       => $validated['email'],
            'role_id'     => $validated['role_id'], 
            'password'    => Hash::make($validated['password']),
        ]);

        event(new Registered($user));

        return back()->with('success', "User successfully added.");
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'first_name'  => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name'   => 'required|string|max:255',
            'email'       => 'required|string|email|max:255|unique:users,email,'.$user->id,
            'role_id'     => 'required|exists:roles,id',
        ]);

        $user->fill($validated);

        if ($request->filled('password')) {
            $request->validate([
                'password' => ['confirmed', Password::defaults()],
            ]);
            $user->password = Hash::make($request->password);
        }

        $user->save();

        return back()->with('success', "User updated successfully.");
    }

    public function destroy(Request $request, User $user)
    {
        $request->validate([
            'admin_password' => ['required', 'current_password'],
        ]);

        $user->delete();

        return back()->with('success', "User deleted.");
    }
}