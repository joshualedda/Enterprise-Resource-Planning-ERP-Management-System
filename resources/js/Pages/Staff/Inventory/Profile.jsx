import StaffLayout from '@/Layouts/StaffLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from '@/Pages/Profile/Partials/DeleteUserForm';
import UpdatePasswordForm from '@/Pages/Profile/Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from '@/Pages/Profile/Partials/UpdateProfileInformationForm';

export default function StaffProfile({ mustVerifyEmail, status }) {
    return (
        <StaffLayout>
            <Head title="Profile" />

            <div className="space-y-6 animate-in fade-in duration-500">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Profile</h1>
                    <p className="text-slate-500 font-medium mt-1">Manage your account information and security settings.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                        className="w-full"
                    />
                    <UpdatePasswordForm className="w-full" />
                </div>

                <div className="bg-white p-6 shadow-sm rounded-2xl border border-slate-100">
                    <DeleteUserForm className="max-w-xl" />
                </div>
            </div>
        </StaffLayout>
    );
}
