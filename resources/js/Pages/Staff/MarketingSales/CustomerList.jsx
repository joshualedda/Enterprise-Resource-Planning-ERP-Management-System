import { useState, useMemo, useEffect, useRef } from 'react';
import MarketingSalesStaffLayout from '@/Layouts/MarketingSalesStaffLayout';
import { Head, router, Link, usePage } from '@inertiajs/react';
import Table, { Tr, Td } from '@/Components/Table';
import Pagination from '@/Components/Pagination';
import Alert from '@/Components/Alert';

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------
function statusBadge(status) {
    switch (status?.toLowerCase()) {
        case 'active': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
        case 'inactive': return 'bg-rose-50 text-rose-600 border-rose-100';
        case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
        default: return 'bg-slate-100 text-slate-400 border-slate-200';
    }
}

// ---------------------------------------------------------------------------
// MAIN PAGE
// ---------------------------------------------------------------------------
export default function CustomerList({ customers, filters = {}, flash = {} }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [alertMessage, setAlertMessage] = useState('');

    useEffect(() => {
        if (flash?.success) {
            setAlertMessage(flash.success);
            const timer = setTimeout(() => setAlertMessage(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    // Auto-filter
    const isInitialRender = useRef(true);
    useEffect(() => {
        if (isInitialRender.current) {
            isInitialRender.current = false;
            return;
        }
        const timeoutId = setTimeout(() => {
            router.get(route('staff.marketing-sales.customer-list'), {
                search: search || undefined,
            }, { preserveState: true, replace: true });
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [search]);

    return (
        <MarketingSalesStaffLayout>
            <Head title="Customer Management — Marketing & Sales" />

            <Alert message={alertMessage} onClose={() => setAlertMessage('')} />

            <div className="space-y-6 animate-in fade-in duration-500">
                {/* PAGE HEADER */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Customer List</h1>
                        <p className="text-slate-500 font-medium mt-1">
                            Browse and manage your customer accounts and their details.
                        </p>
                    </div>
                </div>

                {/* SEARCH BAR */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center">
                    <div className="relative max-w-xl mx-auto">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search by name or email…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:border-rose-400 outline-none transition placeholder-slate-400"
                        />
                    </div>
                </div>

                {/* TABLE VIEW */}
                <Table
                    title="👥 Customers"
                    subtitle="Registered user accounts with customer roles"
                    badgeCount={customers.total}
                    columns={['Name', 'Email', 'Status', 'Joined Date', 'Actions']}
                    emptyState={
                        <div className="flex flex-col items-center gap-2 py-12">
                            <div className="text-4xl">👥</div>
                            <p className="text-sm font-black text-slate-300">No customers found</p>
                        </div>
                    }
                    footer={
                        <div className="px-6 py-4 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-b-2xl">
                            <p className="text-xs font-bold text-slate-400">
                                Page {customers.current_page} of {customers.last_page} · {customers.total} total customers
                            </p>
                            <Pagination
                                currentPage={customers.current_page}
                                totalPages={customers.last_page}
                                onPageChange={(page) => {
                                    router.get(route('staff.marketing-sales.customer-list'), { search, page }, { preserveState: true, preserveScroll: true });
                                }}
                            />
                        </div>
                    }
                >
                    {customers.data.map((user) => (
                        <Tr key={user.id}>
                            <Td>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white text-xs font-black">
                                        {user.first_name?.[0]}{user.last_name?.[0]}
                                    </div>
                                    <p className="text-sm font-black text-slate-800">
                                        {user.first_name} {user.last_name}
                                    </p>
                                </div>
                            </Td>
                            <Td className="text-sm font-medium text-slate-600">
                                {user.email}
                            </Td>
                            <Td>
                                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border capitalize ${statusBadge(user.status || 'Active')}`}>
                                    {user.status || 'Active'}
                                </span>
                            </Td>
                            <Td className="text-xs text-slate-500 font-medium">
                                {new Date(user.created_at).toLocaleDateString()}
                            </Td>
                            <Td>
                                <button className="text-[10px] font-black text-rose-600 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-xl transition">
                                    View Activity
                                </button>
                            </Td>
                        </Tr>
                    ))}
                </Table>
            </div>
        </MarketingSalesStaffLayout>
    );
}
