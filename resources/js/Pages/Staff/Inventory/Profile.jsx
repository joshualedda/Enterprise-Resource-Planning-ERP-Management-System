import InventoryStaffLayout from '@/Layouts/InventoryStaffLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from '@/Pages/Profile/Partials/DeleteUserForm';
import UpdatePasswordForm from '@/Pages/Profile/Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from '@/Pages/Profile/Partials/UpdateProfileInformationForm';

export default function StaffProfile({ mustVerifyEmail, status }) {
    return (
        <InventoryStaffLayout>
            <Head title="Profile" />

            <div className="space-y-6 animate-in fade-in duration-500">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Profile</h1>
                    <p className="text-slate-500 font-medium mt-1">Manage your account information and security settings.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                    {/* Left Column: Profile Info */}
                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                        className="w-full"
                    />

                    {/* Right Column: Security & Danger Zone */}
                    <div className="flex flex-col gap-6 w-full">
                        <UpdatePasswordForm className="w-full h-fit flex-shrink-0" />
                        
                        <div className="bg-white p-8 shadow-sm rounded-3xl border border-slate-200">
                            <DeleteUserForm className="w-full" />
                        </div>
                    </div>
                </div>
            </div>
        </InventoryStaffLayout>
    );
}
