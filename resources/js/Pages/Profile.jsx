import React from 'react';
import { Head, Link } from '@inertiajs/react';
import UserLayout from '@/Layouts/UserLayout';
import UpdateProfileInformationForm from '@/Pages/Profile/Partials/UpdateProfileInformationForm';
import UpdatePasswordForm from '@/Pages/Profile/Partials/UpdatePasswordForm';
import DeleteUserForm from '@/Pages/Profile/Partials/DeleteUserForm';

export default function Profile({ auth, mustVerifyEmail, status }) {
    return (
        <UserLayout activeTab="profile">
            <Head title="My Profile | D'SERICORE" />

            {/* Header Section (Matching Marketplace & Orders Style) */}
            <div className="bg-white border-b border-slate-100 py-12 lg:py-16">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col justify-end gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="w-10 h-px bg-[#C9A227]" />
                                <span className="text-[#3BAA35] text-[11px] font-bold uppercase tracking-[0.3em]">Account Management</span>
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-extrabold text-[#0B1F3B] tracking-tight uppercase">
                                Customer <span className="text-[#3BAA35]">Profile</span>
                            </h1>
                            <p className="max-w-2xl text-slate-500 font-medium text-sm leading-relaxed">
                                Manage your institutional profile details, shipping addresses, and security settings. Keep your information up-to-date to ensure seamless acquisitions and logistics.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto px-6 py-12 w-full">
                <div className="space-y-8">
                    {/* Profile Information Block */}
                    <div className="bg-white p-6 sm:p-10 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-[#3BAA35]"></div>
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-3xl"
                        />
                    </div>

                    {/* Password Update Block */}
                    <div className="bg-white p-6 sm:p-10 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-[#0B1F3B]"></div>
                        <UpdatePasswordForm className="max-w-3xl" />
                    </div>

                    {/* Delete Account Block */}
                    <div className="bg-white p-6 sm:p-10 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-[#C9A227]"></div>
                        <DeleteUserForm className="max-w-3xl" />
                    </div>
                </div>
            </main>

            {/* Footer Section (Consistent) */}
            <footer className="bg-white border-t border-gray-100 py-12 lg:px-12 mt-auto">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="space-y-1 text-center md:text-left">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">DMMMSU — Sericulture Research and Development Institute</p>
                        <p className="text-[9px] text-[#3BAA35] font-black uppercase tracking-[0.25em]">Pioneering Excellence in Philippine Silk Research</p>
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest opacity-60">© 2026 SRDI. ALL RIGHTS RESERVED.</p>
                </div>
            </footer>
        </UserLayout>
    );
}
