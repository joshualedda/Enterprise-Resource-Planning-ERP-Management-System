import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import UpdateProfileInformationForm from '@/Pages/Profile/Partials/UpdateProfileInformationForm';
import UpdatePasswordForm from '@/Pages/Profile/Partials/UpdatePasswordForm';
import DeleteUserForm from '@/Pages/Profile/Partials/DeleteUserForm';
import { User, Shield, Key, AlertTriangle } from 'lucide-react';

export default function Index({ auth, mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Admin Profile" />

            <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Profile Settings</h1>
                        <p className="text-slate-500 text-sm font-medium mt-1">Manage your account information and security preferences.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-none">

                    {/* Profile Information */}
                    <div className="bg-white p-6 sm:p-8 rounded-[1.5rem] border border-slate-100 shadow-sm h-full">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                <User size={20} />
                            </div>
                            <h2 className="text-lg font-black text-slate-800">Profile Information</h2>
                        </div>
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="w-full"
                        />
                    </div>

                    {/* Update Password */}
                    <div className="bg-white p-6 sm:p-8 rounded-[1.5rem] border border-slate-100 shadow-sm h-full">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                <Key size={20} />
                            </div>
                            <h2 className="text-lg font-black text-slate-800">Update Password</h2>
                        </div>
                        <UpdatePasswordForm className="w-full" />
                    </div>

                    {/* Delete Account (Full Width) */}
                    <div className="bg-white p-6 sm:p-8 rounded-[1.5rem] border border-rose-100 shadow-sm lg:col-span-2">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                                <AlertTriangle size={20} />
                            </div>
                            <h2 className="text-lg font-black text-slate-800">Delete Account</h2>
                        </div>
                        <DeleteUserForm className="max-w-xl" />
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
