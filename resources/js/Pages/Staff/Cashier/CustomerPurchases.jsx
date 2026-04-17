import { useState, useMemo, useEffect, useRef } from 'react';
import CashierStaffLayout from '@/Layouts/CashierStaffLayout';
import { Head, router, Link, usePage } from '@inertiajs/react';
import Table, { Tr, Td } from '@/Components/Table';
import Pagination from '@/Components/Pagination';
import Alert from '@/Components/Alert';

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------
function statusBadge(status) {
    switch (status?.toLowerCase()) {
        case 'completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
        case 'cancelled': return 'bg-rose-50 text-rose-600 border-rose-100';
        case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
        case 'processing': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
        case 'shipping': return 'bg-blue-50 text-blue-600 border-blue-100';
        default: return 'bg-slate-100 text-slate-400 border-slate-200';
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP'
    }).format(amount);
}

// ---------------------------------------------------------------------------
// MAIN PAGE
// ---------------------------------------------------------------------------
export default function CustomerPurchases({ purchases, filters = {}, statuses = [], paymentMethods = [], flash = {} }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [statusFilter, setStatus] = useState(filters.status ?? 'All');
    const [paymentFilter, setPaymentMethod] = useState(filters.payment_method ?? 'All');
    const [alertMessage, setAlertMessage] = useState('');

    useEffect(() => {
        if (flash?.success) {
            setAlertMessage(flash.success);
            const timer = setTimeout(() => setAlertMessage(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    // Auto-filter logic
    const isInitialRender = useRef(true);
    useEffect(() => {
        if (isInitialRender.current) {
            isInitialRender.current = false;
            return;
        }
        const timeoutId = setTimeout(() => {
            router.get(route('staff.cashier.customer-purchases'), {
                search: search || undefined,
                status: statusFilter !== 'All' ? statusFilter : undefined,
                payment_method: paymentFilter !== 'All' ? paymentFilter : undefined,
            }, { preserveState: true, replace: true });
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [search, statusFilter, paymentFilter]);

    return (
        <CashierStaffLayout>
            <Head title="Customer Purchases — Cashier" />

            <Alert message={alertMessage} onClose={() => setAlertMessage('')} />

            <div className="space-y-6 animate-in fade-in duration-500 pb-12">
                {/* PAGE HEADER */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight text-center lg:text-left">Purchases List</h1>
                        <p className="text-slate-500 font-medium mt-1 text-center lg:text-left">
                            Comprehensive view of all customer orders and transaction line items.
                        </p>
                    </div>
                </div>

                {/* ADVANCED FILTERS SECTION (Product Index Inspired) */}
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 lg:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Search Input */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">
                                Search Everything
                            </label>
                            <div className="relative">
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Product, customer name..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full pl-9 pr-4 py-3 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition placeholder-slate-400"
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">
                                Filter by Status
                            </label>
                            <select
                                value={statusFilter}
                                onChange={e => setStatus(e.target.value)}
                                className="w-full px-4 py-3 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition appearance-none cursor-pointer"
                            >
                                <option value="All">All Statuses</option>
                                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        {/* Payment Method Filter */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">
                                Payment Method
                            </label>
                            <select
                                value={paymentFilter}
                                onChange={e => setPaymentMethod(e.target.value)}
                                className="w-full px-4 py-3 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition appearance-none cursor-pointer"
                            >
                                <option value="All">All Methods</option>
                                {paymentMethods.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* TABLE VIEW */}
                <Table
                    title="🛒 Purchase Line Items"
                    subtitle="Detailed breakdown of customer purchases"
                    badgeCount={purchases.total}
                    columns={['Product', 'Customer', 'Qty', 'Price', 'Total', 'Payment', 'Status', 'Date']}
                    emptyState={
                        <div className="flex flex-col items-center gap-2 py-16">
                            <div className="text-5xl opacity-20 text-slate-900 border-2 border-slate-100 p-4 rounded-full">🛒</div>
                            <p className="text-sm font-black text-slate-300 uppercase tracking-widest mt-4">No purchases found</p>
                            <button onClick={() => { setSearch(''); setStatus('All'); setPaymentMethod('All'); }} className="text-xs font-bold text-emerald-500 hover:underline">Clear all filters</button>
                        </div>
                    }
                    footer={
                        <div className="px-6 py-4 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-b-2xl">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                Page {purchases.current_page} of {purchases.last_page} · {purchases.total} Items
                            </p>
                            <Pagination
                                currentPage={purchases.current_page}
                                totalPages={purchases.last_page}
                                onPageChange={(page) => {
                                    router.get(route('staff.cashier.customer-purchases'), { search, status: statusFilter, payment_method: paymentFilter, page }, { preserveState: true, preserveScroll: true });
                                }}
                            />
                        </div>
                    }
                >
                    {purchases.data.map((order) => (
                        <Tr key={order.id} className="hover:bg-slate-50/50 transition-colors cursor-default group">
                            <Td>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden group-hover:scale-110 transition-transform">
                                        {order.product?.image_url ? (
                                            <img src={order.product.image_url} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-lg">🧶</span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-800 line-clamp-1 truncate w-40">
                                            {order.product?.product || 'Unknown Product'}
                                        </p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                            Ref: #{order.transaction?.reference_no}
                                        </p>
                                    </div>
                                </div>
                            </Td>
                            <Td>
                                <div className="flex flex-col">
                                    <p className="text-sm font-black text-slate-700">
                                        {order.transaction?.user?.first_name} {order.transaction?.user?.last_name}
                                    </p>
                                    <span className="text-[10px] text-slate-400 font-medium lowercase italic">
                                        {order.transaction?.user?.email}
                                    </span>
                                </div>
                            </Td>
                            <Td className="text-[11px] font-black text-slate-900">
                                x{order.quantity}
                            </Td>
                            <Td className="text-[11px] font-bold text-slate-600">
                                {formatCurrency(order.price_at_sale)}
                            </Td>
                            <Td className="text-sm font-black text-emerald-600">
                                {formatCurrency(order.quantity * order.price_at_sale)}
                            </Td>
                            <Td>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-600 uppercase">
                                        {order.transaction?.payment_method}
                                    </span>
                                    <span className="text-[9px] text-slate-400 font-medium">
                                        {order.transaction?.order_type || 'Walk-in'}
                                    </span>
                                </div>
                            </Td>
                            <Td>
                                <span className={`text-[9px] font-black px-2.5 py-1 rounded-full border uppercase tracking-wider ${statusBadge(order.status || 'Pending')}`}>
                                    {order.status || 'Pending'}
                                </span>
                            </Td>
                            <Td className="text-[10px] text-slate-400 font-bold whitespace-nowrap">
                                {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </Td>
                        </Tr>
                    ))}
                </Table>
            </div>
        </CashierStaffLayout>
    );
}
