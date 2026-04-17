import { useState, useMemo, useEffect, useRef } from 'react';
import MarketingSalesStaffLayout from '@/Layouts/MarketingSalesStaffLayout';
import { Head, router, Link, usePage } from '@inertiajs/react';
import Table, { Tr, Td } from '@/Components/Table';
import Pagination from '@/Components/Pagination';
import Alert from '@/Components/Alert';

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------
const phpFmt = (n) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(n);

function statusBadge(status) {
    switch (status?.toLowerCase()) {
        case 'completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
        case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
        case 'cancelled': return 'bg-rose-50 text-rose-600 border-rose-100';
        case 'processing': return 'bg-blue-50 text-blue-600 border-blue-100';
        default: return 'bg-slate-100 text-slate-400 border-slate-200';
    }
}

// ---------------------------------------------------------------------------
// KPI CARD
// ---------------------------------------------------------------------------
function KpiCard({ label, value, iconPath, iconBg, badge, badgeColor }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
                </svg>
            </div>
            <div>
                <p className="text-xl font-black text-slate-900 leading-none">{value}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 leading-tight">{label}</p>
                {badge && (
                    <span className={`mt-2 inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${badgeColor}`}>
                        {badge}
                    </span>
                )}
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// MAIN PAGE
// ---------------------------------------------------------------------------
export default function SalesList({ transactions, filters = {}, stats = {}, flash = {} }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [statusFilter, setStatus] = useState(filters.status ?? 'All');
    const [alertMessage, setAlertMessage] = useState('');

    const routePrefix = 'staff.marketing-sales';

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
            const rName = `${routePrefix}.sales-list`;
            if (route().has(rName)) {
                router.get(route(rName), {
                    search: search || undefined,
                    status: statusFilter !== 'All' ? statusFilter : undefined,
                }, { preserveState: true, replace: true });
            }
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [search, statusFilter, routePrefix]);

    const kpis = [
        {
            label: 'Total Orders', value: stats.total_orders || 0,
            iconPath: 'M16 11V7a4 4 0 11-8 0v4M5 9h14l1 12H4L5 9z',
            iconBg: 'bg-slate-50 text-slate-500',
            badge: 'Lifetime', badgeColor: 'text-slate-500 bg-slate-50',
        },
        {
            label: 'Pending Orders', value: stats.pending_orders || 0,
            iconPath: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
            iconBg: 'bg-amber-50 text-amber-600',
            badge: 'Needs Attention', badgeColor: 'text-amber-600 bg-amber-50',
        },
        {
            label: 'Monthly Sales', value: phpFmt(stats.monthly_sales || 0),
            iconPath: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
            iconBg: 'bg-emerald-50 text-emerald-600',
            badge: 'This Month', badgeColor: 'text-emerald-600 bg-emerald-50',
        },
        {
            label: 'Total Revenue', value: phpFmt(stats.total_sales || 0),
            iconPath: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
            iconBg: 'bg-rose-50 text-rose-600',
            badge: 'Completed Only', badgeColor: 'text-rose-600 bg-rose-50',
        },
    ];

    return (
        <MarketingSalesStaffLayout>
            <Head title="Sales Orders — Marketing & Sales" />

            <Alert message={alertMessage} onClose={() => setAlertMessage('')} />

            <div className="space-y-6 animate-in fade-in duration-500">
                {/* PAGE HEADER */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Sales Orders</h1>
                        <p className="text-slate-500 font-medium mt-1">
                            Manage and track all customer sales transactions and order statuses.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <a href={route().has(`${routePrefix}.sales-list.pdf`) ? route(`${routePrefix}.sales-list.pdf`) : '#'} className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-100 rounded-xl transition">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                            Export PDF
                        </a>
                        <a href={route().has(`${routePrefix}.sales-list.excel`) ? route(`${routePrefix}.sales-list.excel`) : '#'} className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 rounded-xl transition">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            Export Excel
                        </a>
                    </div>
                </div>

                {/* KPI CARDS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {kpis.map(k => <KpiCard key={k.label} {...k} />)}
                </div>

                {/* SEARCH & FILTER BAR */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                    <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
                        <div className="relative flex-1">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search by reference no or customer name…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:border-rose-400 outline-none transition placeholder-slate-400"
                            />
                        </div>

                        <select
                            value={statusFilter}
                            onChange={e => setStatus(e.target.value)}
                            className="px-3 py-2 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-400 outline-none appearance-none cursor-pointer transition"
                        >
                            <option value="All">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>

                {/* TABLE VIEW */}
                <Table
                    title="🛒 Order List"
                    subtitle="Recent sales transactions and order details"
                    badgeCount={transactions.total}
                    columns={['Reference No', 'Customer', 'Items', 'Total Amount', 'Payment', 'Status', 'Date', 'Actions']}
                    emptyState={
                        <div className="flex flex-col items-center gap-2 py-12">
                            <div className="text-4xl">🧾</div>
                            <p className="text-sm font-black text-slate-300">No orders found</p>
                        </div>
                    }
                    footer={
                        <div className="px-6 py-4 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-b-2xl">
                            <p className="text-xs font-bold text-slate-400">
                                Page {transactions.current_page} of {transactions.last_page} · {transactions.total} total orders
                            </p>
                            <Pagination
                                currentPage={transactions.current_page}
                                totalPages={transactions.last_page}
                                onPageChange={(page) => {
                                    router.get(route(route().current()), { search, status: statusFilter, page }, { preserveState: true, preserveScroll: true });
                                }}
                            />
                        </div>
                    }
                >
                    {transactions.data.map((tx) => (
                        <Tr key={tx.id}>
                            <Td>
                                <span className="text-xs font-black text-rose-600 bg-rose-50 px-2 py-1 rounded-lg">
                                    {tx.reference_no}
                                </span>
                            </Td>
                            <Td>
                                <div>
                                    <p className="text-sm font-bold text-slate-800 leading-tight">
                                        {tx.user ? `${tx.user.first_name} ${tx.user.last_name}` : 'Guest / System'}
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">{tx.user?.email || 'No email'}</p>
                                </div>
                            </Td>
                            <Td>
                                <span className="text-xs font-bold text-slate-500">
                                    {tx.order_items?.length || 0} items
                                </span>
                            </Td>
                            <Td className="text-sm font-black text-slate-700">
                                {phpFmt(tx.total_amount)}
                            </Td>
                            <Td>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                                    {tx.payment_method}
                                </span>
                            </Td>
                            <Td>
                                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border capitalize ${statusBadge(tx.status)}`}>
                                    {tx.status}
                                </span>
                            </Td>
                            <Td className="text-xs text-slate-500 font-medium">
                                {new Date(tx.created_at).toLocaleDateString()}
                            </Td>
                            <Td>
                                <Link
                                    href={route('staff.orders.index')}
                                    className="text-[10px] font-black text-rose-600 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-xl transition"
                                >
                                    View Details
                                </Link>
                            </Td>
                        </Tr>
                    ))}
                </Table>
            </div>
        </MarketingSalesStaffLayout>
    );
}
