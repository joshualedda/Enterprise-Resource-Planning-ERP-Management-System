import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InventoryStaffLayout from '@/Layouts/InventoryStaffLayout';
import { Head, usePage } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    const { auth } = usePage().props;
    const isStaff = Number(auth.user.role_id) === 2 || Number(auth.user.role_id) === 4;
    
    const Layout = isStaff ? InventoryStaffLayout : AuthenticatedLayout;

    return (
        <Layout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Profile
                </h2>
            }
        >
            <Head title="Profile" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <UpdateProfileInformationForm
                                mustVerifyEmail={mustVerifyEmail}
                                status={status}
                                className="w-full"
                            />
                        </div>

                        <div>
                            <UpdatePasswordForm className="w-full" />
                        </div>
                    </div>

                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <DeleteUserForm className="max-w-xl mx-auto" />
                    </div>
                </div>
            </div>
        </Layout>
    );
}
