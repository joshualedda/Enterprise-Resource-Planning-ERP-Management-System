import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InventoryStaffLayout from '@/Layouts/InventoryStaffLayout';
import ProductionStaffLayout from '@/Layouts/ProductionStaffLayout';
import AccountingStaffLayout from '@/Layouts/AccountingStaffLayout';
import CashierStaffLayout from '@/Layouts/CashierStaffLayout';
import MarketingSalesStaffLayout from '@/Layouts/MarketingSalesStaffLayout';
import { Head, usePage } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    const { auth } = usePage().props;
    const roleId = Number(auth.user.role_id);

    const Layout =
        roleId === 4 ? InventoryStaffLayout :
        roleId === 5 ? ProductionStaffLayout :
        roleId === 6 ? AccountingStaffLayout :
        roleId === 7 ? CashierStaffLayout :
        roleId === 8 ? MarketingSalesStaffLayout :
        AuthenticatedLayout;

    return (
        <Layout>
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
